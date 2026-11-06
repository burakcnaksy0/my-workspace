package com.personalworkspace.identity.service;

import com.personalworkspace.common.exception.TooManyRequestsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class LoginRateLimiter {

    private static final Logger log = LoggerFactory.getLogger(LoginRateLimiter.class);

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 900; // 15 minutes

    /** Kayıt son denemeden bu kadar süre sessiz kaldıysa düşürülür. */
    private static final Duration RECORD_TTL = Duration.ofMinutes(30);
    /** Temizlik en fazla bu aralıkla çalışır (her istekte tarama yapmamak için). */
    private static final Duration CLEANUP_INTERVAL = Duration.ofMinutes(5);

    private static class AttemptRecord {
        final int failedAttempts;
        final Instant lockUntil;
        final Instant lastAttempt;

        AttemptRecord(int failedAttempts, Instant lockUntil, Instant lastAttempt) {
            this.failedAttempts = failedAttempts;
            this.lockUntil = lockUntil;
            this.lastAttempt = lastAttempt;
        }
    }

    private final Map<String, AttemptRecord> attempts = new ConcurrentHashMap<>();
    private final AtomicReference<Instant> lastCleanup = new AtomicReference<>(Instant.EPOCH);

    public void checkBlocked(String username) {
        evictExpiredIfNeeded();

        String key = username.toLowerCase().trim();
        AttemptRecord record = attempts.get(key);
        if (record != null && record.lockUntil != null) {
            if (Instant.now().isBefore(record.lockUntil)) {
                long remainingSeconds = Duration.between(Instant.now(), record.lockUntil).getSeconds();
                log.warn("Engellenen giriş denemesi. Anahtar (hashlenmiş): {}, kalan kilit: {}s",
                    Integer.toHexString(key.hashCode()), remainingSeconds);
                // Kullanıcı adının varlığı hakkında bilgi vermeyen genel mesaj.
                throw new TooManyRequestsException(
                    "Çok sayıda hatalı giriş denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin."
                );
            } else {
                // Kilit süresi doldu, kaydı temizle
                attempts.remove(key);
            }
        }
    }

    public void recordFailedAttempt(String username) {
        evictExpiredIfNeeded();

        String key = username.toLowerCase().trim();
        Instant now = Instant.now();
        attempts.compute(key, (k, existing) -> {
            int newAttempts = (existing == null) ? 1 : existing.failedAttempts + 1;
            Instant lockUntil = null;
            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                lockUntil = now.plusSeconds(LOCKOUT_DURATION_SECONDS);
                log.warn("Başarısız giriş eşiği aşıldı ({} deneme). 15 dakika kilit.", newAttempts);
            }
            return new AttemptRecord(newAttempts, lockUntil, now);
        });
    }

    public void recordSuccess(String username) {
        String key = username.toLowerCase().trim();
        attempts.remove(key);
    }

    /**
     * Süresi dolmuş/kullanılmayan kayıtları periyodik olarak temizler.
     * Saldırganın benzersiz kullanıcı adlarıyla belleği şişirmesini engeller.
     */
    private void evictExpiredIfNeeded() {
        Instant now = Instant.now();
        Instant previous = lastCleanup.get();
        if (Duration.between(previous, now).compareTo(CLEANUP_INTERVAL) < 0) {
            return;
        }
        if (!lastCleanup.compareAndSet(previous, now)) {
            return; // başka bir thread temizliği üstlendi
        }
        attempts.entrySet().removeIf(entry -> {
            AttemptRecord record = entry.getValue();
            boolean lockExpired = record.lockUntil != null && now.isAfter(record.lockUntil);
            boolean stale = Duration.between(record.lastAttempt, now).compareTo(RECORD_TTL) > 0;
            return lockExpired || stale;
        });
    }
}
