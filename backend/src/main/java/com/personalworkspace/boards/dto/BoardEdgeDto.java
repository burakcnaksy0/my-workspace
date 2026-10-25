package com.personalworkspace.boards.dto;

import com.personalworkspace.boards.entity.BoardEdge;

import java.time.Instant;
import java.util.UUID;

public record BoardEdgeDto(
        UUID id,
        UUID boardId,
        UUID sourceItemId,
        UUID targetItemId,
        String label,
        Instant createdAt
) {
    public static BoardEdgeDto fromEntity(BoardEdge edge) {
        return new BoardEdgeDto(
                edge.getId(),
                edge.getBoardId(),
                edge.getSourceItemId(),
                edge.getTargetItemId(),
                edge.getLabel(),
                edge.getCreatedAt()
        );
    }
}
