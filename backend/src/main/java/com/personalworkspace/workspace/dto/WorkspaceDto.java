package com.personalworkspace.workspace.dto;

import java.time.Instant;
import java.util.UUID;

public record WorkspaceDto(
    UUID id,
    String name,
    UUID ownerId,
    String settings,
    String role,
    Instant createdAt
) {}
