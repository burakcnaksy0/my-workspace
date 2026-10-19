package com.personalworkspace.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Sistem ve Altyapı Sağlık Kontrolü")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    @Operation(summary = "Altyapı ve veritabanı sağlık durumunu doğrular")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("application", "Personal Workspace Backend");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());

        try {
            Integer dbResult = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            boolean dbHealthy = dbResult != null && dbResult == 1;
            response.put("database", dbHealthy ? "CONNECTED" : "UNHEALTHY");
            response.put("databaseType", "PostgreSQL 16");
        } catch (Exception ex) {
            response.put("database", "DISCONNECTED: " + ex.getMessage());
            response.put("status", "DOWN");
            return ResponseEntity.status(503).body(response);
        }

        return ResponseEntity.ok(response);
    }
}
