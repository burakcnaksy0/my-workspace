package com.personalworkspace.workspace.dto;

import java.util.UUID;

public record AreaDto(
    UUID id,
    UUID workspaceId,
    String name,
    String description,
    String icon,
    String color,
    int sortOrder
) {}
