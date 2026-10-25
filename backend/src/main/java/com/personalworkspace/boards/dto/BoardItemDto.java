package com.personalworkspace.boards.dto;

import com.personalworkspace.boards.entity.BoardItem;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record BoardItemDto(
        UUID id,
        UUID boardId,
        String itemType,
        UUID itemId,
        double positionX,
        double positionY,
        Double width,
        Double height,
        int sortOrder,
        UUID columnId,
        Map<String, Object> itemDetails,
        Instant createdAt,
        Instant updatedAt
) {
    public static BoardItemDto fromEntity(BoardItem item, Map<String, Object> details) {
        return new BoardItemDto(
                item.getId(),
                item.getBoardId(),
                item.getItemType(),
                item.getItemId(),
                item.getPositionX(),
                item.getPositionY(),
                item.getWidth(),
                item.getHeight(),
                item.getSortOrder(),
                item.getColumnId(),
                details,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
