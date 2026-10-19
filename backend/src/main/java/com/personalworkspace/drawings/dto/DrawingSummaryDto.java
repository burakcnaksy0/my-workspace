package com.personalworkspace.drawings.dto;

import java.time.Instant;
import java.util.UUID;

public record DrawingSummaryDto(
    UUID id,
    UUID workspaceId,
    String title,
    UUID createdBy,
    Long version,
    Instant createdAt,
    Instant updatedAt
) {}
