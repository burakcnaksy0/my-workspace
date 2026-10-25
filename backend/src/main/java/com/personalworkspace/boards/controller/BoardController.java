package com.personalworkspace.boards.controller;

import com.personalworkspace.boards.dto.*;
import com.personalworkspace.boards.service.BoardService;
import com.personalworkspace.common.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/boards")
@Tag(name = "Boards", description = "Genel Çalışma Panoları (Kanban ve Serbest Yerleşim)")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    @Operation(summary = "Çalışma alanındaki panoları listeler")
    public ResponseEntity<List<BoardSummaryDto>> getBoards(
            @PathVariable UUID workspaceId,
            @RequestParam(required = false) UUID areaId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(boardService.getBoards(workspaceId, userId, areaId));
    }

    @PostMapping
    @Operation(summary = "Yeni bir pano oluşturur")
    public ResponseEntity<BoardDetailsDto> createBoard(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateBoardRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        BoardDetailsDto created = boardService.createBoard(workspaceId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{boardId}")
    @Operation(summary = "Pano detaylarını (sütunlar, öğeler ve bağlantılar ile) getirir")
    public ResponseEntity<BoardDetailsDto> getBoard(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(boardService.getBoardDetails(workspaceId, boardId, userId));
    }

    @PutMapping("/{boardId}")
    @Operation(summary = "Pano bilgilerini günceller")
    public ResponseEntity<BoardDetailsDto> updateBoard(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @Valid @RequestBody UpdateBoardRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(boardService.updateBoard(workspaceId, boardId, userId, request));
    }

    @DeleteMapping("/{boardId}")
    @Operation(summary = "Panoyu siler (asıl görev ve notlar korunur)")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        boardService.deleteBoard(workspaceId, boardId, userId);
        return ResponseEntity.noContent().build();
    }

    // ================= Sütun Endpoint'leri =================

    @PostMapping("/{boardId}/columns")
    @Operation(summary = "Panoya yeni bir sütun ekler")
    public ResponseEntity<BoardColumnDto> createColumn(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @Valid @RequestBody CreateColumnRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        BoardColumnDto created = boardService.createColumn(workspaceId, boardId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{boardId}/columns/{columnId}")
    @Operation(summary = "Sütun bilgilerini günceller")
    public ResponseEntity<BoardColumnDto> updateColumn(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @PathVariable UUID columnId,
            @Valid @RequestBody UpdateColumnRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(boardService.updateColumn(workspaceId, boardId, columnId, userId, request));
    }

    @DeleteMapping("/{boardId}/columns/{columnId}")
    @Operation(summary = "Sütunu siler (içindeki kartların sütun referansı kaldırılır, görevler silinmez)")
    public ResponseEntity<Void> deleteColumn(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @PathVariable UUID columnId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        boardService.deleteColumn(workspaceId, boardId, columnId, userId);
        return ResponseEntity.noContent().build();
    }

    // ================= Öğe (Item) Endpoint'leri =================

    @PostMapping("/{boardId}/items")
    @Operation(summary = "Panoya bir görev, not veya çizim kartı ekler")
    public ResponseEntity<BoardItemDto> addItem(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @Valid @RequestBody CreateBoardItemRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        BoardItemDto created = boardService.addItem(workspaceId, boardId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{boardId}/items")
    @Operation(summary = "Toplu pano öğe konumu/sıralaması günceller")
    public ResponseEntity<List<BoardItemDto>> batchUpdateItems(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @Valid @RequestBody BatchUpdateItemsRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(boardService.batchUpdateItems(workspaceId, boardId, userId, request));
    }

    @DeleteMapping("/{boardId}/items/{itemId}")
    @Operation(summary = "Öğeyi panodan kaldırır (asıl görev/not silinmez)")
    public ResponseEntity<Void> removeItem(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @PathVariable UUID itemId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        boardService.removeItem(workspaceId, boardId, itemId, userId);
        return ResponseEntity.noContent().build();
    }

    // ================= Bağlantı (Edge) Endpoint'leri =================

    @PostMapping("/{boardId}/edges")
    @Operation(summary = "Serbest panoda iki öğe arasına bağlantı (edge) ekler")
    public ResponseEntity<BoardEdgeDto> createEdge(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @Valid @RequestBody CreateBoardEdgeRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        BoardEdgeDto created = boardService.createEdge(workspaceId, boardId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{boardId}/edges/{edgeId}")
    @Operation(summary = "Pano bağlantısını (edge) siler")
    public ResponseEntity<Void> deleteEdge(
            @PathVariable UUID workspaceId,
            @PathVariable UUID boardId,
            @PathVariable UUID edgeId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        boardService.deleteEdge(workspaceId, boardId, edgeId, userId);
        return ResponseEntity.noContent().build();
    }
}
