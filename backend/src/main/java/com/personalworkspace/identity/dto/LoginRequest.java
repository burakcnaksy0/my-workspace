package com.personalworkspace.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank(message = "Kullanıcı adı boş bırakılamaz")
    @Size(min = 3, max = 100, message = "Kullanıcı adı 3 ile 100 karakter arasında olmalıdır")
    String username,

    @NotBlank(message = "Parola boş bırakılamaz")
    @Size(min = 6, max = 128, message = "Parola en az 6 karakter olmalıdır")
    String password
) {}
