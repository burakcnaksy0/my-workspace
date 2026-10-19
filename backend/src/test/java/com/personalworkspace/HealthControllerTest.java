package com.personalworkspace;

import com.personalworkspace.common.controller.HealthController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HealthControllerTest {

    @Test
    @DisplayName("getHealth should return UP when database responds successfully")
    void getHealth_DatabaseConnected_ReturnsUp() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenReturn(1);

        HealthController healthController = new HealthController(jdbcTemplate);
        ResponseEntity<Map<String, Object>> response = healthController.getHealth();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals("CONNECTED", response.getBody().get("database"));
        assertEquals("Personal Workspace Backend", response.getBody().get("application"));
    }

    @Test
    @DisplayName("getHealth should return 503 DOWN when database query fails")
    void getHealth_DatabaseDisconnected_ReturnsDown() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenThrow(new RuntimeException("Connection timeout"));

        HealthController healthController = new HealthController(jdbcTemplate);
        ResponseEntity<Map<String, Object>> response = healthController.getHealth();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("DOWN", response.getBody().get("status"));
        assertTrue(response.getBody().get("database").toString().contains("DISCONNECTED"));
    }
}
