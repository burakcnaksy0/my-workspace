package com.personalworkspace;

import com.personalworkspace.boards.dto.*;
import com.personalworkspace.boards.entity.Board;
import com.personalworkspace.boards.entity.BoardColumn;
import com.personalworkspace.boards.entity.BoardEdge;
import com.personalworkspace.boards.entity.BoardItem;
import com.personalworkspace.boards.repository.BoardColumnRepository;
import com.personalworkspace.boards.repository.BoardEdgeRepository;
import com.personalworkspace.boards.repository.BoardItemRepository;
import com.personalworkspace.boards.repository.BoardRepository;
import com.personalworkspace.boards.service.BoardService;
import com.personalworkspace.common.exception.ConflictException;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.drawings.repository.DrawingRepository;
import com.personalworkspace.notes.repository.NoteRepository;
import com.personalworkspace.task.entity.Task;
import com.personalworkspace.task.repository.TaskRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private BoardColumnRepository columnRepository;

    @Mock
    private BoardItemRepository itemRepository;

    @Mock
    private BoardEdgeRepository edgeRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private DrawingRepository drawingRepository;

    @Mock
    private WorkspaceAccessService accessService;

    private BoardService boardService;

    private final UUID workspaceId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        boardService = new BoardService(
                boardRepository,
                columnRepository,
                itemRepository,
                edgeRepository,
                taskRepository,
                noteRepository,
                drawingRepository,
                accessService
        );
    }

    @Test
    @DisplayName("createBoard: Sütunlu pano oluşturulduğunda varsayılan sütunlar eklenir")
    void createBoard_columns_success() {
        CreateBoardRequest req = new CreateBoardRequest("Proje Kanban", "COLUMNS", null, "{}", null);

        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> {
            Board b = inv.getArgument(0);
            b.setId(UUID.randomUUID());
            b.setVersion(0L);
            return b;
        });

        when(columnRepository.save(any(BoardColumn.class))).thenAnswer(inv -> {
            BoardColumn col = inv.getArgument(0);
            col.setId(UUID.randomUUID());
            return col;
        });

        BoardDetailsDto result = boardService.createBoard(workspaceId, userId, req);

        assertNotNull(result);
        assertEquals("Proje Kanban", result.name());
        assertEquals("COLUMNS", result.boardType());
        assertEquals(3, result.columns().size());
        verify(accessService).checkWorkspaceAccess(workspaceId, userId);
        verify(boardRepository).save(any(Board.class));
        verify(columnRepository, times(3)).save(any(BoardColumn.class));
    }

    @Test
    @DisplayName("addItem: Görevi panoya ekler ve çalışma alanı kontrolü yapar")
    void addItem_task_success() {
        UUID boardId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        UUID columnId = UUID.randomUUID();

        Board board = new Board();
        board.setId(boardId);
        board.setWorkspaceId(workspaceId);
        board.setBoardType("COLUMNS");

        Task task = new Task();
        task.setId(taskId);
        task.setWorkspaceId(workspaceId);
        task.setTitle("Backend Testi");
        task.setStatus("TODO");

        BoardColumn col = new BoardColumn();
        col.setId(columnId);
        col.setBoardId(boardId);
        col.setName("Yapılacak");
        col.setMappedStatus("TODO");

        when(boardRepository.findByIdAndWorkspaceId(boardId, workspaceId)).thenReturn(Optional.of(board));
        when(taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)).thenReturn(Optional.of(task));
        when(itemRepository.findByBoardIdAndItemTypeAndItemId(boardId, "TASK", taskId)).thenReturn(Optional.empty());
        when(columnRepository.findByIdAndBoardId(columnId, boardId)).thenReturn(Optional.of(col));

        when(itemRepository.save(any(BoardItem.class))).thenAnswer(inv -> {
            BoardItem bi = inv.getArgument(0);
            bi.setId(UUID.randomUUID());
            return bi;
        });

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        CreateBoardItemRequest req = new CreateBoardItemRequest("TASK", taskId, 0.0, 0.0, 200.0, 100.0, 0, columnId);
        BoardItemDto itemDto = boardService.addItem(workspaceId, boardId, userId, req);

        assertNotNull(itemDto);
        assertEquals("TASK", itemDto.itemType());
        assertEquals(taskId, itemDto.itemId());
        assertEquals("Backend Testi", itemDto.itemDetails().get("title"));
    }

    @Test
    @DisplayName("addItem: Başka çalışma alanına ait öğe eklenemez (404/ResourceNotFoundException)")
    void addItem_foreignWorkspace_throwsResourceNotFound() {
        UUID boardId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();

        Board board = new Board();
        board.setId(boardId);
        board.setWorkspaceId(workspaceId);

        when(boardRepository.findByIdAndWorkspaceId(boardId, workspaceId)).thenReturn(Optional.of(board));
        when(taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)).thenReturn(Optional.empty());

        CreateBoardItemRequest req = new CreateBoardItemRequest("TASK", taskId, 0.0, 0.0, null, null, 0, null);

        assertThrows(ResourceNotFoundException.class, () ->
                boardService.addItem(workspaceId, boardId, userId, req)
        );
    }

    @Test
    @DisplayName("addItem: Aynı öğe aynı panoya iki kez eklenemez (ConflictException)")
    void addItem_duplicate_throwsConflict() {
        UUID boardId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();

        Board board = new Board();
        board.setId(boardId);
        board.setWorkspaceId(workspaceId);

        Task task = new Task();
        task.setId(taskId);
        task.setWorkspaceId(workspaceId);

        BoardItem existingItem = new BoardItem();
        existingItem.setId(UUID.randomUUID());

        when(boardRepository.findByIdAndWorkspaceId(boardId, workspaceId)).thenReturn(Optional.of(board));
        when(taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)).thenReturn(Optional.of(task));
        when(itemRepository.findByBoardIdAndItemTypeAndItemId(boardId, "TASK", taskId)).thenReturn(Optional.of(existingItem));

        CreateBoardItemRequest req = new CreateBoardItemRequest("TASK", taskId, 0.0, 0.0, null, null, 0, null);

        assertThrows(ConflictException.class, () ->
                boardService.addItem(workspaceId, boardId, userId, req)
        );
    }

    @Test
    @DisplayName("batchUpdateItems: Sütun değiştiğinde mappedStatus görev durumuna senkronize edilir")
    void batchUpdateItems_syncsMappedStatus() {
        UUID boardId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        UUID doneColId = UUID.randomUUID();

        Board board = new Board();
        board.setId(boardId);
        board.setWorkspaceId(workspaceId);

        BoardItem item = new BoardItem();
        item.setId(itemId);
        item.setBoardId(boardId);
        item.setItemType("TASK");
        item.setItemId(taskId);
        item.setColumnId(UUID.randomUUID());

        BoardColumn doneCol = new BoardColumn();
        doneCol.setId(doneColId);
        doneCol.setBoardId(boardId);
        doneCol.setName("Tamamlanan");
        doneCol.setMappedStatus("DONE");

        Task task = new Task();
        task.setId(taskId);
        task.setStatus("IN_PROGRESS");

        when(boardRepository.findByIdAndWorkspaceId(boardId, workspaceId)).thenReturn(Optional.of(board));
        when(itemRepository.findByIdAndBoardId(itemId, boardId)).thenReturn(Optional.of(item));
        when(columnRepository.findByIdAndBoardId(doneColId, boardId)).thenReturn(Optional.of(doneCol));
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(itemRepository.save(any(BoardItem.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateBoardItemPositionRequest posReq = new UpdateBoardItemPositionRequest(itemId, 10.0, 20.0, null, null, 1, doneColId);
        BatchUpdateItemsRequest req = new BatchUpdateItemsRequest(List.of(posReq));

        List<BoardItemDto> updated = boardService.batchUpdateItems(workspaceId, boardId, userId, req);

        assertEquals(1, updated.size());
        assertEquals("DONE", task.getStatus());
        assertNotNull(task.getCompletedAt());
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("removeItem: Panodan kart silindiğinde asıl görev veya not silinmez")
    void removeItem_doesNotDeleteOriginalResource() {
        UUID boardId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();

        Board board = new Board();
        board.setId(boardId);
        board.setWorkspaceId(workspaceId);

        BoardItem item = new BoardItem();
        item.setId(itemId);
        item.setBoardId(boardId);
        item.setItemType("TASK");
        item.setItemId(UUID.randomUUID());

        when(boardRepository.findByIdAndWorkspaceId(boardId, workspaceId)).thenReturn(Optional.of(board));
        when(itemRepository.findByIdAndBoardId(itemId, boardId)).thenReturn(Optional.of(item));

        boardService.removeItem(workspaceId, boardId, itemId, userId);

        verify(itemRepository).delete(item);
        verify(edgeRepository).deleteBySourceItemIdOrTargetItemId(itemId);
        verifyNoInteractions(taskRepository);
        verifyNoInteractions(noteRepository);
    }
}
