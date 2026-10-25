package com.personalworkspace.boards.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record CreateBoardRequest(
        @NotBlank(message = "Pano adı boş olamaz")
        @Size(max = 255, message = "Pano adı en fazla 255 karakter olabilir")
        String name,

        String boardType, // COLUMNS veya FREEFORM

        UUID areaId,

        String layoutConfig,

        List<CreateColumnRequest> initialColumns
) {}
