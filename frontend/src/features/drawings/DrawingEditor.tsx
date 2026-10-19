import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Excalidraw,
  getSceneVersion,
  exportToBlob,
  exportToSvg,
  serializeAsJSON,
} from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types';
import {
  Save,
  Trash2,
  Download,
  FileCode,
  Image,
  FileDigit,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useAutosave } from '../../hooks/useAutosave';
import type { Drawing, UpdateDrawingRequest } from '../../types/drawing';

interface DrawingEditorProps {
  drawing: Drawing;
  onUpdateDrawing: (req: UpdateDrawingRequest) => Promise<Drawing>;
  onDeleteDrawing: (drawingId: string) => Promise<void>;
  onBackToList?: () => void;
}

export const DrawingEditor: React.FC<DrawingEditorProps> = ({
  drawing,
  onUpdateDrawing,
  onDeleteDrawing,
  onBackToList,
}) => {
  const [title, setTitle] = useState(drawing.title);
  const [version, setVersion] = useState(drawing.version);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // References to keep latest Excalidraw scene data
  const elementsRef = useRef<readonly ExcalidrawElement[]>([]);
  const appStateRef = useRef<AppState | null>(null);
  const filesRef = useRef<BinaryFiles>({});
  const lastSceneVersionRef = useRef<number>(-1);

  // Parse initial scene data
  const initialData = useMemo(() => {
    try {
      if (drawing.documentData && drawing.documentData !== '{}') {
        const parsed = JSON.parse(drawing.documentData);
        return {
          elements: parsed.elements || [],
          appState: {
            theme: 'dark',
            viewBackgroundColor: '#121212',
            ...parsed.appState,
          },
          files: parsed.files || {},
        };
      }
    } catch (e) {
      console.error('Çizim verisi ayrıştırılamadı:', e);
    }
    return {
      elements: [],
      appState: {
        theme: 'dark',
        viewBackgroundColor: '#121212',
      },
      files: {},
    };
  }, [drawing.id]);

  useEffect(() => {
    setTitle(drawing.title);
    setVersion(drawing.version);
    lastSceneVersionRef.current = getSceneVersion(initialData.elements);
    elementsRef.current = initialData.elements;
  }, [drawing.id]);

  const handleSave = useCallback(async () => {
    const serialized = serializeAsJSON(
      elementsRef.current,
      appStateRef.current || ({} as AppState),
      filesRef.current,
      'local'
    );

    const req: UpdateDrawingRequest = {
      title: title.trim() || 'Başlıksız Çizim',
      documentData: serialized,
      version,
    };

    const updated = await onUpdateDrawing(req);
    setVersion(updated.version);
  }, [title, version, onUpdateDrawing]);

  const { saveStatus, errorMessage, lastSavedAt, saveNow } = useAutosave({
    data: title, // Title change triggers autosave
    onSave: handleSave,
    delay: 2000,
  });

  // Excalidraw onChange callback
  const handleExcalidrawChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    elementsRef.current = elements;
    appStateRef.current = appState;
    filesRef.current = files;

    const currentSceneVersion = getSceneVersion(elements);
    if (lastSceneVersionRef.current !== currentSceneVersion) {
      lastSceneVersionRef.current = currentSceneVersion;
      // Scene version actually changed -> trigger debounced autosave
      saveNow();
    }
  };

  // Export to .excalidraw JSON file
  const handleExportJson = () => {
    const serialized = serializeAsJSON(
      elementsRef.current,
      appStateRef.current || ({} as AppState),
      filesRef.current,
      'local'
    );
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'drawing'}.excalidraw`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export to PNG Image
  const handleExportPng = async () => {
    try {
      const blob = await exportToBlob({
        elements: elementsRef.current,
        appState: appStateRef.current || undefined,
        files: filesRef.current,
        mimeType: 'image/png',
        quality: 1,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'drawing'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PNG dışa aktarma hatası:', err);
    } finally {
      setShowExportMenu(false);
    }
  };

  // Export to SVG Vector
  const handleExportSvg = async () => {
    try {
      const svg = await exportToSvg({
        elements: elementsRef.current,
        appState: appStateRef.current || undefined,
        files: filesRef.current,
      });
      const svgString = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'drawing'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG dışa aktarma hatası:', err);
    } finally {
      setShowExportMenu(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Top Header & Toolbar */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 transition"
              title="Listeye Geri Dön"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Çizim başlığı..."
            className="w-full bg-transparent text-lg font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 border-b border-transparent pb-0.5 transition"
          />
        </div>

        {/* Action Controls & Save Status */}
        <div className="flex items-center gap-2.5">
          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-blue-400 bg-blue-900/30 border border-blue-500/30 px-2.5 py-1 rounded-full animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Kaydediliyor...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Kaydedildi
              </span>
            )}
            {saveStatus === 'dirty' && (
              <span className="flex items-center gap-1 text-amber-400 bg-amber-900/30 border border-amber-500/30 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                Kaydedilmemiş
              </span>
            )}
            {saveStatus === 'error' && (
              <span
                className="flex items-center gap-1 text-red-400 bg-red-900/30 border border-red-500/30 px-2.5 py-1 rounded-full cursor-help"
                title={errorMessage || 'Kayıt hatası'}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Kayıt Hatası
              </span>
            )}
          </div>

          {/* Manual Save Button */}
          <button
            onClick={() => saveNow()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95"
            title="Manuel Kaydet (Ctrl + S)"
          >
            <Save className="w-3.5 h-3.5" />
            Kaydet
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition"
              title="Dışa Aktar (PNG, SVG, JSON)"
            >
              <Download className="w-3.5 h-3.5" />
              Dışa Aktar
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <button
                  onClick={handleExportPng}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <Image className="w-4 h-4 text-emerald-400" />
                  PNG Olarak İndir
                </button>
                <button
                  onClick={handleExportSvg}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  SVG Vektör İndir
                </button>
                <button
                  onClick={handleExportJson}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <FileDigit className="w-4 h-4 text-amber-400" />
                  .excalidraw İndir
                </button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={async () => {
              if (window.confirm(`"${drawing.title}" başlıklı çizimi silmek istediğinize emin misiniz?`)) {
                setIsDeleting(true);
                try {
                  await onDeleteDrawing(drawing.id);
                } finally {
                  setIsDeleting(false);
                }
              }
            }}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            title="Çizimi Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Excalidraw Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <Excalidraw
          key={drawing.id}
          initialData={initialData}
          onChange={handleExcalidrawChange}
          theme="dark"
        />
      </div>

      {/* Footer Info Bar */}
      <div className="px-4 py-1.5 border-t border-slate-800/60 bg-slate-900/60 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
        <span>Çizim Sürümü: #{version}</span>
        {lastSavedAt && (
          <span>Son Kayıt: {lastSavedAt.toLocaleTimeString('tr-TR')}</span>
        )}
      </div>
    </div>
  );
};
