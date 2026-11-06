package com.personalworkspace.contentlink.service;

import com.personalworkspace.common.exception.BadRequestException;
import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.contentlink.dto.ContentLinkDto;
import com.personalworkspace.contentlink.dto.CreateContentLinkRequest;
import com.personalworkspace.contentlink.entity.ContentLink;
import com.personalworkspace.contentlink.entity.ContentRefType;
import com.personalworkspace.contentlink.repository.ContentLinkRepository;
import com.personalworkspace.drawings.repository.DrawingRepository;
import com.personalworkspace.notes.repository.NoteRepository;
import com.personalworkspace.task.repository.TaskRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * İçerikler arası çapraz referans (ContentLink) iş mantığı.
 * Bağlantılar yönsüzdür: uçlar kanonik sıraya (tür, id) göre saklanır,
 * sorguda her iki yön birlikte döner. Uç içerikler silindiğinde
 * bağlantılar {@link #removeLinksFor} ile temizlenir; yine de yetim kalırsa
 * okuma tarafı "Silinmiş içerik" olarak işaretler.
 */
@Service
@Transactional(readOnly = true)
public class ContentLinkService {

    private static final String DELETED_TITLE = "Silinmiş içerik";

    private final ContentLinkRepository linkRepository;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final DrawingRepository drawingRepository;
    private final WorkspaceAccessService workspaceAccessService;

    public ContentLinkService(
            ContentLinkRepository linkRepository,
            TaskRepository taskRepository,
            NoteRepository noteRepository,
            DrawingRepository drawingRepository,
            WorkspaceAccessService workspaceAccessService) {
        this.linkRepository = linkRepository;
        this.taskRepository = taskRepository;
        this.noteRepository = noteRepository;
        this.drawingRepository = drawingRepository;
        this.workspaceAccessService = workspaceAccessService;
    }

    @Transactional
    public ContentLinkDto create(UUID workspaceId, CreateContentLinkRequest request, UUID userId) {
        workspaceAccessService.checkWorkspaceAccess(workspaceId, userId);

        ContentRefType sourceType = ContentRefType.valueOf(request.sourceType());
        ContentRefType targetType = ContentRefType.valueOf(request.targetType());

        if (sourceType == targetType && request.sourceId().equals(request.targetId())) {
            throw new BadRequestException("Bir içerik kendine bağlanamaz.");
        }

        requireContentInWorkspace(workspaceId, sourceType, request.sourceId(), "Kaynak");
        requireContentInWorkspace(workspaceId, targetType, request.targetId(), "Hedef");

        // Yönsüz tekilleştirme: uçları kanonik sıraya getir (önce tür adı, sonra id)
        ContentRefType aType = sourceType;
        UUID aId = request.sourceId();
        ContentRefType bType = targetType;
        UUID bId = request.targetId();
        if (compareRef(bType, bId, aType, aId) < 0) {
            ContentRefType t = aType; aType = bType; bType = t;
            UUID i = aId; aId = bId; bId = i;
        }

        if (linkRepository.existsByWorkspaceIdAndSourceTypeAndSourceIdAndTargetTypeAndTargetId(
                workspaceId, aType, aId, bType, bId)) {
            throw new ConflictException("Bu içerikler zaten birbirine bağlı.");
        }

        ContentLink link = new ContentLink();
        link.setWorkspaceId(workspaceId);
        link.setSourceType(aType);
        link.setSourceId(aId);
        link.setTargetType(bType);
        link.setTargetId(bId);
        link.setLabel(request.label());
        link.setCreatedBy(userId);

        return toDto(linkRepository.save(link));
    }

    /** Verilen içeriğe bağlı tüm bağlantılar (her iki yön dahil). */
    public List<ContentLinkDto> listRelated(UUID workspaceId, ContentRefType refType, UUID refId, UUID userId) {
        workspaceAccessService.checkWorkspaceAccess(workspaceId, userId);
        return linkRepository.findAllRelated(workspaceId, refType, refId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void delete(UUID workspaceId, UUID linkId, UUID userId) {
        workspaceAccessService.checkWorkspaceAccess(workspaceId, userId);
        ContentLink link = linkRepository.findById(linkId)
                .filter(l -> l.getWorkspaceId().equals(workspaceId))
                .orElseThrow(() -> new ResourceNotFoundException("Bağlantı bulunamadı"));
        linkRepository.delete(link);
    }

    /** İçerik kalıcı silindiğinde iki yöndeki bağlantıları da temizler. */
    @Transactional
    public void removeLinksFor(ContentRefType type, UUID refId) {
        linkRepository.deleteBySourceTypeAndSourceId(type, refId);
        linkRepository.deleteByTargetTypeAndTargetId(type, refId);
    }

    private void requireContentInWorkspace(UUID workspaceId, ContentRefType type, UUID id, String label) {
        boolean exists = switch (type) {
            case TASK -> taskRepository.findById(id)
                    .filter(t -> t.getWorkspaceId().equals(workspaceId)).isPresent();
            case NOTE -> noteRepository.findById(id)
                    .filter(n -> n.getWorkspaceId().equals(workspaceId)).isPresent();
            case DRAWING -> drawingRepository.findById(id)
                    .filter(d -> d.getWorkspaceId().equals(workspaceId)).isPresent();
        };
        if (!exists) {
            throw new ResourceNotFoundException(label + " içerik bu çalışma alanında bulunamadı: " + id);
        }
    }

    private String resolveTitle(ContentRefType type, UUID id) {
        return switch (type) {
            case TASK -> taskRepository.findById(id).map(t -> t.getTitle()).orElse(null);
            case NOTE -> noteRepository.findById(id).map(n -> n.getTitle()).orElse(null);
            case DRAWING -> drawingRepository.findById(id).map(d -> d.getTitle()).orElse(null);
        };
    }

    private ContentLinkDto toDto(ContentLink link) {
        String sourceTitle = resolveTitle(link.getSourceType(), link.getSourceId());
        String targetTitle = resolveTitle(link.getTargetType(), link.getTargetId());
        return new ContentLinkDto(
                link.getId(),
                link.getWorkspaceId(),
                link.getSourceType().name(),
                link.getSourceId(),
                sourceTitle != null ? sourceTitle : DELETED_TITLE,
                sourceTitle != null,
                link.getTargetType().name(),
                link.getTargetId(),
                targetTitle != null ? targetTitle : DELETED_TITLE,
                targetTitle != null,
                link.getLabel(),
                link.getCreatedAt()
        );
    }

    /** (tür adı, id) çiftlerini sözlüksel sıralar; yönsüz bağlantı tekilleştirmesi için. */
    private static int compareRef(ContentRefType typeA, UUID idA, ContentRefType typeB, UUID idB) {
        int byType = typeA.name().compareTo(typeB.name());
        return byType != 0 ? byType : idA.compareTo(idB);
    }
}
