package com.personalworkspace.notes.dto;

import com.personalworkspace.notes.entity.Note;
import com.personalworkspace.notes.entity.Tag;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record NoteSummaryDto(
    UUID id,
    UUID workspaceId,
    UUID areaId,
    String title,
    String snippet,
    List<String> tags,
    Long version,
    Instant createdAt,
    Instant updatedAt
) {
    public static NoteSummaryDto fromEntity(Note note) {
        List<String> tagNames = note.getTags() != null
                ? note.getTags().stream().map(Tag::getName).sorted().toList()
                : List.of();

        String snippet = "";
        if (note.getContentText() != null && !note.getContentText().isBlank()) {
            snippet = note.getContentText().trim();
            if (snippet.length() > 160) {
                snippet = snippet.substring(0, 157) + "...";
            }
        }

        return new NoteSummaryDto(
            note.getId(),
            note.getWorkspaceId(),
            note.getAreaId(),
            note.getTitle(),
            snippet,
            tagNames,
            note.getVersion(),
            note.getCreatedAt(),
            note.getUpdatedAt()
        );
    }
}
