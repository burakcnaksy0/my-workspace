package com.personalworkspace.dashboard.service;

import com.personalworkspace.dashboard.dto.DashboardDto;
import com.personalworkspace.notes.dto.NoteSummaryDto;
import com.personalworkspace.notes.repository.NoteRepository;
import com.personalworkspace.task.dto.TaskDto;
import com.personalworkspace.task.entity.Task;
import com.personalworkspace.task.repository.TaskRepository;
import com.personalworkspace.workspace.entity.Area;
import com.personalworkspace.workspace.repository.AreaRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final AreaRepository areaRepository;
    private final WorkspaceAccessService accessService;

    public DashboardService(
            TaskRepository taskRepository,
            NoteRepository noteRepository,
            AreaRepository areaRepository,
            WorkspaceAccessService accessService) {
        this.taskRepository = taskRepository;
        this.noteRepository = noteRepository;
        this.areaRepository = areaRepository;
        this.accessService = accessService;
    }

    public DashboardDto getDashboard(UUID workspaceId, UUID userId, String timezone) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Instant now = Instant.now();

        // Calculate end of today in user's timezone
        ZoneId zoneId;
        try {
            zoneId = ZoneId.of(timezone);
        } catch (Exception e) {
            zoneId = ZoneId.of("Europe/Istanbul");
        }
        ZonedDateTime endOfDay = ZonedDateTime.now(zoneId)
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        Instant endOfDayInstant = endOfDay.toInstant();

        // Aggregation counts
        long totalTasks = taskRepository.countByWorkspaceId(workspaceId);
        long todoCount = taskRepository.countByWorkspaceIdAndStatus(workspaceId, "TODO");
        long inProgressCount = taskRepository.countByWorkspaceIdAndStatus(workspaceId, "IN_PROGRESS");
        long doneCount = taskRepository.countByWorkspaceIdAndStatus(workspaceId, "DONE");

        // Overdue tasks
        List<Task> overdueTasks = taskRepository.findOverdueTasks(workspaceId, now);

        // Due today
        List<Task> dueTodayTasks = taskRepository.findDueToday(workspaceId, now, endOfDayInstant);

        // Recently completed (last 7 days)
        Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
        List<Task> recentlyCompleted = taskRepository.findRecentlyCompleted(workspaceId, sevenDaysAgo);

        // Notes summary
        long totalNotes = noteRepository.countByWorkspaceId(workspaceId);
        List<NoteSummaryDto> recentNotes = noteRepository.findTop5ByWorkspaceIdOrderByUpdatedAtDesc(workspaceId)
                .stream()
                .map(NoteSummaryDto::fromEntity)
                .toList();

        // Build area name map for efficient lookup
        Map<UUID, String> areaNameMap = areaRepository.findByWorkspaceIdOrderBySortOrderAsc(workspaceId)
                .stream()
                .collect(Collectors.toMap(Area::getId, Area::getName));

        return new DashboardDto(
                totalTasks,
                todoCount,
                inProgressCount,
                doneCount,
                overdueTasks.size(),
                overdueTasks.stream().map(t -> toDto(t, areaNameMap)).toList(),
                dueTodayTasks.stream().map(t -> toDto(t, areaNameMap)).toList(),
                recentlyCompleted.stream().limit(10).map(t -> toDto(t, areaNameMap)).toList(),
                totalNotes,
                recentNotes
        );
    }

    private TaskDto toDto(Task t, Map<UUID, String> areaNameMap) {
        String areaName = t.getAreaId() != null ? areaNameMap.get(t.getAreaId()) : null;
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
