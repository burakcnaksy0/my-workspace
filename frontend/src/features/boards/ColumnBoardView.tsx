import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckSquare,
  FileText,
  PenTool,
  GripVertical,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { boardsApi } from './api';
import type { BoardDetails, BoardColumn, BoardItem } from './types';

interface ColumnBoardViewProps {
  board: BoardDetails;
  onRefresh: () => void;
  onOpenAddItemModal: () => void;
}

export const ColumnBoardView: React.FC<ColumnBoardViewProps> = ({
  board,
  onRefresh,
  onOpenAddItemModal,
}) => {
  const [newColName, setNewColName] = useState('');
  const [newColStatus, setNewColStatus] = useState<string>('');
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [cardMenuOpenId, setCardMenuOpenId] = useState<string | null>(null);

  const columns = board.columns || [];
  const items = board.items || [];

  // Sütunlara göre öğeleri grupla
  const getItemsForColumn = (colId: string) => {
    return items.filter((i) => i.columnId === colId);
  };

  // Sütunsuz öğeler
  const unassignedItems = items.filter((i) => !i.columnId);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      await boardsApi.createColumn(board.workspaceId, board.id, {
        name: newColName.trim(),
        mappedStatus: newColStatus || null,
        sortOrder: columns.length,
      });
      setNewColName('');
      setNewColStatus('');
      setIsAddingCol(false);
      onRefresh();
    } catch (err) {
      console.error('Sütun eklenirken hata:', err);
    }
  };

  const handleDeleteColumn = async (colId: string) => {
    if (!window.confirm('Bu sütunu silmek istediğinize emin misiniz? İçindeki kartlar panoda kalacak ancak sütunsuz olacaktır.')) {
      return;
    }
    try {
      await boardsApi.deleteColumn(board.workspaceId, board.id, colId);
      onRefresh();
    } catch (err) {
      console.error('Sütun silinirken hata:', err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await boardsApi.removeItem(board.workspaceId, board.id, itemId);
      onRefresh();
    } catch (err) {
      console.error('Öğe panodan kaldırılırken hata:', err);
    }
  };

  const handleMoveToColumn = async (itemId: string, targetColId: string | null) => {
    try {
      await boardsApi.batchUpdateItems(board.workspaceId, board.id, [
        {
          id: itemId,
          columnId: targetColId,
        },
      ]);
      setCardMenuOpenId(null);
      onRefresh();
    } catch (err) {
      console.error('Kart taşınırken hata:', err);
    }
  };

  // Drag and drop
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    setDraggedItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColId: string | null) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!itemId) return;

    setDraggedItemId(null);
    await handleMoveToColumn(itemId, targetColId);
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex-1 overflow-x-auto p-6 flex flex-col">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {board.name}
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Sütunlu Kanban
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kartları sütunlar arasında sürükleyip bırakarak görev durumlarını otomatik güncelleyebilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddItemModal}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Kart Ekle
          </button>
          {!isAddingCol && (
            <button
              onClick={() => setIsAddingCol(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
            >
              <Plus className="w-4 h-4" /> Yeni Sütun
            </button>
          )}
        </div>
      </div>

      {/* Columns Area */}
      <div className="flex-1 flex gap-5 items-start overflow-x-auto pb-6">
        {/* Unassigned Items Column (if any exist) */}
        {unassignedItems.length > 0 && (
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
            className="w-80 shrink-0 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 p-4 flex flex-col max-h-full"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                Sütunsuz Öğeler ({unassignedItems.length})
              </span>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {unassignedItems.map((item) => (
                <BoardCard
                  key={item.id}
                  item={item}
                  columns={columns}
                  isMenuOpen={cardMenuOpenId === item.id}
                  onToggleMenu={() => setCardMenuOpenId(cardMenuOpenId === item.id ? null : item.id)}
                  onMove={handleMoveToColumn}
                  onRemove={handleRemoveItem}
                  onDragStart={handleDragStart}
                  getPriorityBadgeClass={getPriorityBadgeClass}
                />
              ))}
            </div>
          </div>
        )}

        {/* Defined Columns */}
        {columns.map((col) => {
          const colItems = getItemsForColumn(col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="w-80 shrink-0 rounded-2xl bg-slate-900/70 border border-slate-800/80 p-4 flex flex-col max-h-[calc(100vh-210px)] shadow-xl shadow-black/20"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">{col.name}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                    {colItems.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {col.mappedStatus && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {col.mappedStatus}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteColumn(col.id)}
                    className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Sütunu Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {colItems.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-800/60 rounded-xl text-slate-600 text-xs">
                    Bu sütunda henüz kart yok
                  </div>
                ) : (
                  colItems.map((item) => (
                    <BoardCard
                      key={item.id}
                      item={item}
                      columns={columns}
                      isMenuOpen={cardMenuOpenId === item.id}
                      onToggleMenu={() => setCardMenuOpenId(cardMenuOpenId === item.id ? null : item.id)}
                      onMove={handleMoveToColumn}
                      onRemove={handleRemoveItem}
                      onDragStart={handleDragStart}
                      getPriorityBadgeClass={getPriorityBadgeClass}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Add Column Card */}
        {isAddingCol && (
          <div className="w-80 shrink-0 rounded-2xl bg-slate-900/90 border border-blue-500/40 p-4 shadow-xl">
            <h4 className="text-xs font-semibold text-white mb-3">Yeni Sütun Ekle</h4>
            <form onSubmit={handleAddColumn} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sütun Adı</label>
                <input
                  type="text"
                  placeholder="örn: İncelemede"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Eşlenen Durum (Mapped Status)</label>
                <select
                  value={newColStatus}
                  onChange={(e) => setNewColStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="">Seçim yok (yalnızca görsel düzen)</option>
                  <option value="TODO">TODO (Yapılacak)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Devam Eden)</option>
                  <option value="DONE">DONE (Tamamlandı)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCol(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!newColName.trim()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

interface BoardCardProps {
  item: BoardItem;
  columns: BoardColumn[];
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMove: (itemId: string, targetColId: string | null) => void;
  onRemove: (itemId: string) => void;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  getPriorityBadgeClass: (priority?: string) => string;
}

const BoardCard: React.FC<BoardCardProps> = ({
  item,
  columns,
  isMenuOpen,
  onToggleMenu,
  onMove,
  onRemove,
  onDragStart,
  getPriorityBadgeClass,
}) => {
  const details = item.itemDetails || {};
  const isTask = item.itemType === 'TASK';
  const isNote = item.itemType === 'NOTE';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing group relative select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
          <GripVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition" />
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

        {/* Card menu */}
        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="p-1 rounded text-slate-500 hover:text-slate-200 transition"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-6 z-20 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1 text-xs">
              <div className="px-3 py-1 font-semibold text-[10px] text-slate-500 uppercase tracking-wider">
                Sütuna Taşı
              </div>
              {columns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onMove(item.id, c.id)}
                  disabled={item.columnId === c.id}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 disabled:opacity-40 flex items-center justify-between"
                >
                  <span className="truncate">{c.name}</span>
                  {item.columnId === c.id && <span className="text-[10px] text-blue-400">Mevcut</span>}
                </button>
              ))}
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => onRemove(item.id)}
                className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-red-400 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Panodan Kaldır
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-slate-100 mt-2 line-clamp-2">
        {details.title || '(Başlıksız)'}
      </h4>

      {/* Snippet / Description */}
      {details.snippet && (
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{details.snippet}</p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/50 flex-wrap">
        {details.priority && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-medium border ${getPriorityBadgeClass(
              details.priority as string
            )}`}
          >
            {details.priority as string}
          </span>
        )}
        {details.status && (
          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-700/50 text-slate-300">
            {details.status as string}
          </span>
        )}
        {details.dueAt && (
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(details.dueAt as string).toLocaleDateString('tr-TR')}
          </span>
        )}
      </div>
    </div>
  );
};
