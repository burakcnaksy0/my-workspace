package com.personalworkspace.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CreateTaskRequest(
        @NotBlank(message = "Görev başlığı boş olamaz")
        @Size(max = 255, message = "Görev başlığı en fazla 255 karakter olabilir")
        String title,

        @Size(max = 5000, message = "Açıklama en fazla 5000 karakter olabilir")
        String description,

        @Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Öncelik LOW, MEDIUM veya HIGH olmalıdır")
        String priority,

        UUID areaId,

        Instant dueAt
) {
    public CreateTaskRequest {
        if (priority == null || priority.isBlank()) {
            priority = "MEDIUM";
        }
    }
}
