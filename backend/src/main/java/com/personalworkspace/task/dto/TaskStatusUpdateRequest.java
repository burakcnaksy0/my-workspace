package com.personalworkspace.task.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TaskStatusUpdateRequest(
        @NotNull(message = "Durum belirtilmelidir")
        @Pattern(regexp = "TODO|IN_PROGRESS|DONE", message = "Durum TODO, IN_PROGRESS veya DONE olmalıdır")
        String status,

        @NotNull(message = "Sürüm belirtilmelidir (optimistic locking)")
        Long version
) {}
