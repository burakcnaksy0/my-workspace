package com.personalworkspace.contentlink.controller;

import com.personalworkspace.common.exception.BadRequestException;
import com.personalworkspace.common.util.SecurityUtils;
import com.personalworkspace.contentlink.dto.ContentLinkDto;
import com.personalworkspace.contentlink.dto.CreateContentLinkRequest;
import com.personalworkspace.contentlink.entity.ContentRefType;
import com.personalworkspace.contentlink.service.ContentLinkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/content-links")
@Tag(name = "Content Links", description = "İçerikler arası çapraz referanslar")
public class ContentLinkController {

    private final ContentLinkService contentLinkService;

    public ContentLinkController(ContentLinkService contentLinkService) {
        this.contentLinkService = contentLinkService;
    }

    @PostMapping
    @Operation(summary = "İki içerik arasında bağlantı oluşturur (yönsüz)")
    public ResponseEntity<ContentLinkDto> create(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateContentLinkRequest request) {
        ContentLinkDto dto = contentLinkService.create(workspaceId, request, SecurityUtils.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    @Operation(summary = "Bir içeriğe bağlı tüm bağlantıları döner (her iki yön)")
    public ResponseEntity<List<ContentLinkDto>> listRelated(
            @PathVariable UUID workspaceId,
            @RequestParam String refType,
            @RequestParam UUID refId) {
        ContentRefType type;
        try {
            type = ContentRefType.valueOf(refType.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Geçersiz referans türü: " + refType);
        }
        return ResponseEntity.ok(
                contentLinkService.listRelated(workspaceId, type, refId, SecurityUtils.getCurrentUserId()));
    }

    @DeleteMapping("/{linkId}")
    @Operation(summary = "Bağlantıyı siler")
    public ResponseEntity<Void> delete(
            @PathVariable UUID workspaceId,
            @PathVariable UUID linkId) {
        contentLinkService.delete(workspaceId, linkId, SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
