package com.personalworkspace.identity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final Logger log = LoggerFactory.getLogger(LoginRateLimiter.class);

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 900; // 15 minutes

    private static class AttemptRecord {
        int failedAttempts;
        Instant lockUntil;

        AttemptRecord(int failedAttempts, Instant lockUntil) {
            this.failedAttempts = failedAttempts;
            this.lockUntil = lockUntil;
        }
    }

    private final Map<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public void checkBlocked(String username) {
        String key = username.toLowerCase().trim();
        AttemptRecord record = attempts.get(key);
        if (record != null && record.lockUntil != null) {
            if (Instant.now().isBefore(record.lockUntil)) {
                long remainingSeconds = java.time.Duration.between(Instant.now(), record.lockUntil).getSeconds();
                log.warn("Blocked login attempt for user '{}'. Remaining lock: {}s", key, remainingSeconds);
                throw new IllegalArgumentException(
                    "Çok sayıda hatalı giriş denemesi yapıldı. Güvenliğiniz için hesabınız geçici olarak kilitlendi. " +
                    "Lütfen " + (remainingSeconds / 60 + 1) + " dakika sonra tekrar deneyin."
                );
            } else {
                // Lock has expired, reset
                attempts.remove(key);
            }
        }
    }

    public void recordFailedAttempt(String username) {
        String key = username.toLowerCase().trim();
        attempts.compute(key, (k, existing) -> {
            int newAttempts = (existing == null) ? 1 : existing.failedAttempts + 1;
            Instant lockUntil = null;
            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                lockUntil = Instant.now().plusSeconds(LOCKOUT_DURATION_SECONDS);
                log.warn("User '{}' reached {} failed attempts. Locking for 15 minutes.", key, newAttempts);
            }
            return new AttemptRecord(newAttempts, lockUntil);
        });
    }

    public void recordSuccess(String username) {
        String key = username.toLowerCase().trim();
        attempts.remove(key);
    }
}
