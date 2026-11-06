import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  CheckSquare,
  FileText,
  PenTool,
  Link as LinkIcon,
  X,
  Move,
  Info,
} from 'lucide-react';
import { boardsApi } from './api';
import { useToast } from '../../components/ui/toast';
import { ItemDetailModal } from './ItemDetailModal';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { isRecognizedExercise, isFitnessContext } from './exerciseDatabase';
import type { BoardDetails, BoardItem, BoardEdge } from './types';

interface FreeformBoardViewProps {
  board: BoardDetails;
  onRefresh: () => void;
  onOpenAddItemModal: () => void;
}

export const FreeformBoardView: React.FC<FreeformBoardViewProps> = ({
  board,
  onRefresh,
  onOpenAddItemModal,
}) => {
  const toast = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<BoardItem[]>(board.items || []);
  const [edges, setEdges] = useState<BoardEdge[]>(board.edges || []);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Detail Modal State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [forceExerciseModal, setForceExerciseModal] = useState(false);
  const hasMovedRef = useRef(false);
  const isFitness = isFitnessContext(board.name);

  // Modal her zaman panodaki GÜNCEL öğeyi gösterir (bayat kopya => sürüm uyuşmazlığı/409 engeli)
  const selectedCardForDetail = selectedCardId
    ? items.find((i) => i.id === selectedCardId) ?? null
    : null;

  useEffect(() => {
    setItems(board.items || []);
    setEdges(board.edges || []);
  }, [board]);

  const CARD_WIDTH = 240;
  const CARD_HEIGHT = 120;

  // Window-level mouse listeners so dragging is butter-smooth even if mouse leaves container
  useEffect(() => {
    if (!draggingItemId) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      hasMovedRef.current = true;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = Math.max(20, Math.round(e.clientX - containerRect.left - dragOffset.x));
      const newY = Math.max(20, Math.round(e.clientY - containerRect.top - dragOffset.y));

      setItems((prev) =>
        prev.map((i) => (i.id === draggingItemId ? { ...i, positionX: newX, positionY: newY } : i))
      );
    };

    const handleWindowMouseUp = async () => {
      const currentItem = items.find((i) => i.id === draggingItemId);
      const idToUpdate = draggingItemId;
      setDraggingItemId(null);

      if (currentItem && hasMovedRef.current) {
        try {
          await boardsApi.batchUpdateItems(board.workspaceId, board.id, [
            {
              id: idToUpdate,
              positionX: currentItem.positionX,
              positionY: currentItem.positionY,
            },
          ]);
        } catch (err) {
          console.error('Konum kaydedilirken hata:', err);
          toast.error('Kart konumu kaydedilemedi.');
        }
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingItemId, dragOffset, items, board.workspaceId, board.id]);

  // Sürükleme başlatma
  const handleMouseDown = (e: React.MouseEvent, item: BoardItem) => {
    if (connectingSourceId) return; // Bağlantı modunda sürüklemeyi engelle
    e.stopPropagation();
    hasMovedRef.current = false;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingItemId(item.id);
  };

  // Bağlantı (Edge) oluşturma
  const handleCardClick = async (clickedItemId: string) => {
    if (!connectingSourceId) return;

    if (connectingSourceId === clickedItemId) {
      setConnectingSourceId(null);
      return;
    }

    try {
      await boardsApi.createEdge(board.workspaceId, board.id, {
        sourceItemId: connectingSourceId,
        targetItemId: clickedItemId,
      });
      setConnectingSourceId(null);
      onRefresh();
    } catch (err) {
      console.error('Bağlantı oluşturulurken hata:', err);
      toast.error('Bağlantı oluşturulamadı.');
      setConnectingSourceId(null);
    }
  };

  // Bağlantı silme
  const handleDeleteEdge = async (edgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await boardsApi.deleteEdge(board.workspaceId, board.id, edgeId);
      onRefresh();
    } catch (err) {
      console.error('Bağlantı silinirken hata:', err);
      toast.error('Bağlantı silinemedi.');
    }
  };

  // Öğeyi panodan kaldırma
  const handleRemoveItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await boardsApi.removeItem(board.workspaceId, board.id, itemId);
      onRefresh();
    } catch (err) {
      console.error('Öğe panodan kaldırılırken hata:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Top action bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            {board.name}
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Serbest Tuval
            </span>
          </h2>
          {connectingSourceId ? (
            <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl animate-pulse">
              <Info className="w-3.5 h-3.5" />
              <span>Bağlantı kurmak için hedef kartı seçin</span>
              <button
                onClick={() => setConnectingSourceId(null)}
                className="ml-2 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="hidden sm:inline text-xs text-slate-400">
              Kartları tuval üzerinde dilediğiniz yere sürükleyin veya aralarında bağlantı kurun.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setConnectingSourceId(items[0]?.id || null)}
            disabled={items.length < 2 || !!connectingSourceId}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 border border-slate-700 disabled:opacity-40"
          >
            <LinkIcon className="w-3.5 h-3.5" /> Bağlantı Kur
          </button>
          <button
            onClick={onOpenAddItemModal}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Kart Ekle
          </button>
        </div>
      </div>

      {/* Freeform Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto bg-[#090d16] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] min-h-[800px] min-w-[1200px]"
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const source = items.find((i) => i.id === edge.sourceItemId);
            const target = items.find((i) => i.id === edge.targetItemId);
            if (!source || !target) return null;

            const sx = source.positionX + CARD_WIDTH / 2;
            const sy = source.positionY + CARD_HEIGHT / 2;
            const tx = target.positionX + CARD_WIDTH / 2;
            const ty = target.positionY + CARD_HEIGHT / 2;

            const midX = (sx + tx) / 2;
            const midY = (sy + ty) / 2;

            return (
              <g key={edge.id} className="pointer-events-auto group">
                <line
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="4"
                  markerEnd="url(#arrowhead)"
                  className="transition group-hover:stroke-blue-400 group-hover:stroke-width-[3]"
                />
                {/* Edge Delete Button */}
                <circle
                  cx={midX}
                  cy={midY}
                  r="10"
                  fill="#1e293b"
                  stroke="#475569"
                  className="cursor-pointer hover:fill-red-500 hover:stroke-red-400"
                  onClick={(e) => handleDeleteEdge(edge.id, e)}
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  className="cursor-pointer pointer-events-none"
                >
                  ✕
                </text>
              </g>
            );
          })}
        </svg>

        {/* Board Item Cards */}
        {items.map((item) => {
          const details = item.itemDetails || {};
          const isConnectingSource = connectingSourceId === item.id;
          const isTask = item.itemType === 'TASK';
          const isNote = item.itemType === 'NOTE';

          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: `${item.positionX}px`,
                top: `${item.positionY}px`,
                width: `${CARD_WIDTH}px`,
              }}
              onMouseDown={(e) => handleMouseDown(e, item)}
              onClick={() => {
                if (hasMovedRef.current) return;
                if (connectingSourceId) {
                  handleCardClick(item.id);
                } else {
                  setForceExerciseModal(false);
                  setSelectedCardId(item.id);
                }
              }}
              className={`rounded-2xl p-4 border transition-all z-10 shadow-xl select-none cursor-move ${
                isConnectingSource
                  ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50'
                  : connectingSourceId
                  ? 'bg-slate-900/90 border-slate-700 hover:border-amber-400 cursor-pointer'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-medium pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Move className="w-3 h-3 text-slate-500" />
                  {isTask && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <CheckSquare className="w-3.5 h-3.5" /> Görev
                    </span>
                  )}
                  {isNote && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <FileText className="w-3.5 h-3.5" /> Not
                    </span>
                  )}
                  {item.itemType === 'DRAWING' && (
                    <span className="flex items-center gap-1 text-cyan-400">
                      <PenTool className="w-3.5 h-3.5" /> Çizim
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnectingSourceId(item.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition"
                    title="Bu karttan bağlantı başlat"
                  >
                    <LinkIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleRemoveItem(item.id, e)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Panodan Kaldır"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & details */}
              <h4 className="text-xs font-semibold text-slate-100 mt-2 line-clamp-2">
                {details.title || '(Başlıksız)'}
              </h4>
              {details.snippet && (
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{details.snippet}</p>
              )}

              {/* Badges */}
              {(details.status || details.priority) && (
                <div className="flex items-center gap-1.5 mt-2.5 pt-1.5 border-t border-slate-800 text-[10px]">
                  {details.priority && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">
                      {details.priority as string}
                    </span>
                  )}
                  {details.status && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {details.status as string}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Detail Modal */}
      {selectedCardForDetail && (() => {
        const cardTitle = (selectedCardForDetail.itemDetails?.title as string) || '';
        const isCardExercise = forceExerciseModal || isFitness || isRecognizedExercise(cardTitle);

        if (isCardExercise) {
          return (
            <ExerciseDetailModal
              item={selectedCardForDetail}
              workspaceId={board.workspaceId}
              onClose={() => {
                setSelectedCardId(null);
                setForceExerciseModal(false);
              }}
              onRefreshBoard={onRefresh}
            />
          );
        }

        return (
          <ItemDetailModal
            item={selectedCardForDetail}
            workspaceId={board.workspaceId}
            onClose={() => {
              setSelectedCardId(null);
              setForceExerciseModal(false);
            }}
            onRefreshBoard={onRefresh}
            onOpenAsExercise={() => setForceExerciseModal(true)}
          />
        );
      })()}
    </div>
  );
};
