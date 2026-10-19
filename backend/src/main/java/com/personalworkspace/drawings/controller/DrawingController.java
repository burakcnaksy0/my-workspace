package com.personalworkspace.drawings.controller;

import com.personalworkspace.common.util.SecurityUtils;
import com.personalworkspace.drawings.dto.CreateDrawingRequest;
import com.personalworkspace.drawings.dto.DrawingDto;
import com.personalworkspace.drawings.dto.DrawingSummaryDto;
import com.personalworkspace.drawings.dto.UpdateDrawingRequest;
import com.personalworkspace.drawings.service.DrawingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/drawings")
@Tag(name = "Drawings", description = "Bağımsız Çizim ve Diyagram Yönetimi (Excalidraw)")
public class DrawingController {

    private final DrawingService drawingService;

    public DrawingController(DrawingService drawingService) {
        this.drawingService = drawingService;
    }

    @GetMapping
    @Operation(summary = "Çalışma alanındaki çizimlerin özet listesini döner (document_data hariç)")
    public ResponseEntity<List<DrawingSummaryDto>> listDrawings(@PathVariable UUID workspaceId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(drawingService.listDrawings(workspaceId, userId));
    }

    @PostMapping
    @Operation(summary = "Yeni bir çizim belgesi oluşturur")
    public ResponseEntity<DrawingDto> createDrawing(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateDrawingRequest request) {

        UUID userId = SecurityUtils.getCurrentUserId();
        DrawingDto created = drawingService.createDrawing(workspaceId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{drawingId}")
    @Operation(summary = "Belirtilen çizimin tüm verisini döner")
    public ResponseEntity<DrawingDto> getDrawing(
            @PathVariable UUID workspaceId,
            @PathVariable UUID drawingId) {

        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(drawingService.getDrawing(workspaceId, drawingId, userId));
    }

    @PutMapping("/{drawingId}")
    @Operation(summary = "Çizim belgesini günceller (Optimistic locking kontrollü)")
    public ResponseEntity<DrawingDto> updateDrawing(
            @PathVariable UUID workspaceId,
            @PathVariable UUID drawingId,
            @Valid @RequestBody UpdateDrawingRequest request) {

        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(drawingService.updateDrawing(workspaceId, drawingId, userId, request));
    }

    @DeleteMapping("/{drawingId}")
    @Operation(summary = "Çizim belgesini siler")
    public ResponseEntity<Void> deleteDrawing(
            @PathVariable UUID workspaceId,
            @PathVariable UUID drawingId) {

        UUID userId = SecurityUtils.getCurrentUserId();
        drawingService.deleteDrawing(workspaceId, drawingId, userId);
        return ResponseEntity.noContent().build();
    }
}
