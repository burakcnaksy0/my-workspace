import React, { useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Plus,
  RefreshCw,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { DrawingEditor } from './DrawingEditor';
import type { Drawing, DrawingSummary, CreateDrawingRequest, UpdateDrawingRequest } from '../../types/drawing';

export const DrawingListPanel: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [drawings, setDrawings] = useState<DrawingSummary[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<Drawing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const workspaceId = activeWorkspace?.id;

  const fetchDrawings = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const data = await apiRequest<DrawingSummary[]>(`/api/workspaces/${workspaceId}/drawings`);
      setDrawings(data);

      if (data.length > 0 && !activeDrawing) {
        loadDrawingDetails(data[0].id);
      }
    } catch (err) {
      console.error('Çizimler yüklenirken hata:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const loadDrawingDetails = async (drawingId: string) => {
    if (!workspaceId) return;
    setIsEditorLoading(true);
    try {
      const fullDrawing = await apiRequest<Drawing>(
        `/api/workspaces/${workspaceId}/drawings/${drawingId}`
      );
      setActiveDrawing(fullDrawing);
    } catch (err) {
      console.error('Çizim detayları yüklenemedi:', err);
    } finally {
      setIsEditorLoading(false);
    }
  };

  const handleCreateDrawing = async () => {
    if (!workspaceId) return;
    setIsCreating(true);
    try {
      const defaultTitle = `Mimari Çizim ${drawings.length + 1}`;
      const req: CreateDrawingRequest = {
        title: defaultTitle,
        documentData: '{"elements":[],"appState":{"theme":"dark"}}',
      };

      const created = await apiRequest<Drawing>(`/api/workspaces/${workspaceId}/drawings`, {
        method: 'POST',
        body: JSON.stringify(req),
      });

      await fetchDrawings();
      setActiveDrawing(created);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Çizim oluşturulamadı');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateDrawing = async (req: UpdateDrawingRequest): Promise<Drawing> => {
    if (!workspaceId || !activeDrawing) throw new Error('Geçersiz istek');

    const updated = await apiRequest<Drawing>(
      `/api/workspaces/${workspaceId}/drawings/${activeDrawing.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(req),
      }
    );

    setActiveDrawing(updated);

    // Update title in summaries list
    setDrawings((prev) =>
      prev.map((d) =>
        d.id === updated.id
          ? { ...d, title: updated.title, version: updated.version, updatedAt: updated.updatedAt }
          : d
      )
    );

    return updated;
  };

  const handleDeleteDrawing = async (drawingId: string) => {
    if (!workspaceId) return;
    try {
      await apiRequest(`/api/workspaces/${workspaceId}/drawings/${drawingId}`, {
        method: 'DELETE',
      });
      setActiveDrawing(null);
      await fetchDrawings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Çizim silinemedi');
    }
  };

  return (
    <div className="flex h-[calc(100vh-130px)] gap-4">
      {/* Left Sidebar: Drawing Thumbnails & List */}
      <div className="w-72 flex flex-col shrink-0 bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-xl glass-panel">
        {/* Header & Create Button */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2 text-sm">
            <PenTool className="w-4 h-4 text-purple-400" />
            Çizimler (Excalidraw)
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {drawings.length}
            </span>
          </h2>
          <button
            onClick={handleCreateDrawing}
            disabled={isCreating}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni Çizim
          </button>
        </div>

        {/* Drawings List Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
              <span>Çizimler yükleniyor...</span>
            </div>
          ) : drawings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-3">
                <PenTool className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-xs font-medium text-slate-300">Kayıtlı çizim yok</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Teknik mimari şemaları veya serbest eskizler için yeni bir çizim oluşturun.
              </p>
            </div>
          ) : (
            drawings.map((doc) => {
              const isSelected = activeDrawing?.id === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => loadDrawingDetails(doc.id)}
                  className={`p-3 rounded-xl cursor-pointer transition text-left border ${
                    isSelected
                      ? 'bg-purple-600/15 border-purple-500/40 shadow-sm'
                      : 'bg-slate-800/30 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-white truncate flex-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                      {doc.title || 'Başlıksız Çizim'}
                    </h4>
                    {isSelected && <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                    <span>v{doc.version}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(doc.updatedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Canvas: Drawing Editor */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {isEditorLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mb-2" />
            <span>Çizim sahnesi yükleniyor...</span>
          </div>
        ) : activeDrawing ? (
          <DrawingEditor
            key={activeDrawing.id}
            drawing={activeDrawing}
            onUpdateDrawing={handleUpdateDrawing}
            onDeleteDrawing={handleDeleteDrawing}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-4">
              <PenTool className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">Çizim Seçilmedi</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Düzenlemek için sol menüden bir çizim seçin veya yeni bir bağımsız çizim panosu açın.
            </p>
            <button
              onClick={handleCreateDrawing}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-lg shadow-purple-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              İlk Çizimi Başlat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
