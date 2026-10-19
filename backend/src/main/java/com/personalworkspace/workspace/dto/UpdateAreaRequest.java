package com.personalworkspace.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAreaRequest(
    @NotBlank(message = "Alan adı boş bırakılamaz")
    @Size(min = 1, max = 100, message = "Alan adı 1 ile 100 karakter arasında olmalıdır")
    String name,

    String description,

    @Size(max = 50, message = "İkon adı en fazla 50 karakter olabilir")
    String icon,

    @Size(max = 30, message = "Renk kodu en fazla 30 karakter olabilir")
    String color,

    Integer sortOrder
) {}
