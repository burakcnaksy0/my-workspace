import React, { useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Plus,
  RefreshCw,
  Clock,
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
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
  // fullscreen = editor kaplar tüm modül alanını (sidebar gizli)
  const [isFullscreen, setIsFullscreen] = useState(false);
  // sidebarCollapsed = sol çizim listesi mini moda alınır (fullscreen olmadan)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  // Escape tuşuyla tam ekrandan çık
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

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
      setIsFullscreen(false);
      await fetchDrawings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Çizim silinemedi');
    }
  };

  const toggleFullscreen = () => setIsFullscreen((v) => !v);
  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

  // ── TAM EKRAN MODU: sadece editor görünür, sidebar tamamen gizlenir ──────
  if (isFullscreen && activeDrawing) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#0f0f13] flex flex-col"
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* Tam ekran üst bar: çizim adı + çıkış butonu */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full backdrop-blur-sm">
            {activeDrawing.title}
          </span>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-medium transition backdrop-blur-sm shadow-lg"
            title="Tam ekrandan çık (Escape)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Tam Ekrandan Çık
          </button>
        </div>

        {/* Editor tam viewport */}
        <div className="flex-1 w-full h-full">
          <DrawingEditor
            key={activeDrawing.id}
            drawing={activeDrawing}
            onUpdateDrawing={handleUpdateDrawing}
            onDeleteDrawing={handleDeleteDrawing}
            onBackToList={() => setIsFullscreen(false)}
            isFullscreen
            onToggleFullscreen={toggleFullscreen}
          />
        </div>
      </div>
    );
  }

  // ── NORMAL GÖRÜNÜM ─────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex min-h-0 w-full h-full gap-5 p-4 sm:p-6 overflow-hidden bg-transparent">

      {/* Sol Sidebar: Çizim Listesi — daraltılabilir */}
      <div
        className={`flex flex-col shrink-0 bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-xl glass-panel transition-all duration-300 ${
          sidebarCollapsed ? 'w-12' : 'w-72'
        }`}
      >
        {/* Header */}
        <div className={`p-3 border-b border-slate-800/80 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <PenTool className="w-4 h-4 text-purple-400" />
              Çizimler
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {drawings.length}
              </span>
            </h2>
          )}
          <div className={`flex items-center gap-1 ${sidebarCollapsed ? 'flex-col' : ''}`}>
            {!sidebarCollapsed && (
              <button
                onClick={handleCreateDrawing}
                disabled={isCreating}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition active:scale-95"
                title="Yeni Çizim"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni
              </button>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={sidebarCollapsed ? 'Paneli Genişlet' : 'Paneli Daralt'}
            >
              {sidebarCollapsed
                ? <PanelLeftOpen className="w-4 h-4" />
                : <PanelLeftClose className="w-4 h-4" />
              }
            </button>
          </div>
        </div>

        {/* Daraltılmış mod: sadece simgeler */}
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2 p-2 overflow-y-auto">
            <button
              onClick={handleCreateDrawing}
              disabled={isCreating}
              className="p-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white transition"
              title="Yeni Çizim"
            >
              <Plus className="w-4 h-4" />
            </button>
            {drawings.map((doc) => (
              <button
                key={doc.id}
                onClick={() => loadDrawingDetails(doc.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition border ${
                  activeDrawing?.id === doc.id
                    ? 'bg-purple-600/30 border-purple-500/60'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-700/60'
                }`}
                title={doc.title}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </button>
            ))}
          </div>
        ) : (
          /* Genişletilmiş mod: tam liste */
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
        )}
      </div>

      {/* Sağ: Editor alanı */}
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
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={false}
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

        {/* Tam Ekran hızlı erişim butonu (editor varken göster) */}
        {activeDrawing && !isEditorLoading && (
          <div className="absolute bottom-6 right-6 z-10">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border border-purple-500/40 hover:border-purple-400/70 text-purple-300 hover:text-purple-200 text-xs font-medium shadow-lg shadow-purple-500/10 backdrop-blur-sm transition"
              title="Tam Ekran Moduna Geç"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Tam Ekran
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
