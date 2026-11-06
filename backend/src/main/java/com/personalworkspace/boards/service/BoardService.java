package com.personalworkspace.boards.service;

import com.personalworkspace.boards.dto.*;
import com.personalworkspace.boards.entity.Board;
import com.personalworkspace.boards.entity.BoardColumn;
import com.personalworkspace.boards.entity.BoardEdge;
import com.personalworkspace.boards.entity.BoardItem;
import com.personalworkspace.boards.repository.BoardColumnRepository;
import com.personalworkspace.boards.repository.BoardEdgeRepository;
import com.personalworkspace.boards.repository.BoardItemRepository;
import com.personalworkspace.boards.repository.BoardRepository;
import com.personalworkspace.common.exception.BadRequestException;
import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.drawings.entity.DrawingDocument;
import com.personalworkspace.drawings.repository.DrawingRepository;
import com.personalworkspace.notes.entity.Note;
import com.personalworkspace.notes.repository.NoteRepository;
import com.personalworkspace.task.entity.Task;
import com.personalworkspace.task.repository.TaskRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BoardService {

    private static final Logger log = LoggerFactory.getLogger(BoardService.class);

    private final BoardRepository boardRepository;
    private final BoardColumnRepository columnRepository;
    private final BoardItemRepository itemRepository;
    private final BoardEdgeRepository edgeRepository;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final DrawingRepository drawingRepository;
    private final WorkspaceAccessService accessService;

    public BoardService(
            BoardRepository boardRepository,
            BoardColumnRepository columnRepository,
            BoardItemRepository itemRepository,
            BoardEdgeRepository edgeRepository,
            TaskRepository taskRepository,
            NoteRepository noteRepository,
            DrawingRepository drawingRepository,
            WorkspaceAccessService accessService
    ) {
        this.boardRepository = boardRepository;
        this.columnRepository = columnRepository;
        this.itemRepository = itemRepository;
        this.edgeRepository = edgeRepository;
        this.taskRepository = taskRepository;
        this.noteRepository = noteRepository;
        this.drawingRepository = drawingRepository;
        this.accessService = accessService;
    }

    @Transactional(readOnly = true)
    public List<BoardSummaryDto> getBoards(UUID workspaceId, UUID userId, UUID areaId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        List<Board> boards = (areaId != null)
                ? boardRepository.findByWorkspaceIdAndAreaIdOrderByCreatedAtDesc(workspaceId, areaId)
                : boardRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        return boards.stream().map(BoardSummaryDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public BoardDetailsDto getBoardDetails(UUID workspaceId, UUID boardId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        Board board = findBoardOrThrow(workspaceId, boardId);

        List<BoardColumn> columns = columnRepository.findByBoardIdOrderBySortOrderAsc(boardId);
        List<BoardItem> items = itemRepository.findByBoardIdOrderBySortOrderAsc(boardId);
        List<BoardEdge> edges = edgeRepository.findByBoardId(boardId);

        List<BoardColumnDto> columnDtos = columns.stream().map(BoardColumnDto::fromEntity).toList();
        List<BoardItemDto> itemDtos = mapItemsToDtos(items);
        List<BoardEdgeDto> edgeDtos = edges.stream().map(BoardEdgeDto::fromEntity).toList();

        return BoardDetailsDto.fromEntity(board, columnDtos, itemDtos, edgeDtos);
    }

    public BoardDetailsDto createBoard(UUID workspaceId, UUID userId, CreateBoardRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        String boardType = (req.boardType() != null && !req.boardType().isBlank())
                ? req.boardType().toUpperCase()
                : "COLUMNS";

        if (!"COLUMNS".equals(boardType) && !"FREEFORM".equals(boardType)) {
            throw new BadRequestException("Geçersiz pano türü: " + boardType + ". COLUMNS veya FREEFORM olmalıdır.");
        }

        Board board = new Board();
        board.setWorkspaceId(workspaceId);
        board.setAreaId(req.areaId());
        board.setName(req.name().trim());
        board.setBoardType(boardType);
        board.setLayoutConfig((req.layoutConfig() != null && !req.layoutConfig().isBlank()) ? req.layoutConfig() : "{}");
        board.setCreatedAt(Instant.now());
        board.setUpdatedAt(Instant.now());

        Board saved = boardRepository.save(board);
        log.info("Pano oluşturuldu: id={}, workspace={}, name='{}', type={}", saved.getId(), workspaceId, saved.getName(), saved.getBoardType());

        List<BoardColumn> createdColumns = new ArrayList<>();
        if ("COLUMNS".equals(boardType)) {
            if (req.initialColumns() != null && !req.initialColumns().isEmpty()) {
                for (int i = 0; i < req.initialColumns().size(); i++) {
                    CreateColumnRequest colReq = req.initialColumns().get(i);
                    BoardColumn col = new BoardColumn();
                    col.setBoardId(saved.getId());
                    col.setName(colReq.name().trim());
                    col.setSortOrder(colReq.sortOrder() != null ? colReq.sortOrder() : i);
                    col.setMappedStatus(colReq.mappedStatus());
                    col.setCreatedAt(Instant.now());
                    col.setUpdatedAt(Instant.now());
                    createdColumns.add(columnRepository.save(col));
                }
            } else {
                // Varsayılan kanban sütunları
                createdColumns.add(createDefaultColumn(saved.getId(), "Yapılacak", 0, "TODO"));
                createdColumns.add(createDefaultColumn(saved.getId(), "Devam Eden", 1, "IN_PROGRESS"));
                createdColumns.add(createDefaultColumn(saved.getId(), "Tamamlanan", 2, "DONE"));
            }
        }

        List<BoardColumnDto> columnDtos = createdColumns.stream().map(BoardColumnDto::fromEntity).toList();
        return BoardDetailsDto.fromEntity(saved, columnDtos, List.of(), List.of());
    }

    public BoardDetailsDto updateBoard(UUID workspaceId, UUID boardId, UUID userId, UpdateBoardRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        Board board = findBoardOrThrow(workspaceId, boardId);

        if (!board.getVersion().equals(req.version())) {
            throw new ConflictException("Pano başka bir yerden güncellenmiş. Mevcut sürüm: "
                    + board.getVersion() + ", gönderilen sürüm: " + req.version());
        }

        board.setName(req.name().trim());
        board.setAreaId(req.areaId());
        if (req.layoutConfig() != null) {
            board.setLayoutConfig(req.layoutConfig());
        }
        board.setUpdatedAt(Instant.now());

        try {
            board = boardRepository.save(board);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Pano eşzamanlı olarak güncellendi. Lütfen sayfayı yenileyiniz.");
        }

        return getBoardDetails(workspaceId, boardId, userId);
    }

    public void deleteBoard(UUID workspaceId, UUID boardId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        Board board = findBoardOrThrow(workspaceId, boardId);

        edgeRepository.deleteByBoardId(boardId);
        itemRepository.deleteByBoardId(boardId);
        columnRepository.deleteByBoardId(boardId);
        boardRepository.delete(board);

        log.info("Pano ve panoya ait öğeler silindi: id={}", boardId);
    }

    // ================= Sütun İşlemleri =================

    public BoardColumnDto createColumn(UUID workspaceId, UUID boardId, UUID userId, CreateColumnRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        Board board = findBoardOrThrow(workspaceId, boardId);

        if (!"COLUMNS".equals(board.getBoardType())) {
            throw new BadRequestException("Yalnızca COLUMNS türündeki panolara sütun eklenebilir.");
        }

        int nextOrder = req.sortOrder() != null ? req.sortOrder() : columnRepository.findByBoardIdOrderBySortOrderAsc(boardId).size();

        BoardColumn col = new BoardColumn();
        col.setBoardId(boardId);
        col.setName(req.name().trim());
        col.setSortOrder(nextOrder);
        col.setMappedStatus(req.mappedStatus());
        col.setCreatedAt(Instant.now());
        col.setUpdatedAt(Instant.now());

        BoardColumn saved = columnRepository.save(col);
        return BoardColumnDto.fromEntity(saved);
    }

    public BoardColumnDto updateColumn(UUID workspaceId, UUID boardId, UUID columnId, UUID userId, UpdateColumnRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        findBoardOrThrow(workspaceId, boardId);

        BoardColumn col = columnRepository.findByIdAndBoardId(columnId, boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Sütun bulunamadı: " + columnId));

        col.setName(req.name().trim());
        if (req.sortOrder() != null) {
            col.setSortOrder(req.sortOrder());
        }
        col.setMappedStatus(req.mappedStatus());
        col.setUpdatedAt(Instant.now());

        BoardColumn saved = columnRepository.save(col);
        return BoardColumnDto.fromEntity(saved);
    }

    public void deleteColumn(UUID workspaceId, UUID boardId, UUID columnId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        findBoardOrThrow(workspaceId, boardId);

        BoardColumn col = columnRepository.findByIdAndBoardId(columnId, boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Sütun bulunamadı: " + columnId));

        // Master prompt v2: Sütundaki kartların column_id'sini null yap (asıl görev/not silinmez)
        List<BoardItem> items = itemRepository.findByColumnId(columnId);
        for (BoardItem item : items) {
            item.setColumnId(null);
            itemRepository.save(item);
        }

        columnRepository.delete(col);
        log.info("Sütun silindi: id={}, boardId={}", columnId, boardId);
    }

    // ================= Öğe (BoardItem) İşlemleri =================

    public BoardItemDto addItem(UUID workspaceId, UUID boardId, UUID userId, CreateBoardItemRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        Board board = findBoardOrThrow(workspaceId, boardId);

        // 1. Çalışma alanı izolasyon kontrolü & öğe varlığı doğrulaması
        validateItemBelongsToWorkspace(workspaceId, req.itemType(), req.itemId());

        // 2. uq_board_item benzersizlik kontrolü
        if (itemRepository.findByBoardIdAndItemTypeAndItemId(boardId, req.itemType(), req.itemId()).isPresent()) {
            throw new ConflictException("Bu " + req.itemType() + " zaten panoya eklenmiş.");
        }

        // Sütun geçerliliği
        if (req.columnId() != null) {
            BoardColumn col = columnRepository.findByIdAndBoardId(req.columnId(), boardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Sütun bulunamadı: " + req.columnId()));

            // Mapped status senkronizasyonu
            if ("TASK".equals(req.itemType()) && col.getMappedStatus() != null && !col.getMappedStatus().isBlank()) {
                syncTaskStatus(req.itemId(), col.getMappedStatus());
            }
        }

        BoardItem item = new BoardItem();
        item.setBoardId(boardId);
        item.setItemType(req.itemType());
        item.setItemId(req.itemId());
        item.setPositionX(req.positionX() != null ? req.positionX() : 0);
        item.setPositionY(req.positionY() != null ? req.positionY() : 0);
        item.setWidth(req.width());
        item.setHeight(req.height());
        item.setSortOrder(req.sortOrder() != null ? req.sortOrder() : 0);
        item.setColumnId(req.columnId());
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());

        BoardItem saved = itemRepository.save(item);
        log.info("Panoya öğe eklendi: item_id={}, board_id={}, type={}", saved.getId(), boardId, saved.getItemType());
        return mapItemToDto(saved);
    }

    public List<BoardItemDto> batchUpdateItems(UUID workspaceId, UUID boardId, UUID userId, BatchUpdateItemsRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        findBoardOrThrow(workspaceId, boardId);

        List<BoardItemDto> updatedDtos = new ArrayList<>();
        Map<UUID, BoardColumn> columnCache = new HashMap<>();

        for (UpdateBoardItemPositionRequest itemReq : req.items()) {
            BoardItem item = itemRepository.findByIdAndBoardId(itemReq.id(), boardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Pano öğesi bulunamadı: " + itemReq.id()));

            if (itemReq.positionX() != null) item.setPositionX(itemReq.positionX());
            if (itemReq.positionY() != null) item.setPositionY(itemReq.positionY());
            if (itemReq.width() != null) item.setWidth(itemReq.width());
            if (itemReq.height() != null) item.setHeight(itemReq.height());
            if (itemReq.sortOrder() != null) item.setSortOrder(itemReq.sortOrder());

            if (itemReq.columnId() != null && !Objects.equals(item.getColumnId(), itemReq.columnId())) {
                BoardColumn col = columnCache.computeIfAbsent(itemReq.columnId(), id ->
                        columnRepository.findByIdAndBoardId(id, boardId)
                                .orElseThrow(() -> new ResourceNotFoundException("Sütun bulunamadı: " + id))
                );
                item.setColumnId(itemReq.columnId());

                // mapped_status senkronizasyonu
                if ("TASK".equals(item.getItemType()) && col.getMappedStatus() != null && !col.getMappedStatus().isBlank()) {
                    syncTaskStatus(item.getItemId(), col.getMappedStatus());
                }
            } else if (itemReq.columnId() == null && item.getColumnId() != null) {
                item.setColumnId(null);
            }

            item.setUpdatedAt(Instant.now());
            BoardItem saved = itemRepository.save(item);
            updatedDtos.add(mapItemToDto(saved));
        }

        return updatedDtos;
    }

    public void removeItem(UUID workspaceId, UUID boardId, UUID itemId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        findBoardOrThrow(workspaceId, boardId);

        BoardItem item = itemRepository.findByIdAndBoardId(itemId, boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Pano öğesi bulunamadı: " + itemId));

        // Bağlı kenarları temizle
        edgeRepository.deleteBySourceItemIdOrTargetItemId(itemId);

        // Yalnızca panodaki temsili sil, asıl Task/Note/Drawing'i ASLA SİLME!
        itemRepository.delete(item);
        log.info("Öğe panodan kaldırıldı (asıl kaynak korundu): item_id={}, board_id={}", itemId, boardId);
    }

    // ================= Bağlantı (BoardEdge) İşlemleri =================

    public BoardEdgeDto createEdge(UUID workspaceId, UUID boardId, UUID userId, CreateBoardEdgeRequest req) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        findBoardOrThrow(workspaceId, boardId);

        if (req.sourceItemId().equals(req.targetItemId())) {
            throw new BadRequestException("Bir öğe kendisine bağlanamaz.");
        }

        itemRepository.findByIdAndBoardId(req.sourceItemId(), boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Kaynak öğe panoda bulunamadı: " + req.sourceItemId()));

        itemRepository.findByIdAndBoardId(req.targetItemId(), boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Hedef öğe panoda bulunamadı: " + req.targetItemId()));

        BoardEdge edge = new BoardEdge(boardId, req.sourceItemId(), req.targetItemId(), req.label());
        BoardEdge saved = edgeRepository.save(edge);
        log.info("Pano bağlantısı oluşturuldu: edge_id={}, board_id={}", saved.getId(), boardId);
        return BoardEdgeDto.fromEntity(saved);
    }

    public void deleteEdge(UUID workspaceId, UUID boardId, UUID edgeId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        findBoardOrThrow(workspaceId, boardId);

        BoardEdge edge = edgeRepository.findByIdAndBoardId(edgeId, boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Bağlantı bulunamadı: " + edgeId));

        edgeRepository.delete(edge);
        log.info("Pano bağlantısı silindi: edge_id={}", edgeId);
    }

    // ================= Yardımcı Metotlar =================

    private Board findBoardOrThrow(UUID workspaceId, UUID boardId) {
        return boardRepository.findByIdAndWorkspaceId(boardId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Pano bulunamadı: " + boardId));
    }

    private BoardColumn createDefaultColumn(UUID boardId, String name, int order, String mappedStatus) {
        BoardColumn col = new BoardColumn();
        col.setBoardId(boardId);
        col.setName(name);
        col.setSortOrder(order);
        col.setMappedStatus(mappedStatus);
        col.setCreatedAt(Instant.now());
        col.setUpdatedAt(Instant.now());
        return columnRepository.save(col);
    }

    private void validateItemBelongsToWorkspace(UUID workspaceId, String itemType, UUID itemId) {
        switch (itemType) {
            case "TASK" -> {
                if (taskRepository.findByIdAndWorkspaceId(itemId, workspaceId).isEmpty()) {
                    throw new ResourceNotFoundException("Görev bu çalışma alanında bulunamadı: " + itemId);
                }
            }
            case "NOTE" -> {
                if (noteRepository.findByIdAndWorkspaceId(itemId, workspaceId).isEmpty()) {
                    throw new ResourceNotFoundException("Not bu çalışma alanında bulunamadı: " + itemId);
                }
            }
            case "DRAWING" -> {
                if (drawingRepository.findByIdAndWorkspaceId(itemId, workspaceId).isEmpty()) {
                    throw new ResourceNotFoundException("Çizim bu çalışma alanında bulunamadı: " + itemId);
                }
            }
            default -> throw new BadRequestException("Bilinmeyen öğe türü: " + itemType);
        }
    }

    private void syncTaskStatus(UUID taskId, String newStatus) {
        taskRepository.findById(taskId).ifPresent(task -> {
            String oldStatus = task.getStatus();
            if (!Objects.equals(oldStatus, newStatus)) {
                task.setStatus(newStatus);
                if ("DONE".equals(newStatus) && !"DONE".equals(oldStatus)) {
                    task.setCompletedAt(Instant.now());
                } else if (!"DONE".equals(newStatus) && "DONE".equals(oldStatus)) {
                    task.setCompletedAt(null);
                }
                taskRepository.save(task);
                log.info("Pano sütun hareketi nedeniyle görev durumu güncellendi: id={}, {} -> {}", taskId, oldStatus, newStatus);
            }
        });
    }

    /**
     * Panodaki tüm öğelerin detaylarını tür başına TEK sorgu ile toplu yükler (N+1 önleme).
     */
    private List<BoardItemDto> mapItemsToDtos(List<BoardItem> items) {
        if (items.isEmpty()) {
            return List.of();
        }

        Set<UUID> taskIds = new HashSet<>();
        Set<UUID> noteIds = new HashSet<>();
        Set<UUID> drawingIds = new HashSet<>();
        for (BoardItem item : items) {
            switch (item.getItemType()) {
                case "TASK" -> taskIds.add(item.getItemId());
                case "NOTE" -> noteIds.add(item.getItemId());
                case "DRAWING" -> drawingIds.add(item.getItemId());
            }
        }

        Map<UUID, Task> tasksById = taskIds.isEmpty() ? Map.of()
                : taskRepository.findAllById(taskIds).stream()
                        .collect(Collectors.toMap(Task::getId, t -> t));
        Map<UUID, Note> notesById = noteIds.isEmpty() ? Map.of()
                : noteRepository.findAllById(noteIds).stream()
                        .collect(Collectors.toMap(Note::getId, n -> n));
        Map<UUID, DrawingDocument> drawingsById = drawingIds.isEmpty() ? Map.of()
                : drawingRepository.findAllById(drawingIds).stream()
                        .collect(Collectors.toMap(DrawingDocument::getId, d -> d));

        List<BoardItemDto> result = new ArrayList<>(items.size());
        for (BoardItem item : items) {
            Map<String, Object> details = new HashMap<>();
            switch (item.getItemType()) {
                case "TASK" -> {
                    Task t = tasksById.get(item.getItemId());
                    if (t != null) {
                        details.put("title", t.getTitle());
                        details.put("status", t.getStatus());
                        details.put("priority", t.getPriority());
                        details.put("dueAt", t.getDueAt());
                        details.put("version", t.getVersion());
                        details.put("description", t.getDescription());
                    }
                }
                case "NOTE" -> {
                    Note n = notesById.get(item.getItemId());
                    if (n != null) {
                        details.put("title", n.getTitle());
                        details.put("snippet", n.getContentText() != null && n.getContentText().length() > 100
                                ? n.getContentText().substring(0, 100) + "..." : n.getContentText());
                    }
                }
                case "DRAWING" -> {
                    DrawingDocument d = drawingsById.get(item.getItemId());
                    if (d != null) {
                        details.put("title", d.getTitle());
                    }
                }
            }
            result.add(BoardItemDto.fromEntity(item, details));
        }
        return result;
    }

    private BoardItemDto mapItemToDto(BoardItem item) {
        Map<String, Object> details = new HashMap<>();
        try {
            switch (item.getItemType()) {
                case "TASK" -> taskRepository.findById(item.getItemId()).ifPresent(t -> {
                    details.put("title", t.getTitle());
                    details.put("status", t.getStatus());
                    details.put("priority", t.getPriority());
                    details.put("dueAt", t.getDueAt());
                    details.put("version", t.getVersion());
                    details.put("description", t.getDescription());
                });
                case "NOTE" -> noteRepository.findById(item.getItemId()).ifPresent(n -> {
                    details.put("title", n.getTitle());
                    details.put("snippet", n.getContentText() != null && n.getContentText().length() > 100
                            ? n.getContentText().substring(0, 100) + "..." : n.getContentText());
                });
                case "DRAWING" -> drawingRepository.findById(item.getItemId()).ifPresent(d -> {
                    details.put("title", d.getTitle());
                });
            }
        } catch (Exception e) {
            log.warn("Öğe detayları yüklenirken hata: itemType={}, itemId={}", item.getItemType(), item.getItemId(), e);
        }
        return BoardItemDto.fromEntity(item, details);
    }
}
