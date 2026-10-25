import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BoardListPanel } from './BoardListPanel';
import { boardsApi } from './api';

// AuthContext mock
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u-1', username: 'admin' },
    activeWorkspace: { id: 'ws-1', name: 'Ana Çalışma Alanı' },
    areas: [{ id: 'a-1', name: 'Yazılım', color: '#3b82f6' }],
    logout: vi.fn(),
  }),
}));

// boardsApi mock
vi.mock('./api', () => ({
  boardsApi: {
    getBoards: vi.fn(),
    getBoard: vi.fn(),
    createBoard: vi.fn(),
    deleteBoard: vi.fn(),
    createColumn: vi.fn(),
    deleteColumn: vi.fn(),
    addItem: vi.fn(),
    batchUpdateItems: vi.fn(),
    removeItem: vi.fn(),
    createEdge: vi.fn(),
    deleteEdge: vi.fn(),
  },
}));

describe('BoardListPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders board list correctly when boards are available', async () => {
    vi.mocked(boardsApi.getBoards).mockResolvedValue([
      {
        id: 'b-1',
        workspaceId: 'ws-1',
        areaId: 'a-1',
        name: 'Sprint 1 Panosu',
        boardType: 'COLUMNS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    render(<BoardListPanel />);

    expect(screen.getByText('Panolar yükleniyor...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Sprint 1 Panosu')).toBeInTheDocument();
      expect(screen.getByText('Sütunlu Kanban')).toBeInTheDocument();
      expect(screen.getByText('Yazılım')).toBeInTheDocument();
    });
  });

  it('opens and loads board details when a board is clicked', async () => {
    vi.mocked(boardsApi.getBoards).mockResolvedValue([
      {
        id: 'b-1',
        workspaceId: 'ws-1',
        areaId: null,
        name: 'Proje Kanban',
        boardType: 'COLUMNS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    vi.mocked(boardsApi.getBoard).mockResolvedValue({
      id: 'b-1',
      workspaceId: 'ws-1',
      areaId: null,
      name: 'Proje Kanban',
      boardType: 'COLUMNS',
      layoutConfig: '{}',
      version: 0,
      columns: [
        { id: 'c-1', boardId: 'b-1', name: 'Yapılacak', sortOrder: 0, mappedStatus: 'TODO', createdAt: '', updatedAt: '' },
        { id: 'c-2', boardId: 'b-1', name: 'Devam Eden', sortOrder: 1, mappedStatus: 'IN_PROGRESS', createdAt: '', updatedAt: '' },
      ],
      items: [
        {
          id: 'item-1',
          boardId: 'b-1',
          itemType: 'TASK',
          itemId: 'task-1',
          positionX: 0,
          positionY: 0,
          width: null,
          height: null,
          sortOrder: 0,
          columnId: 'c-1',
          itemDetails: { title: 'Veritabanı Kurulumu', status: 'TODO', priority: 'HIGH' },
          createdAt: '',
          updatedAt: '',
        },
      ],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<BoardListPanel />);

    await waitFor(() => {
      expect(screen.getByText('Proje Kanban')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Proje Kanban'));

    await waitFor(() => {
      expect(screen.getByText('Yapılacak')).toBeInTheDocument();
      expect(screen.getByText('Devam Eden')).toBeInTheDocument();
      expect(screen.getByText('Veritabanı Kurulumu')).toBeInTheDocument();
    });
  });
});
