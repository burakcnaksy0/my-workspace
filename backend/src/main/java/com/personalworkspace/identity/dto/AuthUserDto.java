package com.personalworkspace.identity.dto;

import java.util.UUID;

public record AuthUserDto(
    UUID id,
    String username,
    String status,
    UUID defaultWorkspaceId,
    String defaultWorkspaceName
) {}
