package com.personalworkspace.dashboard.controller;

import com.personalworkspace.common.util.SecurityUtils;
import com.personalworkspace.dashboard.dto.DashboardDto;
import com.personalworkspace.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/dashboard")
@Tag(name = "Dashboard", description = "Günlük Özet ve İstatistikler")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @Operation(summary = "Çalışma alanı dashboard verilerini döner (görev sayıları, geciken görevler, günlük hedefler)")
    public ResponseEntity<DashboardDto> getDashboard(
            @PathVariable UUID workspaceId,
            @RequestParam(defaultValue = "Europe/Istanbul") String timezone) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(dashboardService.getDashboard(workspaceId, userId, timezone));
    }
}
