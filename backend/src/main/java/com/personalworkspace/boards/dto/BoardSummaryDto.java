package com.personalworkspace.boards.dto;

import com.personalworkspace.boards.entity.Board;

import java.time.Instant;
import java.util.UUID;

public record BoardSummaryDto(
        UUID id,
        UUID workspaceId,
        UUID areaId,
        String name,
        String boardType,
        Instant createdAt,
        Instant updatedAt
) {
    public static BoardSummaryDto fromEntity(Board board) {
        return new BoardSummaryDto(
                board.getId(),
                board.getWorkspaceId(),
                board.getAreaId(),
                board.getName(),
                board.getBoardType(),
                board.getCreatedAt(),
                board.getUpdatedAt()
        );
    }
}
