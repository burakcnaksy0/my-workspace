package com.personalworkspace.boards.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateColumnRequest(
        @NotBlank(message = "Sütun adı boş olamaz")
        @Size(max = 100, message = "Sütun adı en fazla 100 karakter olabilir")
        String name,

        Integer sortOrder,

        String mappedStatus
) {}
