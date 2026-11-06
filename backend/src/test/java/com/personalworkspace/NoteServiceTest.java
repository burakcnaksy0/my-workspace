package com.personalworkspace;

import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.notes.dto.CreateNoteRequest;
import com.personalworkspace.notes.dto.NoteDto;
import com.personalworkspace.notes.dto.NoteSummaryDto;
import com.personalworkspace.notes.dto.UpdateNoteRequest;
import com.personalworkspace.notes.entity.Note;
import com.personalworkspace.notes.entity.Tag;
import com.personalworkspace.notes.repository.NoteRepository;
import com.personalworkspace.notes.repository.TagRepository;
import com.personalworkspace.notes.service.NoteService;
import com.personalworkspace.workspace.entity.Area;
import com.personalworkspace.workspace.repository.AreaRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private AreaRepository areaRepository;

    @Mock
    private WorkspaceAccessService accessService;

    @Mock
    private com.personalworkspace.boards.repository.BoardItemRepository boardItemRepository;

    @Mock
    private com.personalworkspace.contentlink.service.ContentLinkService contentLinkService;

    private NoteService noteService;

    private final UUID workspaceId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final UUID areaId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        noteService = new NoteService(noteRepository, tagRepository, areaRepository, accessService, boardItemRepository, contentLinkService);
    }

    @Test
    @DisplayName("createNote: creates note with tags and returns NoteDto")
    void createNote_success() {
        CreateNoteRequest request = new CreateNoteRequest(
                "Yazılım Mimarisi Notları",
                areaId,
                "{\"type\":\"doc\",\"content\":[]}",
                "Yazılım mimarisi temel prensipleri",
                "tiptap-json-v1",
                Set.of("mimari", "backend")
        );

        Area mockArea = new Area(workspaceId, "Yazılım Öğrenimi", "code", "#8b5cf6", 0);
        when(areaRepository.findById(areaId)).thenReturn(Optional.of(mockArea));

        when(tagRepository.findByWorkspaceIdAndName(eq(workspaceId), anyString()))
                .thenAnswer(inv -> {
                    String name = inv.getArgument(1);
                    return Optional.of(new Tag(workspaceId, name));
                });

        when(noteRepository.save(any(Note.class))).thenAnswer(inv -> {
            Note n = inv.getArgument(0);
            n.setId(UUID.randomUUID());
            n.setVersion(0L);
            return n;
        });

        NoteDto result = noteService.createNote(workspaceId, userId, request);

        assertNotNull(result);
        assertEquals("Yazılım Mimarisi Notları", result.title());
        assertEquals("tiptap-json-v1", result.contentFormat());
        assertEquals(2, result.tags().size());
        verify(accessService).checkWorkspaceAccess(workspaceId, userId);
        verify(noteRepository).save(any(Note.class));
    }

    @Test
    @DisplayName("updateNote: successfully updates note content and tags")
    void updateNote_success() {
        UUID noteId = UUID.randomUUID();
        Note existing = new Note();
        existing.setId(noteId);
        existing.setWorkspaceId(workspaceId);
        existing.setTitle("Eski Başlık");
        existing.setVersion(1L);

        when(noteRepository.findByIdAndWorkspaceId(noteId, workspaceId)).thenReturn(Optional.of(existing));
        when(noteRepository.saveAndFlush(any(Note.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateNoteRequest request = new UpdateNoteRequest(
                "Yeni Başlık",
                null,
                "{\"type\":\"doc\"}",
                "Yeni düz metin",
                "tiptap-json-v1",
                Set.of(),
                1L
        );

        NoteDto updated = noteService.updateNote(workspaceId, noteId, userId, request);

        assertNotNull(updated);
        assertEquals("Yeni Başlık", updated.title());
        assertEquals("Yeni düz metin", updated.contentText());
        verify(noteRepository).saveAndFlush(existing);
    }

    @Test
    @DisplayName("updateNote: throws ConflictException when version does not match")
    void updateNote_versionConflict_throwsException() {
        UUID noteId = UUID.randomUUID();
        Note existing = new Note();
        existing.setId(noteId);
        existing.setWorkspaceId(workspaceId);
        existing.setTitle("Eski Başlık");
        existing.setVersion(2L); // Current version in DB is 2

        when(noteRepository.findByIdAndWorkspaceId(noteId, workspaceId)).thenReturn(Optional.of(existing));

        UpdateNoteRequest request = new UpdateNoteRequest(
                "Yeni Başlık",
                null,
                "{}",
                "Metin",
                "tiptap-json-v1",
                Set.of(),
                1L // Client sent outdated version 1
        );

        assertThrows(ConflictException.class, () ->
                noteService.updateNote(workspaceId, noteId, userId, request)
        );
        verify(noteRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("getNote: throws ResourceNotFoundException when note does not exist")
    void getNote_notFound_throwsException() {
        UUID noteId = UUID.randomUUID();
        when(noteRepository.findByIdAndWorkspaceId(noteId, workspaceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                noteService.getNote(workspaceId, noteId, userId)
        );
    }

    @Test
    @DisplayName("listNotes: calls searchNotes with filter and returns page of summaries")
    void listNotes_success() {
        Note note = new Note();
        note.setId(UUID.randomUUID());
        note.setWorkspaceId(workspaceId);
        note.setTitle("Docker ve K8s");
        note.setContentText("Konteyner mimarisi");
        note.setCreatedAt(Instant.now());
        note.setUpdatedAt(Instant.now());

        Page<Note> page = new PageImpl<>(List.of(note));
        when(noteRepository.searchNotes(eq(workspaceId), isNull(), eq("devops"), eq("docker"), any(Pageable.class)))
                .thenReturn(page);

        Page<NoteSummaryDto> result = noteService.listNotes(
                workspaceId, userId, "docker", null, "devops", PageRequest.of(0, 10)
        );

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Docker ve K8s", result.getContent().get(0).title());
    }

    @Test
    @DisplayName("deleteNote: deletes existing note")
    void deleteNote_success() {
        UUID noteId = UUID.randomUUID();
        Note existing = new Note();
        existing.setId(noteId);
        existing.setWorkspaceId(workspaceId);

        when(noteRepository.findByIdAndWorkspaceId(noteId, workspaceId)).thenReturn(Optional.of(existing));

        noteService.deleteNote(workspaceId, noteId, userId);

        verify(noteRepository).delete(existing);
    }
}
