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
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import type { Drawing, UpdateDrawingRequest } from '../../types/drawing';
import { apiRequest, ApiError } from '../../lib/api';

// Save status type (local to this component; no useAutosave dependency)
type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY = 1000; // ms debounce after last scene change

interface DrawingEditorProps {
  drawing: Drawing;
  onUpdateDrawing: (req: UpdateDrawingRequest) => Promise<Drawing>;
  onDeleteDrawing: (drawingId: string) => Promise<void>;
  onBackToList?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const DrawingEditor: React.FC<DrawingEditorProps> = ({
  drawing,
  onUpdateDrawing,
  onDeleteDrawing,
  onBackToList,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [title, setTitle] = useState(drawing.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // ── Refs: always hold the latest values, never stale in closures ──────────
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  const elementsRef = useRef<readonly ExcalidrawElement[]>([]);
  const appStateRef = useRef<AppState | null>(null);
  const filesRef = useRef<BinaryFiles>({});
  const lastSceneVersionRef = useRef<number>(-1);

  // Version lives in a ref so the save function always reads the latest value
  // without being recreated (avoids stale-closure 409 conflicts).
  const versionRef = useRef<number>(drawing.version);
  const titleRef = useRef<string>(drawing.title);

  // Autosave queue state
  const isSavingRef = useRef(false);   // true while an HTTP request is in flight
  const isDirtyRef = useRef(false);    // true if a change arrived while saving
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onUpdateDrawingRef = useRef(onUpdateDrawing);
  onUpdateDrawingRef.current = onUpdateDrawing;

  // Keep titleRef in sync
  useEffect(() => { titleRef.current = title; }, [title]);

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
      appState: { theme: 'dark', viewBackgroundColor: '#121212' },
      files: {},
    };
  }, [drawing.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset all local state when a different drawing is opened
  useEffect(() => {
    setTitle(drawing.title);
    titleRef.current = drawing.title;
    versionRef.current = drawing.version;
    setSaveStatus('idle');
    setErrorMessage(null);
    setConflictNotice(null);
    lastSceneVersionRef.current = getSceneVersion(initialData.elements);
    elementsRef.current = initialData.elements;
    isSavingRef.current = false;
    isDirtyRef.current = false;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, [drawing.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core save function ────────────────────────────────────────────────────
  // Always reads from refs → never has a stale version/title closure.
  const executeSave = useCallback(async () => {
    if (isSavingRef.current) {
      // A request is already in flight; mark dirty so we retry after it lands.
      isDirtyRef.current = true;
      return;
    }

    isSavingRef.current = true;
    isDirtyRef.current = false;
    setSaveStatus('saving');
    setErrorMessage(null);

    let attemptedRecovery = false;
    let recoveredThisRun = false;

    // Döngü: başarılı olana ya da kurtarılabilir conflict kalmayana kadar dene.
    // Kurtarma versionRef'i tazelediği için tek tekrar yeterlidir.
    for (;;) {
      const serialized = serializeAsJSON(
        elementsRef.current,
        appStateRef.current || ({} as AppState),
        filesRef.current,
        'local'
      );

      try {
        const updated = await onUpdateDrawingRef.current({
          title: titleRef.current.trim() || 'Başlıksız Çizim',
          documentData: serialized,
          version: versionRef.current,   // always latest
        });
        // Update version ref with what the server returned
        versionRef.current = updated.version;
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        if (!recoveredThisRun) {
          setConflictNotice(null);
        }
        break;
      } catch (err: unknown) {
        const isConflict = err instanceof ApiError && err.status === 409;
        if (isConflict && !attemptedRecovery) {
          attemptedRecovery = true;
          try {
            const latest = await apiRequest<Drawing>(
              `/api/workspaces/${drawingRef.current.workspaceId}/drawings/${drawingRef.current.id}`
            );
            versionRef.current = latest.version;
            recoveredThisRun = true;
            setConflictNotice(
              'Bu çizim başka bir yerde güncellendi. Sunucudaki sürüm alındı; ' +
              'sizdeki sahne korunarak yeniden kaydediliyor.'
            );
            continue;
          } catch {
            // kurtarma başarısız — aşağıdaki düz hata yoluna düş
          }
        }
        setSaveStatus('error');
        const msg = err instanceof Error ? err.message : 'Kaydetme sırasında bir hata oluştu.';
        setErrorMessage(msg);
        break;
      }
    }

    isSavingRef.current = false;
    // If a change arrived while we were saving, send another request.
    if (isDirtyRef.current) {
      isDirtyRef.current = false;
      // Small delay to avoid tight loops on transient errors
      debounceTimerRef.current = setTimeout(executeSave, 300);
    }
  }, []); // no deps — reads everything from refs

  // ── Debounced trigger ─────────────────────────────────────────────────────
  const scheduleSave = useCallback(() => {
    setSaveStatus('dirty');
    isDirtyRef.current = true;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(executeSave, AUTOSAVE_DELAY);
  }, [executeSave]);

  // ── Excalidraw onChange ───────────────────────────────────────────────────
  // Update refs synchronously (no state → no re-render → no scroll jump),
  // then schedule a debounced save only when the scene actually changed.
  const handleExcalidrawChange = useCallback((
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
      scheduleSave();
    }
  }, [scheduleSave]);

  // ── Title change also triggers autosave ──────────────────────────────────
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    titleRef.current = e.target.value;
    scheduleSave();
  }, [scheduleSave]);

  // ── Ctrl+S / Cmd+S ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        executeSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeSave]);

  // Flush pending changes on unmount or beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirtyRef.current) {
        executeSave();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (isDirtyRef.current) {
        executeSave();
      }
    };
  }, [executeSave]);

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
    <div
      className={`flex flex-col bg-slate-900/60 border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm ${
        isFullscreen
          ? 'h-full w-full rounded-none'
          : 'h-[calc(100vh-130px)] rounded-2xl'
      }`}
    >
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
            onChange={handleTitleChange}
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
            onClick={() => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); executeSave(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95"
            title="Manuel Kaydet (Ctrl + S)"
          >
            <Save className="w-3.5 h-3.5" />
            Kaydet
          </button>

          {/* Fullscreen Toggle Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`p-1.5 rounded-lg border transition ${
                isFullscreen
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 hover:bg-purple-600/30'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
              title={isFullscreen ? 'Tam Ekrandan Çık (Escape)' : 'Tam Ekran Moduna Geç'}
            >
              {isFullscreen
                ? <Minimize2 className="w-4 h-4" />
                : <Maximize2 className="w-4 h-4" />
              }
            </button>
          )}

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

      {/* Conflict Recovery Notice */}
      {conflictNotice && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-amber-900/30 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="flex-1">{conflictNotice}</span>
          <button
            type="button"
            onClick={() => setConflictNotice(null)}
            className="text-amber-300 hover:text-amber-100 shrink-0"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
        <span>Çizim Sürümü: #{versionRef.current}</span>
        {lastSavedAt && (
          <span>Son Kayıt: {lastSavedAt.toLocaleTimeString('tr-TR')}</span>
        )}
      </div>
    </div>
  );
};
