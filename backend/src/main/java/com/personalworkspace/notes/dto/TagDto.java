package com.personalworkspace.notes.dto;

import com.personalworkspace.notes.entity.Tag;

import java.time.Instant;
import java.util.UUID;

public record TagDto(
    UUID id,
    UUID workspaceId,
    String name,
    Instant createdAt
) {
    public static TagDto fromEntity(Tag tag) {
        return new TagDto(
            tag.getId(),
            tag.getWorkspaceId(),
            tag.getName(),
            tag.getCreatedAt()
        );
    }
}
