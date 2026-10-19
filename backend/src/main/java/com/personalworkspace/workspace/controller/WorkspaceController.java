package com.personalworkspace.workspace.controller;

import com.personalworkspace.common.util.SecurityUtils;
import com.personalworkspace.workspace.dto.AreaDto;
import com.personalworkspace.workspace.dto.CreateAreaRequest;
import com.personalworkspace.workspace.dto.UpdateAreaRequest;
import com.personalworkspace.workspace.dto.WorkspaceDto;
import com.personalworkspace.workspace.service.AreaService;
import com.personalworkspace.workspace.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
@Tag(name = "Workspace", description = "Çalışma Alanı ve Alan (Area) Yönetimi")
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final AreaService areaService;

    public WorkspaceController(WorkspaceService workspaceService, AreaService areaService) {
        this.workspaceService = workspaceService;
        this.areaService = areaService;
    }

    @GetMapping
    @Operation(summary = "Kullanıcının üye olduğu çalışma alanlarını listeler")
    public ResponseEntity<List<WorkspaceDto>> getWorkspaces() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(workspaceService.getUserWorkspaces(userId));
    }

    @GetMapping("/{workspaceId}")
    @Operation(summary = "Belirtilen çalışma alanının detayını döner")
    public ResponseEntity<WorkspaceDto> getWorkspace(@PathVariable UUID workspaceId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(workspaceService.getWorkspace(workspaceId, userId));
    }

    @GetMapping("/{workspaceId}/areas")
    @Operation(summary = "Çalışma alanına ait alanları (Areas) listeler")
    public ResponseEntity<List<AreaDto>> getAreas(@PathVariable UUID workspaceId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(areaService.getAreas(workspaceId, userId));
    }

    @PostMapping("/{workspaceId}/areas")
    @Operation(summary = "Çalışma alanına yeni bir alan ekler")
    public ResponseEntity<AreaDto> createArea(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateAreaRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        AreaDto created = areaService.createArea(workspaceId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{workspaceId}/areas/{areaId}")
    @Operation(summary = "Belirtilen alanı günceller")
    public ResponseEntity<AreaDto> updateArea(
            @PathVariable UUID workspaceId,
            @PathVariable UUID areaId,
            @Valid @RequestBody UpdateAreaRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        AreaDto updated = areaService.updateArea(workspaceId, areaId, request, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{workspaceId}/areas/{areaId}")
    @Operation(summary = "Belirtilen alanı siler")
    public ResponseEntity<Void> deleteArea(
            @PathVariable UUID workspaceId,
            @PathVariable UUID areaId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        areaService.deleteArea(workspaceId, areaId, userId);
        return ResponseEntity.noContent().build();
    }
}
