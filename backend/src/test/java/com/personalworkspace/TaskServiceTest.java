package com.personalworkspace;

import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.task.dto.CreateTaskRequest;
import com.personalworkspace.task.dto.TaskDto;
import com.personalworkspace.task.dto.TaskStatusUpdateRequest;
import com.personalworkspace.task.dto.UpdateTaskRequest;
import com.personalworkspace.task.entity.Task;
import com.personalworkspace.task.repository.TaskRepository;
import com.personalworkspace.task.service.TaskService;
import com.personalworkspace.workspace.entity.Area;
import com.personalworkspace.workspace.entity.Membership;
import com.personalworkspace.workspace.repository.AreaRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private AreaRepository areaRepository;

    @Mock
    private WorkspaceAccessService accessService;

    @Mock
    private com.personalworkspace.boards.repository.BoardItemRepository boardItemRepository;

    @Mock
    private com.personalworkspace.contentlink.service.ContentLinkService contentLinkService;

    @InjectMocks
    private TaskService taskService;

    private UUID workspaceId;
    private UUID userId;
    private UUID areaId;
    private Membership mockMembership;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        userId = UUID.randomUUID();
        areaId = UUID.randomUUID();
        mockMembership = new Membership(workspaceId, userId, "OWNER");
    }

    @Test
    @DisplayName("Görev oluşturma - başarılı")
    void createTask_success() {
        when(accessService.checkWorkspaceAccess(workspaceId, userId)).thenReturn(mockMembership);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        CreateTaskRequest request = new CreateTaskRequest(
                "Test Görevi", "Açıklama", "HIGH", areaId, null
        );

        when(areaRepository.findByIdAndWorkspaceId(areaId, workspaceId))
                .thenReturn(Optional.of(new Area(workspaceId, "Test Alan", "folder", "#3b82f6", 0)));

        TaskDto result = taskService.createTask(workspaceId, request, userId);

        assertNotNull(result);
        assertEquals("Test Görevi", result.title());
        assertEquals("HIGH", result.priority());
        assertEquals("TODO", result.status());
        assertNull(result.completedAt());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("Görev oluşturma - yetkisiz çalışma alanı erişimi")
    void createTask_unauthorizedWorkspace() {
        when(accessService.checkWorkspaceAccess(workspaceId, userId))
                .thenThrow(new ResourceNotFoundException("Çalışma alanı bulunamadı"));

        CreateTaskRequest request = new CreateTaskRequest(
                "Test Görevi", null, "MEDIUM", null, null
        );

        assertThrows(ResourceNotFoundException.class,
                () -> taskService.createTask(workspaceId, request, userId));
    }

    @Test
    @DisplayName("Durum DONE olduğunda completedAt otomatik ayarlanır")
    void updateStatus_toDone_setsCompletedAt() {
        Task task = createMockTask("TODO");
        when(accessService.checkWorkspaceAccess(workspaceId, userId)).thenReturn(mockMembership);
        when(taskRepository.findByIdAndWorkspaceId(task.getId(), workspaceId)).thenReturn(Optional.of(task));
        when(taskRepository.saveAndFlush(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskStatusUpdateRequest request = new TaskStatusUpdateRequest("DONE", 0L);
        TaskDto result = taskService.updateTaskStatus(workspaceId, task.getId(), request, userId);

        assertEquals("DONE", result.status());
        assertNotNull(result.completedAt());
    }

    @Test
    @DisplayName("Durum DONE'dan TODO'ya döndüğünde completedAt temizlenir")
    void updateStatus_fromDone_clearsCompletedAt() {
        Task task = createMockTask("DONE");
        task.setCompletedAt(Instant.now());

        when(accessService.checkWorkspaceAccess(workspaceId, userId)).thenReturn(mockMembership);
        when(taskRepository.findByIdAndWorkspaceId(task.getId(), workspaceId)).thenReturn(Optional.of(task));
        when(taskRepository.saveAndFlush(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskStatusUpdateRequest request = new TaskStatusUpdateRequest("TODO", 0L);
        TaskDto result = taskService.updateTaskStatus(workspaceId, task.getId(), request, userId);

        assertEquals("TODO", result.status());
        assertNull(result.completedAt());
    }

    @Test
    @DisplayName("Version uyuşmazlığında ConflictException fırlatılır")
    void updateTask_versionMismatch_throwsConflict() {
        Task task = createMockTask("TODO");
        task.setVersion(5L);

        when(accessService.checkWorkspaceAccess(workspaceId, userId)).thenReturn(mockMembership);
        when(taskRepository.findByIdAndWorkspaceId(task.getId(), workspaceId)).thenReturn(Optional.of(task));

        UpdateTaskRequest request = new UpdateTaskRequest(
                "Updated", null, "MEDIUM", "TODO", null, null, 3L // wrong version
        );

        assertThrows(ConflictException.class,
                () -> taskService.updateTask(workspaceId, task.getId(), request, userId));
    }

    @Test
    @DisplayName("Görev silme - başarılı")
    void deleteTask_success() {
        Task task = createMockTask("TODO");

        when(accessService.checkWorkspaceAccess(workspaceId, userId)).thenReturn(mockMembership);
        when(taskRepository.findByIdAndWorkspaceId(task.getId(), workspaceId)).thenReturn(Optional.of(task));

        assertDoesNotThrow(() -> taskService.deleteTask(workspaceId, task.getId(), userId));
        verify(taskRepository).delete(task);
    }

    @Test
    @DisplayName("Görev silme - bulunamadı")
    void deleteTask_notFound() {
        UUID fakeId = UUID.randomUUID();

        when(accessService.checkWorkspaceAccess(workspaceId, userId)).thenReturn(mockMembership);
        when(taskRepository.findByIdAndWorkspaceId(fakeId, workspaceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> taskService.deleteTask(workspaceId, fakeId, userId));
    }

    @Test
    @DisplayName("Görev güncelleme - tam güncelleme başarılı")
    void updateTask_fullUpdate_success() {
        Task task = createMockTask("TODO");
        Area area = new Area(workspaceId, "Kariyer", "briefcase", "#3b82f6", 0);

        when(accessService.checkWorkspaceAccess(workspaceId, userId)).thenReturn(mockMembership);
        when(taskRepository.findByIdAndWorkspaceId(task.getId(), workspaceId)).thenReturn(Optional.of(task));
        when(areaRepository.findByIdAndWorkspaceId(areaId, workspaceId)).thenReturn(Optional.of(area));
        when(taskRepository.saveAndFlush(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Instant dueDate = Instant.now().plusSeconds(86400);
        UpdateTaskRequest request = new UpdateTaskRequest(
                "Güncellenen Başlık", "Yeni açıklama", "HIGH", "IN_PROGRESS",
                areaId, dueDate, 0L
        );

        TaskDto result = taskService.updateTask(workspaceId, task.getId(), request, userId);

        assertEquals("Güncellenen Başlık", result.title());
        assertEquals("HIGH", result.priority());
        assertEquals("IN_PROGRESS", result.status());
        assertNull(result.completedAt()); // Not DONE, so no completedAt
    }

    private Task createMockTask(String status) {
        Task task = new Task();
        task.setId(UUID.randomUUID());
        task.setWorkspaceId(workspaceId);
        task.setTitle("Test Task");
        task.setStatus(status);
        task.setPriority("MEDIUM");
        task.setCreatedBy(userId);
        task.setVersion(0L);
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());
        return task;
    }
}
