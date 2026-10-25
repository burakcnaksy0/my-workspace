package com.personalworkspace.boards.dto;

import com.personalworkspace.boards.entity.Board;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BoardDetailsDto(
        UUID id,
        UUID workspaceId,
        UUID areaId,
        String name,
        String boardType,
        String layoutConfig,
        Long version,
        List<BoardColumnDto> columns,
        List<BoardItemDto> items,
        List<BoardEdgeDto> edges,
        Instant createdAt,
        Instant updatedAt
) {
    public static BoardDetailsDto fromEntity(
            Board board,
            List<BoardColumnDto> columns,
            List<BoardItemDto> items,
            List<BoardEdgeDto> edges
    ) {
        return new BoardDetailsDto(
                board.getId(),
                board.getWorkspaceId(),
                board.getAreaId(),
                board.getName(),
                board.getBoardType(),
                board.getLayoutConfig(),
                board.getVersion(),
                columns,
                items,
                edges,
                board.getCreatedAt(),
                board.getUpdatedAt()
        );
    }
}
