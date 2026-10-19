package com.personalworkspace.notes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;
import java.util.UUID;

public record UpdateNoteRequest(
    @NotBlank(message = "Not başlığı boş bırakılamaz")
    @Size(max = 255, message = "Not başlığı en fazla 255 karakter olabilir")
    String title,

    UUID areaId,

    String content,

    String contentText,

    String contentFormat,

    Set<String> tags,

    @NotNull(message = "Optimistic locking için versiyon (version) alanı zorunludur")
    Long version
) {}
