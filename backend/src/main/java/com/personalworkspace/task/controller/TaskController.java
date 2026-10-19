package com.personalworkspace.task.controller;

import com.personalworkspace.common.util.SecurityUtils;
import com.personalworkspace.task.dto.CreateTaskRequest;
import com.personalworkspace.task.dto.TaskDto;
import com.personalworkspace.task.dto.TaskStatusUpdateRequest;
import com.personalworkspace.task.dto.UpdateTaskRequest;
import com.personalworkspace.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/tasks")
@Tag(name = "Tasks", description = "Görev Yönetimi")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    @Operation(summary = "Çalışma alanındaki görevleri filtreli ve sayfalı listeler")
    public ResponseEntity<Page<TaskDto>> getTasks(
            @PathVariable UUID workspaceId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {

        UUID userId = SecurityUtils.getCurrentUserId();
        Sort.Direction sortDir = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(sortDir, sort));

        Page<TaskDto> tasks = taskService.getTasks(workspaceId, userId, areaId, status, priority, pageable);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Belirtilen görevi döner")
    public ResponseEntity<TaskDto> getTask(
            @PathVariable UUID workspaceId,
            @PathVariable UUID taskId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(taskService.getTask(workspaceId, taskId, userId));
    }

    @PostMapping
    @Operation(summary = "Yeni görev oluşturur")
    public ResponseEntity<TaskDto> createTask(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateTaskRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        TaskDto created = taskService.createTask(workspaceId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{taskId}")
    @Operation(summary = "Görevi günceller (optimistic locking)")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable UUID workspaceId,
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(taskService.updateTask(workspaceId, taskId, request, userId));
    }

    @PatchMapping("/{taskId}/status")
    @Operation(summary = "Yalnızca görev durumunu günceller (optimistic locking)")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @PathVariable UUID workspaceId,
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(taskService.updateTaskStatus(workspaceId, taskId, request, userId));
    }

    @DeleteMapping("/{taskId}")
    @Operation(summary = "Görevi siler")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID workspaceId,
            @PathVariable UUID taskId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        taskService.deleteTask(workspaceId, taskId, userId);
        return ResponseEntity.noContent().build();
    }
}
