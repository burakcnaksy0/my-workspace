package com.personalworkspace.task.dto;

import java.time.Instant;
import java.util.UUID;

public record TaskDto(
        UUID id,
        UUID workspaceId,
        UUID areaId,
        String areaName,
        String title,
        String description,
        String status,
        String priority,
        Instant dueAt,
        Instant completedAt,
        UUID createdBy,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {}
