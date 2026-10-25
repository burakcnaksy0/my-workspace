package com.personalworkspace.boards.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateBoardItemPositionRequest(
        @NotNull(message = "Öğe ID'si zorunludur")
        UUID id,

        Double positionX,
        Double positionY,
        Double width,
        Double height,
        Integer sortOrder,
        UUID columnId
) {}
