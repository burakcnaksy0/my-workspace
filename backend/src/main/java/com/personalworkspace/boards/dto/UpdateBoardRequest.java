package com.personalworkspace.boards.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateBoardRequest(
        @NotBlank(message = "Pano adı boş olamaz")
        @Size(max = 255, message = "Pano adı en fazla 255 karakter olabilir")
        String name,

        UUID areaId,

        String layoutConfig,

        @NotNull(message = "Versiyon alanı zorunludur")
        Long version
) {}
