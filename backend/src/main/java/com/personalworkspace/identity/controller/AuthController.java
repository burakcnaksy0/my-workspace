package com.personalworkspace.identity.controller;

import com.personalworkspace.common.util.SecurityUtils;
import com.personalworkspace.identity.dto.AuthUserDto;
import com.personalworkspace.identity.dto.LoginRequest;
import com.personalworkspace.identity.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Kullanıcı Kimlik Doğrulama ve Oturum Yönetimi")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Kullanıcı adı ve parola ile oturum açar (cookie tabanlı session üretir)")
    public ResponseEntity<AuthUserDto> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthUserDto userDto = authService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/logout")
    @Operation(summary = "Mevcut oturumu sonlandırır")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        authService.logout(httpRequest, httpResponse);
        return ResponseEntity.ok(Map.of("message", "Başarıyla çıkış yapıldı"));
    }

    @GetMapping("/me")
    @Operation(summary = "Aktif oturumdaki kullanıcı ve varsayılan çalışma alanı bilgilerini döner")
    public ResponseEntity<AuthUserDto> getCurrentUser() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        AuthUserDto userDto = authService.getCurrentUser(currentUserId);
        return ResponseEntity.ok(userDto);
    }
}
