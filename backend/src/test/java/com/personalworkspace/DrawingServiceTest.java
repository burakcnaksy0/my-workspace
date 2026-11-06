package com.personalworkspace;

import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.drawings.dto.CreateDrawingRequest;
import com.personalworkspace.drawings.dto.DrawingDto;
import com.personalworkspace.drawings.dto.DrawingSummaryDto;
import com.personalworkspace.drawings.dto.UpdateDrawingRequest;
import com.personalworkspace.drawings.entity.DrawingDocument;
import com.personalworkspace.drawings.repository.DrawingRepository;
import com.personalworkspace.drawings.service.DrawingService;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DrawingServiceTest {

    @Mock
    private DrawingRepository drawingRepository;

    @Mock
    private WorkspaceAccessService accessService;

    @Mock
    private com.personalworkspace.boards.repository.BoardItemRepository boardItemRepository;

    @Mock
    private com.personalworkspace.contentlink.service.ContentLinkService contentLinkService;

    private DrawingService drawingService;

    private final UUID workspaceId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        drawingService = new DrawingService(drawingRepository, accessService, boardItemRepository, contentLinkService);
    }

    @Test
    @DisplayName("createDrawing: creates drawing document and returns DrawingDto")
    void createDrawing_success() {
        CreateDrawingRequest request = new CreateDrawingRequest(
                "Sistem Mimarisi Diyagramı",
                "{\"elements\":[{\"id\":\"el1\",\"type\":\"rectangle\"}]}"
        );

        when(drawingRepository.save(any(DrawingDocument.class))).thenAnswer(inv -> {
            DrawingDocument doc = inv.getArgument(0);
            doc.setId(UUID.randomUUID());
            doc.setVersion(0L);
            return doc;
        });

        DrawingDto result = drawingService.createDrawing(workspaceId, userId, request);

        assertNotNull(result);
        assertEquals("Sistem Mimarisi Diyagramı", result.title());
        assertTrue(result.documentData().contains("el1"));
        verify(accessService).checkWorkspaceAccess(workspaceId, userId);
        verify(drawingRepository).save(any(DrawingDocument.class));
    }

    @Test
    @DisplayName("updateDrawing: successfully updates documentData and title")
    void updateDrawing_success() {
        UUID drawingId = UUID.randomUUID();
        DrawingDocument existing = new DrawingDocument();
        existing.setId(drawingId);
        existing.setWorkspaceId(workspaceId);
        existing.setTitle("Eski Diyagram");
        existing.setVersion(0L);
        existing.setDocumentData("{}");

        when(drawingRepository.findByIdAndWorkspaceId(drawingId, workspaceId)).thenReturn(Optional.of(existing));
        when(drawingRepository.saveAndFlush(any(DrawingDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateDrawingRequest request = new UpdateDrawingRequest(
                "Güncel Diyagram",
                "{\"elements\":[{\"id\":\"el2\"}]}",
                0L
        );

        DrawingDto updated = drawingService.updateDrawing(workspaceId, drawingId, userId, request);

        assertNotNull(updated);
        assertEquals("Güncel Diyagram", updated.title());
        assertEquals("{\"elements\":[{\"id\":\"el2\"}]}", updated.documentData());
        verify(drawingRepository).saveAndFlush(existing);
    }

    @Test
    @DisplayName("updateDrawing: throws ConflictException when version does not match")
    void updateDrawing_versionMismatch_throwsConflict() {
        UUID drawingId = UUID.randomUUID();
        DrawingDocument existing = new DrawingDocument();
        existing.setId(drawingId);
        existing.setWorkspaceId(workspaceId);
        existing.setVersion(5L);

        when(drawingRepository.findByIdAndWorkspaceId(drawingId, workspaceId)).thenReturn(Optional.of(existing));

        UpdateDrawingRequest request = new UpdateDrawingRequest(
                "Diyagram",
                "{}",
                4L // Outdated version
        );

        assertThrows(ConflictException.class, () ->
                drawingService.updateDrawing(workspaceId, drawingId, userId, request)
        );
        verify(drawingRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("getDrawing: throws ResourceNotFoundException when drawing does not exist")
    void getDrawing_notFound_throwsException() {
        UUID drawingId = UUID.randomUUID();
        when(drawingRepository.findByIdAndWorkspaceId(drawingId, workspaceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                drawingService.getDrawing(workspaceId, drawingId, userId)
        );
    }

    @Test
    @DisplayName("listDrawings: returns list of summaries without heavy documentData")
    void listDrawings_success() {
        DrawingSummaryDto summary = new DrawingSummaryDto(
                UUID.randomUUID(), workspaceId, "Pano", userId, 0L, Instant.now(), Instant.now()
        );
        when(drawingRepository.findSummariesByWorkspaceId(workspaceId)).thenReturn(List.of(summary));

        List<DrawingSummaryDto> result = drawingService.listDrawings(workspaceId, userId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Pano", result.get(0).title());
    }

    @Test
    @DisplayName("deleteDrawing: deletes existing drawing")
    void deleteDrawing_success() {
        UUID drawingId = UUID.randomUUID();
        DrawingDocument existing = new DrawingDocument();
        existing.setId(drawingId);
        existing.setWorkspaceId(workspaceId);

        when(drawingRepository.findByIdAndWorkspaceId(drawingId, workspaceId)).thenReturn(Optional.of(existing));

        drawingService.deleteDrawing(workspaceId, drawingId, userId);

        verify(drawingRepository).delete(existing);
        // Panolardaki hayalet kartların kalmaması için ilişikli kartlar da silinmeli
        verify(boardItemRepository).deleteByItemTypeAndItemId("DRAWING", drawingId);
    }
}
