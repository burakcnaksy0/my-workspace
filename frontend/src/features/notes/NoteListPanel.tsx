import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  Tag as TagIcon,
  X,
  RefreshCw,
  Clock,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { NoteEditor } from './NoteEditor';
import { useToast } from '../../components/ui/toast';
import type { Note, NoteSummary, CreateNoteRequest, UpdateNoteRequest, TagItem } from '../../types/note';
import type { PagedResponse } from '../../types/task';

export const NoteListPanel: React.FC = () => {
  const toast = useToast();
  const { activeWorkspace, areas } = useAuth();
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  // Dar ekranlarda liste ve editörü aynı anda göstermek yerine tek panel gösterilir.
  const [isListVisible, setIsListVisible] = useState(true);

  const workspaceId = activeWorkspace?.id;

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Tags
  const fetchTags = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const data = await apiRequest<TagItem[]>(`/api/workspaces/${workspaceId}/tags`);
      setTags(data);
    } catch (err) {
      console.error('Etiketler yüklenemedi:', err);
    }
  }, [workspaceId]);

  // Fetch Note List
  const fetchNotes = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery.trim()) params.append('q', debouncedSearchQuery.trim());
      if (selectedAreaId) params.append('areaId', selectedAreaId);
      if (selectedTag) params.append('tag', selectedTag);
      params.append('size', '50');

      const data = await apiRequest<PagedResponse<NoteSummary>>(
        `/api/workspaces/${workspaceId}/notes?${params.toString()}`
      );
      setNotes(data.content);

      // If activeNote is no longer in the list and list is not empty, or if no active note, pick first
      if (data.content.length > 0) {
        if (!activeNote || !data.content.some((n) => n.id === activeNote.id)) {
          loadNoteDetails(data.content[0].id, false);
        }
      } else {
        setActiveNote(null);
      }
    } catch (err) {
      console.error('Notlar yüklenirken hata oluştu:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, debouncedSearchQuery, selectedAreaId, selectedTag]);

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [fetchNotes, fetchTags]);

  // Load single note with content for editor
  const loadNoteDetails = async (noteId: string, revealEditor = true) => {
    if (!workspaceId) return;
    setIsEditorLoading(true);
    try {
      const noteData = await apiRequest<Note>(`/api/workspaces/${workspaceId}/notes/${noteId}`);
      setActiveNote(noteData);
      if (revealEditor) setIsListVisible(false);
    } catch (err) {
      console.error('Not detayları yüklenemedi:', err);
    } finally {
      setIsEditorLoading(false);
    }
  };

  // Create New Note
  const handleCreateNote = async () => {
    if (!workspaceId) return;
    setIsCreating(true);
    try {
      const defaultTitle = 'Yeni Not ' + new Date().toLocaleDateString('tr-TR');
      const req: CreateNoteRequest = {
        title: defaultTitle,
        areaId: selectedAreaId || null,
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        contentText: '',
        contentFormat: 'tiptap-json-v1',
        tags: selectedTag ? [selectedTag] : [],
      };

      const created = await apiRequest<Note>(`/api/workspaces/${workspaceId}/notes`, {
        method: 'POST',
        body: JSON.stringify(req),
      });

      // Refresh tags and list
      fetchTags();
      await fetchNotes();
      setActiveNote(created);
      setIsListVisible(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Not oluşturulurken hata meydana geldi');
    } finally {
      setIsCreating(false);
    }
  };

  // Update Note Handler (called by NoteEditor)
  const handleUpdateNote = async (req: UpdateNoteRequest): Promise<Note> => {
    if (!workspaceId || !activeNote) throw new Error('Geçersiz istek');

    const updated = await apiRequest<Note>(
      `/api/workspaces/${workspaceId}/notes/${activeNote.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(req),
      }
    );

    setActiveNote(updated);

    // Update summary in local list without full reload
    setNotes((prev) =>
      prev.map((n) =>
        n.id === updated.id
          ? {
              ...n,
              title: updated.title,
              areaId: updated.areaId,
              tags: updated.tags,
              version: updated.version,
              snippet: (updated.contentText || '').substring(0, 150),
              updatedAt: updated.updatedAt,
            }
          : n
      )
    );

    fetchTags();
    return updated;
  };

  // Delete Note Handler
  const handleDeleteNote = async (noteId: string) => {
    if (!workspaceId) return;
    try {
      await apiRequest(`/api/workspaces/${workspaceId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      setActiveNote(null);
      setIsListVisible(true);
      await fetchNotes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Not silinemedi');
    }
  };

  return (
    <div className="flex-1 flex min-h-0 w-full h-full gap-4 sm:gap-5 p-3 sm:p-6 overflow-hidden bg-transparent">
      {/* Left Sidebar: Note List & Search */}
      <div
        className={`${
          isListVisible ? 'flex' : 'hidden xl:flex'
        } w-full xl:w-80 2xl:w-96 flex-col shrink-0 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md`}
      >
        {/* Header & New Note Button */}
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-blue-400" />
              Notlar
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {notes.length}
              </span>
            </h2>
            <button
              onClick={handleCreateNote}
              disabled={isCreating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Not
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Notlarda ara (başlık veya metin)..."
              className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] custom-scrollbar">
            {/* Area Filter */}
            <select
              value={selectedAreaId || ''}
              onChange={(e) => setSelectedAreaId(e.target.value || null)}
              className="bg-slate-800 border border-slate-700/80 rounded-md px-2 py-0.5 text-slate-300 focus:outline-none"
            >
              <option value="">Tüm Alanlar</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 bg-blue-900/50 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-md shrink-0">
                #{selectedTag}
                <button onClick={() => setSelectedTag(null)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Note List Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
              <span>Notlar getiriliyor...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center px-4">
              <FileText className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-slate-300">Henüz not bulunamadı</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {searchQuery || selectedAreaId || selectedTag
                  ? 'Arama kriterlerinize uygun not bulunamadı.'
                  : 'İlk notunuzu oluşturarak başlayın.'}
              </p>
            </div>
          ) : (
            notes.map((item) => {
              const isSelected = activeNote?.id === item.id;
              const area = areas.find((a) => a.id === item.areaId);

              return (
                <div
                  key={item.id}
                  onClick={() => loadNoteDetails(item.id)}
                  className={`p-3 rounded-xl cursor-pointer transition text-left border ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/40 shadow-sm'
                      : 'bg-slate-800/30 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white truncate flex-1">
                      {item.title || 'Başlıksız Not'}
                    </h4>
                    {isSelected && <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {item.snippet || 'İçerik henüz girilmemiş.'}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      {area && (
                        <span
                          className="px-1.5 py-0.5 rounded font-medium truncate"
                          style={{
                            backgroundColor: `${area.color || '#3b82f6'}20`,
                            color: area.color || '#3b82f6',
                          }}
                        >
                          {area.name}
                        </span>
                      )}
                      {item.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(item.updatedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tags Quick Access Footer */}
        {tags.length > 0 && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <TagIcon className="w-3 h-3" /> Etiketler
            </div>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto custom-scrollbar">
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition ${
                    selectedTag === t.name
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Area: Note Editor */}
      <div
        className={`${
          isListVisible ? 'hidden xl:flex' : 'flex'
        } flex-1 flex-col h-full min-w-0 overflow-hidden`}
      >
        <button
          onClick={() => setIsListVisible(true)}
          className="xl:hidden mb-2 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Notlara Dön
        </button>
        {isEditorLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mb-2" />
            <span>Not yükleniyor...</span>
          </div>
        ) : activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            areas={areas}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">Not Seçilmedi</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Düzenlemek için sol listeden bir not seçin veya yeni bir not oluşturarak zengin metin
              deneyimine başlayın.
            </p>
            <button
              onClick={handleCreateNote}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              İlk Notu Oluştur
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
