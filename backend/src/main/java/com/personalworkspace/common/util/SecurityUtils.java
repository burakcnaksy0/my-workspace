package com.personalworkspace.common.util;

import com.personalworkspace.common.exception.UnauthorizedException;
import com.personalworkspace.identity.service.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Oturum açmanız gerekmektedir.");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }

        throw new UnauthorizedException("Geçersiz oturum bilgisi.");
    }

    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        return auth.getName();
    }
}
