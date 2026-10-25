package com.personalworkspace.boards.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record CreateBoardItemRequest(
        @NotBlank(message = "Öğe türü boş olamaz")
        @Pattern(regexp = "TASK|NOTE|DRAWING", message = "Öğe türü TASK, NOTE veya DRAWING olmalıdır")
        String itemType,

        @NotNull(message = "Öğe ID'si zorunludur")
        UUID itemId,

        Double positionX,
        Double positionY,
        Double width,
        Double height,
        Integer sortOrder,
        UUID columnId
) {}
