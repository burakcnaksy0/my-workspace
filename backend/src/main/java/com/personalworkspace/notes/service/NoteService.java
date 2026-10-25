package com.personalworkspace.notes.service;

import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.notes.dto.CreateNoteRequest;
import com.personalworkspace.notes.dto.NoteDto;
import com.personalworkspace.notes.dto.NoteSummaryDto;
import com.personalworkspace.notes.dto.TagDto;
import com.personalworkspace.notes.dto.UpdateNoteRequest;
import com.personalworkspace.notes.entity.Note;
import com.personalworkspace.notes.entity.Tag;
import com.personalworkspace.notes.repository.NoteRepository;
import com.personalworkspace.notes.repository.TagRepository;
import com.personalworkspace.workspace.entity.Area;
import com.personalworkspace.workspace.repository.AreaRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class NoteService {

    private static final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final NoteRepository noteRepository;
    private final TagRepository tagRepository;
    private final AreaRepository areaRepository;
    private final WorkspaceAccessService accessService;
    private final com.personalworkspace.boards.repository.BoardItemRepository boardItemRepository;

    public NoteService(
            NoteRepository noteRepository,
            TagRepository tagRepository,
            AreaRepository areaRepository,
            WorkspaceAccessService accessService,
            com.personalworkspace.boards.repository.BoardItemRepository boardItemRepository) {
        this.noteRepository = noteRepository;
        this.tagRepository = tagRepository;
        this.areaRepository = areaRepository;
        this.accessService = accessService;
        this.boardItemRepository = boardItemRepository;
    }

    public NoteDto createNote(UUID workspaceId, UUID userId, CreateNoteRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        UUID areaId = validateArea(workspaceId, req.areaId());

        Note note = new Note();
        note.setWorkspaceId(workspaceId);
        note.setAreaId(areaId);
        note.setTitle(req.title().trim());
        note.setContent(req.content());
        note.setContentText(req.contentText());
        if (req.contentFormat() != null && !req.contentFormat().isBlank()) {
            note.setContentFormat(req.contentFormat().trim());
        }
        note.setCreatedBy(userId);
        note.setCreatedAt(Instant.now());
        note.setUpdatedAt(Instant.now());

        if (req.tags() != null && !req.tags().isEmpty()) {
            note.setTags(resolveTags(workspaceId, req.tags()));
        }

        Note saved = noteRepository.save(note);
        log.info("Not oluşturuldu: id={}, workspace={}, title='{}'", saved.getId(), workspaceId, saved.getTitle());
        return NoteDto.fromEntity(saved);
    }

    public NoteDto updateNote(UUID workspaceId, UUID noteId, UUID userId, UpdateNoteRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Note note = noteRepository.findByIdAndWorkspaceId(noteId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Not bulunamadı: " + noteId));

        if (req.version() != null && !note.getVersion().equals(req.version())) {
            throw new ConflictException(
                "Bu not başka bir sekme veya işlem tarafından güncellendi. " +
                "Mevcut sürüm: " + note.getVersion() + ", Gönderilen: " + req.version() + ". " +
                "Lütfen güncel veriyi yükleyip tekrar deneyin."
            );
        }

        UUID areaId = validateArea(workspaceId, req.areaId());

        note.setTitle(req.title().trim());
        note.setAreaId(areaId);
        note.setContent(req.content());
        note.setContentText(req.contentText());
        if (req.contentFormat() != null && !req.contentFormat().isBlank()) {
            note.setContentFormat(req.contentFormat().trim());
        }
        note.setUpdatedAt(Instant.now());

        if (req.tags() != null) {
            note.setTags(resolveTags(workspaceId, req.tags()));
        }

        try {
            Note saved = noteRepository.saveAndFlush(note);
            log.info("Not güncellendi: id={}, version={}", saved.getId(), saved.getVersion());
            return NoteDto.fromEntity(saved);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException(
                "Eşzamanlı düzenleme çakışması tespit edildi. " +
                "Lütfen sayfayı yenileyip en güncel not içeriğini kontrol edin."
            );
        }
    }

    @Transactional(readOnly = true)
    public NoteDto getNote(UUID workspaceId, UUID noteId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Note note = noteRepository.findByIdAndWorkspaceId(noteId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Not bulunamadı: " + noteId));

        return NoteDto.fromEntity(note);
    }

    @Transactional(readOnly = true)
    public Page<NoteSummaryDto> listNotes(UUID workspaceId, UUID userId, String q, UUID areaId, String tag, Pageable pageable) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        String searchQuery = (q != null && !q.trim().isEmpty()) ? q.trim() : null;
        String tagFilter = (tag != null && !tag.trim().isEmpty()) ? tag.trim() : null;

        return noteRepository.searchNotes(workspaceId, areaId, tagFilter, searchQuery, pageable)
                .map(NoteSummaryDto::fromEntity);
    }

    public void deleteNote(UUID workspaceId, UUID noteId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Note note = noteRepository.findByIdAndWorkspaceId(noteId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Not bulunamadı: " + noteId));

        boardItemRepository.deleteByItemTypeAndItemId("NOTE", noteId);
        noteRepository.delete(note);
        log.info("Not silindi (panolardaki kartlar temizlendi): id={}", noteId);
    }

    @Transactional(readOnly = true)
    public List<TagDto> listTags(UUID workspaceId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        return tagRepository.findByWorkspaceIdOrderByNameAsc(workspaceId)
                .stream()
                .map(TagDto::fromEntity)
                .toList();
    }

    private Set<Tag> resolveTags(UUID workspaceId, Set<String> tagNames) {
        Set<Tag> resolved = new HashSet<>();
        for (String rawName : tagNames) {
            if (rawName == null || rawName.trim().isEmpty()) continue;
            String normalized = rawName.trim().toLowerCase();
            Tag tag = tagRepository.findByWorkspaceIdAndName(workspaceId, normalized)
                    .orElseGet(() -> tagRepository.save(new Tag(workspaceId, normalized)));
            resolved.add(tag);
        }
        return resolved;
    }

    private UUID validateArea(UUID workspaceId, UUID areaId) {
        if (areaId == null) {
            return null;
        }
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Belirtilen alan bulunamadı: " + areaId));
        if (!area.getWorkspaceId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Alan bu çalışma alanına ait değil");
        }
        return areaId;
    }
}
