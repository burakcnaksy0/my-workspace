import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../../types/note';

describe('NoteEditor Component', () => {
  const mockNote: Note = {
    id: 'note-1',
    workspaceId: 'ws-1',
    areaId: null,
    title: 'Örnek Not',
    content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
    contentText: 'Örnek metin',
    contentFormat: 'tiptap-json-v1',
    tags: ['test', 'not'],
    createdBy: 'user-1',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders note title, tags, and toolbar buttons', () => {
    const handleUpdate = vi.fn().mockResolvedValue(mockNote);
    const handleDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <NoteEditor
        note={mockNote}
        areas={[]}
        onUpdateNote={handleUpdate}
        onDeleteNote={handleDelete}
      />
    );

    expect(screen.getByDisplayValue('Örnek Not')).toBeInTheDocument();
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#not')).toBeInTheDocument();
    expect(screen.getByTitle('Manuel Kaydet (Ctrl + S)')).toBeInTheDocument();
    expect(screen.getByTitle('Notu Sil')).toBeInTheDocument();
  });

  it('allows editing title and adding new tag on Enter', () => {
    const handleUpdate = vi.fn().mockResolvedValue(mockNote);
    const handleDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <NoteEditor
        note={mockNote}
        areas={[]}
        onUpdateNote={handleUpdate}
        onDeleteNote={handleDelete}
      />
    );

    const titleInput = screen.getByDisplayValue('Örnek Not');
    fireEvent.change(titleInput, { target: { value: 'Güncel Başlık' } });
    expect(screen.getByDisplayValue('Güncel Başlık')).toBeInTheDocument();

    const tagInput = screen.getByPlaceholderText('Etiket ekle... (Enter)');
    fireEvent.change(tagInput, { target: { value: 'yeni-etiket' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('#yeni-etiket')).toBeInTheDocument();
  });
});
