package com.personalworkspace.drawings.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateDrawingRequest(
    @NotBlank(message = "Çizim başlığı boş bırakılamaz")
    @Size(max = 255, message = "Çizim başlığı en fazla 255 karakter olabilir")
    String title,

    @NotNull(message = "Çizim verisi (documentData) zorunludur")
    String documentData,

    @NotNull(message = "Optimistic locking için versiyon (version) alanı zorunludur")
    Long version
) {}
