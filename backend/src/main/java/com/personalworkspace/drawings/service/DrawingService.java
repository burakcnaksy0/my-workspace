package com.personalworkspace.drawings.service;

import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.drawings.dto.CreateDrawingRequest;
import com.personalworkspace.drawings.dto.DrawingDto;
import com.personalworkspace.drawings.dto.DrawingSummaryDto;
import com.personalworkspace.drawings.dto.UpdateDrawingRequest;
import com.personalworkspace.drawings.entity.DrawingDocument;
import com.personalworkspace.drawings.repository.DrawingRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DrawingService {

    private static final Logger log = LoggerFactory.getLogger(DrawingService.class);
    private static final int MAX_DOCUMENT_SIZE_CHARS = 10 * 1024 * 1024; // 10MB limit

    private final DrawingRepository drawingRepository;
    private final WorkspaceAccessService accessService;

    public DrawingService(
            DrawingRepository drawingRepository,
            WorkspaceAccessService accessService) {
        this.drawingRepository = drawingRepository;
        this.accessService = accessService;
    }

    public DrawingDto createDrawing(UUID workspaceId, UUID userId, CreateDrawingRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        String docData = (req.documentData() != null && !req.documentData().isBlank())
                ? req.documentData()
                : "{\"elements\":[],\"appState\":{}}";

        validateDocumentSize(docData);

        DrawingDocument doc = new DrawingDocument();
        doc.setWorkspaceId(workspaceId);
        doc.setTitle(req.title().trim());
        doc.setDocumentData(docData);
        doc.setCreatedBy(userId);
        doc.setCreatedAt(Instant.now());
        doc.setUpdatedAt(Instant.now());

        DrawingDocument saved = drawingRepository.save(doc);
        log.info("Çizim belgesi oluşturuldu: id={}, workspace={}, title='{}'", saved.getId(), workspaceId, saved.getTitle());
        return DrawingDto.fromEntity(saved);
    }

    public DrawingDto updateDrawing(UUID workspaceId, UUID drawingId, UUID userId, UpdateDrawingRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        DrawingDocument doc = drawingRepository.findByIdAndWorkspaceId(drawingId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Çizim belgesi bulunamadı: " + drawingId));

        if (req.version() != null && !doc.getVersion().equals(req.version())) {
            throw new ConflictException(
                "Bu çizim başka bir sekme veya işlem tarafından güncellendi. " +
                "Mevcut sürüm: " + doc.getVersion() + ", Gönderilen: " + req.version() + ". " +
                "Lütfen sayfayı yenileyip en güncel çizimi yükleyin."
            );
        }

        validateDocumentSize(req.documentData());

        doc.setTitle(req.title().trim());
        doc.setDocumentData(req.documentData());
        doc.setUpdatedAt(Instant.now());

        try {
            DrawingDocument saved = drawingRepository.saveAndFlush(doc);
            log.info("Çizim güncellendi: id={}, version={}", saved.getId(), saved.getVersion());
            return DrawingDto.fromEntity(saved);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException(
                "Eşzamanlı düzenleme çakışması tespit edildi. " +
                "Lütfen sayfayı yenileyip en güncel çizimi kontrol edin."
            );
        }
    }

    @Transactional(readOnly = true)
    public DrawingDto getDrawing(UUID workspaceId, UUID drawingId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        DrawingDocument doc = drawingRepository.findByIdAndWorkspaceId(drawingId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Çizim belgesi bulunamadı: " + drawingId));

        return DrawingDto.fromEntity(doc);
    }

    @Transactional(readOnly = true)
    public List<DrawingSummaryDto> listDrawings(UUID workspaceId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        return drawingRepository.findSummariesByWorkspaceId(workspaceId);
    }

    public void deleteDrawing(UUID workspaceId, UUID drawingId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        DrawingDocument doc = drawingRepository.findByIdAndWorkspaceId(drawingId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Çizim belgesi bulunamadı: " + drawingId));

        drawingRepository.delete(doc);
        log.info("Çizim silindi: id={}", drawingId);
    }

    private void validateDocumentSize(String data) {
        if (data != null && data.length() > MAX_DOCUMENT_SIZE_CHARS) {
            throw new IllegalArgumentException("Çizim belgesi boyutu izin verilen sınırı (10MB) aşamaz.");
        }
    }
}
