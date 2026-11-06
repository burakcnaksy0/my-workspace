package com.personalworkspace;

import com.personalworkspace.common.exception.BadRequestException;
import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.contentlink.dto.ContentLinkDto;
import com.personalworkspace.contentlink.dto.CreateContentLinkRequest;
import com.personalworkspace.contentlink.entity.ContentLink;
import com.personalworkspace.contentlink.entity.ContentRefType;
import com.personalworkspace.contentlink.repository.ContentLinkRepository;
import com.personalworkspace.contentlink.service.ContentLinkService;
import com.personalworkspace.drawings.entity.DrawingDocument;
import com.personalworkspace.drawings.repository.DrawingRepository;
import com.personalworkspace.notes.entity.Note;
import com.personalworkspace.notes.repository.NoteRepository;
import com.personalworkspace.task.entity.Task;
import com.personalworkspace.task.repository.TaskRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentLinkServiceTest {

    @Mock
    private ContentLinkRepository linkRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private DrawingRepository drawingRepository;

    @Mock
    private WorkspaceAccessService accessService;

    private ContentLinkService contentLinkService;

    private final UUID workspaceId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final UUID taskId = UUID.randomUUID();
    private final UUID noteId = UUID.randomUUID();
    private final UUID drawingId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        contentLinkService = new ContentLinkService(
                linkRepository, taskRepository, noteRepository, drawingRepository, accessService);
    }

    private Task task(UUID id, UUID ws) {
        Task t = new Task();
        t.setId(id);
        t.setWorkspaceId(ws);
        t.setTitle("Görev " + id.toString().substring(0, 4));
        return t;
    }

    private Note note(UUID id, UUID ws) {
        Note n = new Note();
        n.setId(id);
        n.setWorkspaceId(ws);
        n.setTitle("Not " + id.toString().substring(0, 4));
        return n;
    }

    @Test
    @DisplayName("create: geçerli iki içerik arasında bağlantı kurar ve başlıkları çözer")
    void create_success() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task(taskId, workspaceId)));
        when(noteRepository.findById(noteId)).thenReturn(Optional.of(note(noteId, workspaceId)));
        when(linkRepository.existsByWorkspaceIdAndSourceTypeAndSourceIdAndTargetTypeAndTargetId(
                any(), any(), any(), any(), any())).thenReturn(false);
        when(linkRepository.save(any(ContentLink.class))).thenAnswer(inv -> inv.getArgument(0));

        ContentLinkDto dto = contentLinkService.create(workspaceId,
                new CreateContentLinkRequest("TASK", taskId, "NOTE", noteId, "ilgili"), userId);

        assertThat(dto.sourceExists()).isTrue();
        assertThat(dto.targetExists()).isTrue();
        assertThat(dto.label()).isEqualTo("ilgili");
        verify(accessService).checkWorkspaceAccess(workspaceId, userId);
    }

    @Test
    @DisplayName("create: uçlar kanonik sıraya getirilir (yönsüz tekilleştirme)")
    void create_canonicalizes_endpoints() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task(taskId, workspaceId)));
        when(noteRepository.findById(noteId)).thenReturn(Optional.of(note(noteId, workspaceId)));
        when(linkRepository.save(any(ContentLink.class))).thenAnswer(inv -> inv.getArgument(0));

        // NOTE -> TASK gönderilir; 'DRAWING' < 'NOTE' < 'TASK' olduğundan kanonik yön NOT->TASK kalmalı,
        // ama sıralama tür adına göre: NOTE < TASK => source=NOTE, target=TASK
        contentLinkService.create(workspaceId,
                new CreateContentLinkRequest("TASK", taskId, "NOTE", noteId, null), userId);

        ArgumentCaptor<ContentLink> captor = ArgumentCaptor.forClass(ContentLink.class);
        verify(linkRepository).save(captor.capture());
        ContentLink saved = captor.getValue();
        assertThat(saved.getSourceType()).isEqualTo(ContentRefType.NOTE);
        assertThat(saved.getSourceId()).isEqualTo(noteId);
        assertThat(saved.getTargetType()).isEqualTo(ContentRefType.TASK);
        assertThat(saved.getTargetId()).isEqualTo(taskId);
    }

    @Test
    @DisplayName("create: ters yönden tekrar bağlanmaya çalışmak 409 üretir")
    void create_duplicateReverse_conflict() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task(taskId, workspaceId)));
        when(noteRepository.findById(noteId)).thenReturn(Optional.of(note(noteId, workspaceId)));
        when(linkRepository.existsByWorkspaceIdAndSourceTypeAndSourceIdAndTargetTypeAndTargetId(
                workspaceId, ContentRefType.NOTE, noteId, ContentRefType.TASK, taskId)).thenReturn(true);

        assertThatThrownBy(() -> contentLinkService.create(workspaceId,
                new CreateContentLinkRequest("TASK", taskId, "NOTE", noteId, null), userId))
                .isInstanceOf(ConflictException.class);

        verify(linkRepository, never()).save(any());
    }

    @Test
    @DisplayName("create: kendi kendine bağlantı 400 üretir")
    void create_selfLink_badRequest() {
        assertThatThrownBy(() -> contentLinkService.create(workspaceId,
                new CreateContentLinkRequest("NOTE", noteId, "NOTE", noteId, null), userId))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("create: başka çalışma alanındaki hedef içerik 404 üretir")
    void create_foreignTarget_notFound() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task(taskId, workspaceId)));
        when(noteRepository.findById(noteId)).thenReturn(Optional.of(note(noteId, UUID.randomUUID())));

        assertThatThrownBy(() -> contentLinkService.create(workspaceId,
                new CreateContentLinkRequest("TASK", taskId, "NOTE", noteId, null), userId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("listRelated: silinmiş uç 'Silinmiş içerik' olarak işaretlenir")
    void listRelated_marksDeletedTargets() {
        ContentLink link = new ContentLink();
        link.setId(UUID.randomUUID());
        link.setWorkspaceId(workspaceId);
        link.setSourceType(ContentRefType.TASK);
        link.setSourceId(taskId);
        link.setTargetType(ContentRefType.DRAWING);
        link.setTargetId(drawingId);

        when(linkRepository.findAllRelated(workspaceId, ContentRefType.TASK, taskId))
                .thenReturn(List.of(link));
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task(taskId, workspaceId)));
        when(drawingRepository.findById(drawingId)).thenReturn(Optional.empty());

        List<ContentLinkDto> result =
                contentLinkService.listRelated(workspaceId, ContentRefType.TASK, taskId, userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).targetExists()).isFalse();
        assertThat(result.get(0).targetTitle()).isEqualTo("Silinmiş içerik");
        assertThat(result.get(0).sourceTitle()).startsWith("Görev");
    }

    @Test
    @DisplayName("delete: başka workspace'e ait bağlantı 404 üretir")
    void delete_otherWorkspace_notFound() {
        ContentLink link = new ContentLink();
        link.setId(UUID.randomUUID());
        link.setWorkspaceId(UUID.randomUUID()); // başka workspace

        when(linkRepository.findById(link.getId())).thenReturn(Optional.of(link));

        assertThatThrownBy(() -> contentLinkService.delete(workspaceId, link.getId(), userId))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(linkRepository, never()).delete(any(ContentLink.class));
    }

    @Test
    @DisplayName("removeLinksFor: her iki yön de temizlenir")
    void removeLinksFor_bothDirections() {
        contentLinkService.removeLinksFor(ContentRefType.NOTE, noteId);

        verify(linkRepository).deleteBySourceTypeAndSourceId(ContentRefType.NOTE, noteId);
        verify(linkRepository).deleteByTargetTypeAndTargetId(ContentRefType.NOTE, noteId);
    }
}
