package com.personalworkspace.contentlink.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateContentLinkRequest(
        @NotNull(message = "Kaynak türü zorunludur")
        @Pattern(regexp = "TASK|NOTE|DRAWING", message = "Kaynak türü TASK, NOTE veya DRAWING olmalıdır")
        String sourceType,

        @NotNull(message = "Kaynak kimliği zorunludur")
        UUID sourceId,

        @NotNull(message = "Hedef türü zorunludur")
        @Pattern(regexp = "TASK|NOTE|DRAWING", message = "Hedef türü TASK, NOTE veya DRAWING olmalıdır")
        String targetType,

        @NotNull(message = "Hedef kimliği zorunludur")
        UUID targetId,

        @Size(max = 255, message = "Etiket en fazla 255 karakter olabilir")
        String label
) {}
