package com.personalworkspace.dashboard.dto;

import com.personalworkspace.task.dto.TaskDto;

import java.util.List;

public record DashboardDto(
        long totalTasks,
        long todoCount,
        long inProgressCount,
        long doneCount,
        long overdueCount,
        List<TaskDto> overdueTasks,
        List<TaskDto> dueTodayTasks,
        List<TaskDto> recentlyCompletedTasks
) {}
