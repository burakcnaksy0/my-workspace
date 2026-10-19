package com.personalworkspace.notes.controller;

import com.personalworkspace.common.util.SecurityUtils;
import com.personalworkspace.notes.dto.CreateNoteRequest;
import com.personalworkspace.notes.dto.NoteDto;
import com.personalworkspace.notes.dto.NoteSummaryDto;
import com.personalworkspace.notes.dto.TagDto;
import com.personalworkspace.notes.dto.UpdateNoteRequest;
import com.personalworkspace.notes.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Notes", description = "Zengin Metin Not Yönetimi (Tiptap)")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping("/notes")
    @Operation(summary = "Çalışma alanındaki notları listeler ve arama/filtreleme yapar")
    public ResponseEntity<Page<NoteSummaryDto>> listNotes(
            @PathVariable UUID workspaceId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "updatedAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {

        UUID userId = SecurityUtils.getCurrentUserId();
        Sort.Direction sortDir = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(sortDir, sort));

        Page<NoteSummaryDto> notes = noteService.listNotes(workspaceId, userId, q, areaId, tag, pageable);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/notes")
    @Operation(summary = "Yeni bir zengin metin notu oluşturur")
    public ResponseEntity<NoteDto> createNote(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateNoteRequest request) {

        UUID userId = SecurityUtils.getCurrentUserId();
        NoteDto created = noteService.createNote(workspaceId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/notes/{noteId}")
    @Operation(summary = "Belirtilen notun tüm içeriğini döner")
    public ResponseEntity<NoteDto> getNote(
            @PathVariable UUID workspaceId,
            @PathVariable UUID noteId) {

        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(noteService.getNote(workspaceId, noteId, userId));
    }

    @PutMapping("/notes/{noteId}")
    @Operation(summary = "Notu günceller (Optimistic locking kontrollü)")
    public ResponseEntity<NoteDto> updateNote(
            @PathVariable UUID workspaceId,
            @PathVariable UUID noteId,
            @Valid @RequestBody UpdateNoteRequest request) {

        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(noteService.updateNote(workspaceId, noteId, userId, request));
    }

    @DeleteMapping("/notes/{noteId}")
    @Operation(summary = "Notu siler")
    public ResponseEntity<Void> deleteNote(
            @PathVariable UUID workspaceId,
            @PathVariable UUID noteId) {

        UUID userId = SecurityUtils.getCurrentUserId();
        noteService.deleteNote(workspaceId, noteId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tags")
    @Operation(summary = "Çalışma alanındaki mevcut etiketleri listeler")
    public ResponseEntity<List<TagDto>> listTags(@PathVariable UUID workspaceId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(noteService.listTags(workspaceId, userId));
    }
}
