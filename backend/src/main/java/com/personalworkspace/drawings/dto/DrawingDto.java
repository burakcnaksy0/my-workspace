package com.personalworkspace.drawings.dto;

import com.personalworkspace.drawings.entity.DrawingDocument;

import java.time.Instant;
import java.util.UUID;

public record DrawingDto(
    UUID id,
    UUID workspaceId,
    String title,
    String documentData,
    UUID createdBy,
    Long version,
    Instant createdAt,
    Instant updatedAt
) {
    public static DrawingDto fromEntity(DrawingDocument doc) {
        return new DrawingDto(
            doc.getId(),
            doc.getWorkspaceId(),
            doc.getTitle(),
            doc.getDocumentData(),
            doc.getCreatedBy(),
            doc.getVersion(),
            doc.getCreatedAt(),
            doc.getUpdatedAt()
        );
    }
}
