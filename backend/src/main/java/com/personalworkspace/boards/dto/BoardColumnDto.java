package com.personalworkspace.boards.dto;

import com.personalworkspace.boards.entity.BoardColumn;

import java.time.Instant;
import java.util.UUID;

public record BoardColumnDto(
        UUID id,
        UUID boardId,
        String name,
        int sortOrder,
        String mappedStatus,
        Instant createdAt,
        Instant updatedAt
) {
    public static BoardColumnDto fromEntity(BoardColumn col) {
        return new BoardColumnDto(
                col.getId(),
                col.getBoardId(),
                col.getName(),
                col.getSortOrder(),
                col.getMappedStatus(),
                col.getCreatedAt(),
                col.getUpdatedAt()
        );
    }
}
