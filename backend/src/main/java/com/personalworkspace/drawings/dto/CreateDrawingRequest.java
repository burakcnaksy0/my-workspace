package com.personalworkspace.drawings.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDrawingRequest(
    @NotBlank(message = "Çizim başlığı boş bırakılamaz")
    @Size(max = 255, message = "Çizim başlığı en fazla 255 karakter olabilir")
    String title,

    String documentData
) {}
