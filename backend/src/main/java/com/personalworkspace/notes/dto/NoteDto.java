package com.personalworkspace.notes.dto;

import com.personalworkspace.notes.entity.Note;
import com.personalworkspace.notes.entity.Tag;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record NoteDto(
    UUID id,
    UUID workspaceId,
    UUID areaId,
    String title,
    String content,
    String contentText,
    String contentFormat,
    List<String> tags,
    UUID createdBy,
    Long version,
    Instant createdAt,
    Instant updatedAt
) {
    public static NoteDto fromEntity(Note note) {
        List<String> tagNames = note.getTags() != null
                ? note.getTags().stream().map(Tag::getName).sorted().toList()
                : List.of();

        return new NoteDto(
            note.getId(),
            note.getWorkspaceId(),
            note.getAreaId(),
            note.getTitle(),
            note.getContent(),
            note.getContentText(),
            note.getContentFormat(),
            tagNames,
            note.getCreatedBy(),
            note.getVersion(),
            note.getCreatedAt(),
            note.getUpdatedAt()
        );
    }
}
