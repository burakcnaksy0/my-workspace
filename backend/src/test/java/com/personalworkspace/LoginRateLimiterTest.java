package com.personalworkspace;

import com.personalworkspace.common.exception.TooManyRequestsException;
import com.personalworkspace.identity.service.LoginRateLimiter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginRateLimiterTest {

    @Test
    @DisplayName("Should lock account after 5 consecutive failed attempts")
    void testRateLimiterLocksAfter5Attempts() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        String username = "testuser";

        // 4 failed attempts should not throw
        for (int i = 0; i < 4; i++) {
            limiter.recordFailedAttempt(username);
            assertDoesNotThrow(() -> limiter.checkBlocked(username));
        }

        // 5th failed attempt triggers lock
        limiter.recordFailedAttempt(username);
        TooManyRequestsException ex = assertThrows(TooManyRequestsException.class, () ->
            limiter.checkBlocked(username)
        );
        // Mesaj kullanıcı adı varlığı hakkında bilgi vermemeli (enumeration koruması)
        assertTrue(ex.getMessage().contains("deneme"));
        assertFalse(ex.getMessage().contains(username));
    }

    @Test
    @DisplayName("Successful login should reset the failed attempts counter")
    void testSuccessResetsCounter() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        String username = "testuser2";

        // 4 failures
        for (int i = 0; i < 4; i++) {
            limiter.recordFailedAttempt(username);
        }

        // Success resets counter
        limiter.recordSuccess(username);

        // Can fail 4 more times without locking
        for (int i = 0; i < 4; i++) {
            limiter.recordFailedAttempt(username);
            assertDoesNotThrow(() -> limiter.checkBlocked(username));
        }
    }
}
