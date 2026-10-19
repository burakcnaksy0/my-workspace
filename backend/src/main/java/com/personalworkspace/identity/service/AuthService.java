package com.personalworkspace.identity.service;

import com.personalworkspace.identity.dto.AuthUserDto;
import com.personalworkspace.identity.dto.LoginRequest;
import com.personalworkspace.identity.entity.User;
import com.personalworkspace.identity.repository.UserRepository;
import com.personalworkspace.workspace.dto.WorkspaceDto;
import com.personalworkspace.workspace.service.WorkspaceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final WorkspaceService workspaceService;
    private final LoginRateLimiter loginRateLimiter;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            WorkspaceService workspaceService,
            LoginRateLimiter loginRateLimiter) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.workspaceService = workspaceService;
        this.loginRateLimiter = loginRateLimiter;
    }

    public AuthUserDto login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String username = request.username().trim();
        loginRateLimiter.checkBlocked(username);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.password())
            );

            // Rate limiter success
            loginRateLimiter.recordSuccess(username);

            // Session fixation protection
            HttpSession session = httpRequest.getSession(true);
            httpRequest.changeSessionId();

            // Store in SecurityContext
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            log.info("User '{}' successfully authenticated. Session ID: {}", username, session.getId());

            return buildAuthUserDto(userDetails.getId(), userDetails.getUsername());

        } catch (BadCredentialsException ex) {
            loginRateLimiter.recordFailedAttempt(username);
            throw ex;
        }
    }

    public void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        SecurityContextHolder.clearContext();
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    @Transactional(readOnly = true)
    public AuthUserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Kullanıcı bulunamadı"));
        return buildAuthUserDto(user.getId(), user.getUsername());
    }

    private AuthUserDto buildAuthUserDto(UUID userId, String username) {
        UUID defaultWorkspaceId = null;
        String defaultWorkspaceName = null;

        try {
            WorkspaceDto defaultWs = workspaceService.getDefaultWorkspaceForUser(userId);
            defaultWorkspaceId = defaultWs.id();
            defaultWorkspaceName = defaultWs.name();
        } catch (Exception ex) {
            log.warn("Could not find default workspace for user {}: {}", userId, ex.getMessage());
        }

        return new AuthUserDto(
                userId,
                username,
                "ACTIVE",
                defaultWorkspaceId,
                defaultWorkspaceName
        );
    }
}
