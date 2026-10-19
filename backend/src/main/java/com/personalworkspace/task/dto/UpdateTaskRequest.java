package com.personalworkspace.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record UpdateTaskRequest(
        @NotBlank(message = "Görev başlığı boş olamaz")
        @Size(max = 255, message = "Görev başlığı en fazla 255 karakter olabilir")
        String title,

        @Size(max = 5000, message = "Açıklama en fazla 5000 karakter olabilir")
        String description,

        @NotNull(message = "Öncelik belirtilmelidir")
        @Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Öncelik LOW, MEDIUM veya HIGH olmalıdır")
        String priority,

        @NotNull(message = "Durum belirtilmelidir")
        @Pattern(regexp = "TODO|IN_PROGRESS|DONE", message = "Durum TODO, IN_PROGRESS veya DONE olmalıdır")
        String status,

        UUID areaId,

        Instant dueAt,

        @NotNull(message = "Sürüm belirtilmelidir (optimistic locking)")
        Long version
) {}
