import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrawingEditor } from './DrawingEditor';
import type { Drawing } from '../../types/drawing';

// Mock Excalidraw since jsdom does not support full HTML5 canvas / WebGL
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: () => <div data-testid="excalidraw-canvas">Mocked Excalidraw Canvas</div>,
  getSceneVersion: vi.fn().mockReturnValue(1),
  exportToBlob: vi.fn().mockResolvedValue(new Blob([])),
  exportToSvg: vi.fn().mockResolvedValue(document.createElement('svg')),
  serializeAsJSON: vi.fn().mockReturnValue('{"elements":[]}'),
}));

describe('DrawingEditor Component', () => {
  const mockDrawing: Drawing = {
    id: 'draw-1',
    workspaceId: 'ws-1',
    title: 'Test Çizimi',
    documentData: '{"elements":[],"appState":{"theme":"dark"}}',
    createdBy: 'user-1',
    version: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders title, canvas, and action buttons', () => {
    const handleUpdate = vi.fn().mockResolvedValue(mockDrawing);
    const handleDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <DrawingEditor
        drawing={mockDrawing}
        onUpdateDrawing={handleUpdate}
        onDeleteDrawing={handleDelete}
      />
    );

    expect(screen.getByDisplayValue('Test Çizimi')).toBeInTheDocument();
    expect(screen.getByTestId('excalidraw-canvas')).toBeInTheDocument();
    expect(screen.getByTitle('Manuel Kaydet (Ctrl + S)')).toBeInTheDocument();
    expect(screen.getByTitle('Dışa Aktar (PNG, SVG, JSON)')).toBeInTheDocument();
    expect(screen.getByTitle('Çizimi Sil')).toBeInTheDocument();
  });

  it('updates title input correctly', () => {
    const handleUpdate = vi.fn().mockResolvedValue(mockDrawing);
    const handleDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <DrawingEditor
        drawing={mockDrawing}
        onUpdateDrawing={handleUpdate}
        onDeleteDrawing={handleDelete}
      />
    );

    const titleInput = screen.getByDisplayValue('Test Çizimi');
    fireEvent.change(titleInput, { target: { value: 'Yeni Mimari Tasarım' } });

    expect(screen.getByDisplayValue('Yeni Mimari Tasarım')).toBeInTheDocument();
  });
});
