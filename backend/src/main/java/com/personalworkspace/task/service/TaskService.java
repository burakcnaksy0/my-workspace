package com.personalworkspace.task.service;

import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.common.util.SecurityUtils;
import com.personalworkspace.task.dto.CreateTaskRequest;
import com.personalworkspace.task.dto.TaskDto;
import com.personalworkspace.task.dto.TaskStatusUpdateRequest;
import com.personalworkspace.task.dto.UpdateTaskRequest;
import com.personalworkspace.task.entity.Task;
import com.personalworkspace.task.repository.TaskRepository;
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
import java.util.UUID;

@Service
@Transactional
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final AreaRepository areaRepository;
    private final WorkspaceAccessService accessService;

    public TaskService(
            TaskRepository taskRepository,
            AreaRepository areaRepository,
            WorkspaceAccessService accessService) {
        this.taskRepository = taskRepository;
        this.areaRepository = areaRepository;
        this.accessService = accessService;
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getTasks(UUID workspaceId, UUID userId,
                                  UUID areaId, String status, String priority,
                                  Pageable pageable) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        Page<Task> tasks = taskRepository.findByWorkspaceWithFilters(
                workspaceId, areaId, status, priority, pageable);
        return tasks.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(UUID workspaceId, UUID taskId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı: " + taskId));
        return toDto(task);
    }

    public TaskDto createTask(UUID workspaceId, CreateTaskRequest request, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        // Validate areaId belongs to workspace if provided
        if (request.areaId() != null) {
            areaRepository.findByIdAndWorkspaceId(request.areaId(), workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Alan bulunamadı: " + request.areaId()));
        }

        Task task = new Task();
        task.setWorkspaceId(workspaceId);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setStatus("TODO");
        task.setAreaId(request.areaId());
        task.setDueAt(request.dueAt());
        task.setCreatedBy(userId);

        task = taskRepository.save(task);
        log.info("Görev oluşturuldu: id={}, workspace={}, title='{}'", task.getId(), workspaceId, task.getTitle());
        return toDto(task);
    }

    public TaskDto updateTask(UUID workspaceId, UUID taskId, UpdateTaskRequest request, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı: " + taskId));

        // Optimistic locking check
        if (!task.getVersion().equals(request.version())) {
            throw new ConflictException(
                    "Görev başka bir yerden güncellenmiş. Mevcut sürüm: " + task.getVersion() +
                    ", gönderilen sürüm: " + request.version());
        }

        // Validate areaId belongs to workspace if provided
        if (request.areaId() != null) {
            areaRepository.findByIdAndWorkspaceId(request.areaId(), workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Alan bulunamadı: " + request.areaId()));
        }

        // Handle completed_at logic: when status changes to DONE, set completedAt
        String oldStatus = task.getStatus();
        String newStatus = request.status();

        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setStatus(newStatus);
        task.setAreaId(request.areaId());
        task.setDueAt(request.dueAt());

        applyCompletionLogic(task, oldStatus, newStatus);

        try {
            task = taskRepository.save(task);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Görev başka bir yerden eşzamanlı olarak güncellenmiş. Lütfen sayfayı yenileyip tekrar deneyin.");
        }

        log.info("Görev güncellendi: id={}, status={}", taskId, newStatus);
        return toDto(task);
    }

    public TaskDto updateTaskStatus(UUID workspaceId, UUID taskId, TaskStatusUpdateRequest request, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı: " + taskId));

        if (!task.getVersion().equals(request.version())) {
            throw new ConflictException(
                    "Görev başka bir yerden güncellenmiş. Mevcut sürüm: " + task.getVersion() +
                    ", gönderilen sürüm: " + request.version());
        }

        String oldStatus = task.getStatus();
        String newStatus = request.status();
        task.setStatus(newStatus);

        applyCompletionLogic(task, oldStatus, newStatus);

        try {
            task = taskRepository.save(task);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Görev başka bir yerden eşzamanlı olarak güncellenmiş.");
        }

        log.info("Görev durumu güncellendi: id={}, {} -> {}", taskId, oldStatus, newStatus);
        return toDto(task);
    }

    public void deleteTask(UUID workspaceId, UUID taskId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı: " + taskId));

        taskRepository.delete(task);
        log.info("Görev silindi: id={}", taskId);
    }

    /**
     * Handles completed_at logic:
     * - When status transitions to DONE: set completedAt to now
     * - When status transitions from DONE to something else: clear completedAt
     */
    private void applyCompletionLogic(Task task, String oldStatus, String newStatus) {
        if ("DONE".equals(newStatus) && !"DONE".equals(oldStatus)) {
            task.setCompletedAt(Instant.now());
        } else if (!"DONE".equals(newStatus) && "DONE".equals(oldStatus)) {
            task.setCompletedAt(null);
        }
    }

    private TaskDto toDto(Task t) {
        String areaName = null;
        if (t.getAreaId() != null) {
            areaName = areaRepository.findById(t.getAreaId())
                    .map(Area::getName)
                    .orElse(null);
        }

        return new TaskDto(
                t.getId(),
                t.getWorkspaceId(),
                t.getAreaId(),
                areaName,
                t.getTitle(),
                t.getDescription(),
                t.getStatus(),
                t.getPriority(),
                t.getDueAt(),
                t.getCompletedAt(),
                t.getCreatedBy(),
                t.getVersion(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
