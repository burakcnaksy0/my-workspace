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
  CalendarPlus,
  Dumbbell,
  X,
  ChevronRight,
  LayoutTemplate,
  ChevronDown,
} from 'lucide-react';
import { boardsApi } from './api';
import { apiRequest } from '../../lib/api';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { ItemDetailModal } from './ItemDetailModal';
import { isRecognizedExercise, isFitnessContext } from './exerciseDatabase';
import type { BoardDetails, BoardColumn, BoardItem } from './types';
import type { Task } from '../../types/task';

interface ColumnBoardViewProps {
  board: BoardDetails;
  onRefresh: () => void;
  onOpenAddItemModal: (columnId?: string) => void;
}

const WEEKDAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

interface ColumnTemplate {
  id: string;
  name: string;
  desc: string;
  icon: string;
  columns: { name: string; mappedStatus?: string | null }[];
}

const COLUMN_TEMPLATES: ColumnTemplate[] = [
  {
    id: 'kanban',
    name: 'Klasik Kanban',
    desc: 'Yapılacak, Devam Eden, Tamamlandı',
    icon: '📋',
    columns: [
      { name: 'Yapılacak', mappedStatus: 'TODO' },
      { name: 'Devam Eden', mappedStatus: 'IN_PROGRESS' },
      { name: 'Tamamlandı', mappedStatus: 'DONE' },
    ],
  },
  {
    id: 'weekly',
    name: 'Haftalık 7 Günlük Plan',
    desc: 'Pazartesi’den Pazar’a tüm günler',
    icon: '🗓️',
    columns: WEEKDAYS.map((d) => ({ name: d, mappedStatus: null })),
  },
  {
    id: 'scrum',
    name: 'Yazılım & Proje Akışı',
    desc: 'Backlog, Geliştirme, Test, Canlı',
    icon: '🚀',
    columns: [
      { name: 'Backlog', mappedStatus: 'TODO' },
      { name: 'Geliştirme', mappedStatus: 'IN_PROGRESS' },
      { name: 'Test & İnceleme', mappedStatus: 'IN_PROGRESS' },
      { name: 'Canlı / Bitti', mappedStatus: 'DONE' },
    ],
  },
  {
    id: 'priority',
    name: 'Öncelik Seviyeleri',
    desc: 'Düşük, Orta, Yüksek, Acil',
    icon: '🎯',
    columns: [
      { name: 'Düşük Öncelik', mappedStatus: null },
      { name: 'Orta Öncelik', mappedStatus: null },
      { name: 'Yüksek Öncelik', mappedStatus: null },
      { name: 'Acil', mappedStatus: null },
    ],
  },
];

export const ColumnBoardView: React.FC<ColumnBoardViewProps> = ({
  board,
  onRefresh,
  onOpenAddItemModal,
}) => {
  const [newColName, setNewColName] = useState('');
  const [newColStatus, setNewColStatus] = useState<string>('');
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [cardMenuOpenId, setCardMenuOpenId] = useState<string | null>(null);

  // Detail Modal State
  const [selectedCardForDetail, setSelectedCardForDetail] = useState<BoardItem | null>(null);
  const [forceExerciseModal, setForceExerciseModal] = useState(false);

  // Inline Quick Add state per column
  const [quickAddColId, setQuickAddColId] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [isSubmittingQuickAdd, setIsSubmittingQuickAdd] = useState(false);

  const columns = board.columns || [];
  const items = board.items || [];

  // Pano bağlamı (Fitness mı, genel iş/proje mi?)
  const isFitness = isFitnessContext(board.name);

  // Sütunlara göre öğeleri grupla
  const getItemsForColumn = (colId: string) => {
    return items.filter((i) => i.columnId === colId);
  };

  // Sütunsuz öğeler
  const unassignedItems = items.filter((i) => !i.columnId);

  // Mevcut sütun adları
  const existingColNames = columns.map((c) => c.name.toLowerCase().trim());

  // Günlük takvim panosu mu kontrol et
  const hasWeekdayColumn = columns.some((c) =>
    WEEKDAYS.some((day) => c.name.toLowerCase().includes(day.toLowerCase()))
  );
  const isScheduleName = ['haftalık', 'hafta', 'plan', 'günlük', 'program', 'rutin', 'spor', 'antrenman'].some((k) =>
    board.name.toLowerCase().includes(k)
  );
  const isScheduleBoard = hasWeekdayColumn || isScheduleName;

  // Eksik günleri kontrol et
  const missingWeekdays = WEEKDAYS.filter(
    (day) => !existingColNames.some((c) => c.includes(day.toLowerCase()))
  );

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

  // Şablon sütunlarını uygula
  const handleApplyTemplate = async (template: ColumnTemplate) => {
    setIsTemplateMenuOpen(false);
    try {
      for (let i = 0; i < template.columns.length; i++) {
        const col = template.columns[i];
        if (existingColNames.includes(col.name.toLowerCase().trim())) continue;
        await boardsApi.createColumn(board.workspaceId, board.id, {
          name: col.name,
          mappedStatus: col.mappedStatus || null,
          sortOrder: columns.length + i,
        });
      }
      onRefresh();
    } catch (err) {
      console.error('Şablon sütunları eklenirken hata:', err);
    }
  };

  const handleAddMissingWeekdays = async () => {
    try {
      for (let i = 0; i < missingWeekdays.length; i++) {
        const day = missingWeekdays[i];
        await boardsApi.createColumn(board.workspaceId, board.id, {
          name: day,
          mappedStatus: null,
          sortOrder: columns.length + i,
        });
      }
      onRefresh();
    } catch (err) {
      console.error('Kalan günler eklenirken hata:', err);
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

  // Inline Quick Add for Column
  const handleInlineQuickAdd = async (e: React.FormEvent, colId: string) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;

    setIsSubmittingQuickAdd(true);
    try {
      // 1. Create task
      const created = await apiRequest<Task>(`/api/workspaces/${board.workspaceId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: quickAddTitle.trim(),
          priority: 'MEDIUM',
          areaId: board.areaId || undefined,
        }),
      });

      // 2. Add to board in this column
      await boardsApi.addItem(board.workspaceId, board.id, {
        itemType: 'TASK',
        itemId: created.id,
        columnId: colId,
      });

      setQuickAddTitle('');
      onRefresh();
    } catch (err) {
      console.error('Hızlı kart eklenemedi:', err);
      alert('Kart eklenirken bir hata oluştu.');
    } finally {
      setIsSubmittingQuickAdd(false);
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
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden p-4 sm:p-6 bg-transparent">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 shrink-0 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            {board.name}
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Sütunlu Kanban
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isFitness ? (
              <>
                Kartlara tıklayarak egzersizin{' '}
                <span className="text-blue-400 font-semibold">doğru formunu, kas haritasını ve biyomekanik rehberini</span>{' '}
                görüntüleyebilirsiniz.
              </>
            ) : (
              <>
                Kartları sürükleyip bırakarak durumları güncelleyebilir, detaylar ve notlar için kartlara tıklayabilirsiniz.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative">
          {/* Akıllı Gün Tamamlama (Yalnızca takvim/haftalık panolarda ve eksik gün olduğunda) */}
          {isScheduleBoard && missingWeekdays.length > 0 && missingWeekdays.length < 7 && (
            <button
              onClick={handleAddMissingWeekdays}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition flex items-center gap-1.5"
              title={`Eksik günleri otomatik ekle: ${missingWeekdays.join(', ')}`}
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              + Kalan Günleri Tamamla ({missingWeekdays.length} Gün)
            </button>
          )}

          {/* Hızlı Şablonlar Menüsü */}
          <div className="relative">
            <button
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
              title="Hazır Sütun Şablonları"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
              <span>Şablon Sütunlar</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-30 animate-fade-in space-y-1">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Hazır Sütun Düzenleri
                </div>
                {COLUMN_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition flex items-start gap-2.5 group"
                  >
                    <span className="text-lg leading-none mt-0.5">{tmpl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {tmpl.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {tmpl.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenAddItemModal()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> {isFitness ? 'Egzersiz Ekle' : 'Kart / Öğe Ekle'}
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

      {/* Columns Area - uses items-stretch and fills remaining height! */}
      <div className="flex-1 flex gap-5 items-stretch overflow-x-auto pb-4 pt-1 min-h-0 custom-scrollbar">
        {/* Unassigned Items Column (if any exist) */}
        {unassignedItems.length > 0 && (
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
            className="w-80 min-w-[320px] shrink-0 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 p-4 flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 shrink-0">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                Sütunsuz Öğeler ({unassignedItems.length})
              </span>
              <button
                onClick={() => onOpenAddItemModal()}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                + Ekle
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {unassignedItems.map((item) => (
                <BoardCard
                  key={item.id}
                  item={item}
                  columns={columns}
                  isFitnessBoard={isFitness}
                  isMenuOpen={cardMenuOpenId === item.id}
                  onToggleMenu={() => setCardMenuOpenId(cardMenuOpenId === item.id ? null : item.id)}
                  onMove={handleMoveToColumn}
                  onRemove={handleRemoveItem}
                  onDragStart={handleDragStart}
                  onClick={(item) => {
                    setForceExerciseModal(false);
                    setSelectedCardForDetail(item);
                  }}
                  getPriorityBadgeClass={getPriorityBadgeClass}
                />
              ))}
            </div>
          </div>
        )}

        {/* Board Defined Columns */}
        {columns.map((col) => {
          const colItems = getItemsForColumn(col.id);
          const isInlineOpen = quickAddColId === col.id;
          const isWeekdayCol = WEEKDAYS.some((day) => col.name.toLowerCase().includes(day.toLowerCase()));

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="w-80 min-w-[320px] shrink-0 rounded-2xl bg-slate-900/50 border border-slate-800/80 p-4 flex flex-col shadow-xl hover:border-slate-700/80 transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {col.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {colItems.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setQuickAddColId(isInlineOpen ? null : col.id);
                      setQuickAddTitle('');
                    }}
                    className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition ${
                      isInlineOpen ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-800'
                    }`}
                    title="Hızlı kart ekle"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteColumn(col.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Sütunu Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar min-h-[160px]">
                {colItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800/80 hover:border-slate-700 rounded-xl text-center transition group/empty min-h-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover/empty:text-blue-400 group-hover/empty:border-blue-500/40 mb-3 transition">
                      {isFitness ? <Dumbbell className="w-5 h-5" /> : isWeekdayCol ? <Calendar className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                    </div>
                    <p className="text-xs font-medium text-slate-300">
                      {isFitness
                        ? isWeekdayCol
                          ? 'Bu günde henüz hareket yok'
                          : 'Bu sütunda henüz egzersiz yok'
                        : isWeekdayCol
                        ? 'Bu güne ait kart yok'
                        : 'Bu sütunda henüz kart yok'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                      {isFitness
                        ? 'Antrenman veya egzersiz kartı eklemek için tıklayın'
                        : 'Görev veya not eklemek için tıklayın'}
                    </p>
                    <button
                      onClick={() => onOpenAddItemModal(col.id)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-medium transition"
                    >
                      + {isFitness ? 'Egzersiz' : 'Kart'} Ekle
                    </button>
                  </div>
                ) : (
                  colItems.map((item) => (
                    <BoardCard
                      key={item.id}
                      item={item}
                      columns={columns}
                      isFitnessBoard={isFitness}
                      isMenuOpen={cardMenuOpenId === item.id}
                      onToggleMenu={() => setCardMenuOpenId(cardMenuOpenId === item.id ? null : item.id)}
                      onMove={handleMoveToColumn}
                      onRemove={handleRemoveItem}
                      onDragStart={handleDragStart}
                      onClick={(item) => {
                        setForceExerciseModal(false);
                        setSelectedCardForDetail(item);
                      }}
                      getPriorityBadgeClass={getPriorityBadgeClass}
                    />
                  ))
                )}
              </div>

              {/* Column Footer: Inline Quick Add Box */}
              <div className="pt-3 mt-2 border-t border-slate-800/80 shrink-0">
                {isInlineOpen ? (
                  <form onSubmit={(e) => handleInlineQuickAdd(e, col.id)} className="space-y-2">
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder={isFitness ? 'Egzersiz adı yazın (Enter)...' : 'Kart başlığı yazın (Enter)...'}
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddColId(null);
                          setQuickAddTitle('');
                        }}
                        className="px-2.5 py-1 text-slate-400 hover:text-white text-xs rounded hover:bg-slate-800"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        disabled={!quickAddTitle.trim() || isSubmittingQuickAdd}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition disabled:opacity-50"
                      >
                        {isSubmittingQuickAdd ? 'Ekleniyor...' : 'Ekle'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setQuickAddColId(col.id);
                      setQuickAddTitle('');
                    }}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition flex items-center justify-center gap-1.5 border border-dashed border-slate-800 hover:border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> + {isFitness ? 'Egzersiz Ekle' : 'Kart Ekle'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Column Box */}
        {isAddingCol ? (
          <div className="w-80 min-w-[320px] shrink-0 rounded-2xl bg-slate-900 border border-blue-500/50 p-4 flex flex-col shadow-2xl h-fit">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Yeni Sütun Ekle</span>
              <button
                onClick={() => setIsAddingCol(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddColumn} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Sütun Adı</label>
                <input
                  type="text"
                  placeholder={isScheduleBoard ? 'örn: Cumartesi veya Ek Gün' : 'örn: İncelemede veya Yapılacak'}
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                  Görev Durumu Eşlemesi (İsteğe bağlı)
                </label>
                <select
                  value={newColStatus}
                  onChange={(e) => setNewColStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="">Eşleme Yok (Serbest Sütun)</option>
                  <option value="TODO">TODO (Yapılacak)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Devam Eden)</option>
                  <option value="DONE">DONE (Tamamlandı)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCol(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={!newColName.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                >
                  Sütunu Ekle
                </button>
              </div>
            </form>
          </div>
        ) : (
          columns.length === 0 && (
            <div className="w-80 min-w-[320px] shrink-0 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-xl">
              <LayoutTemplate className="w-10 h-10 text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Henüz Sütun Eklenmemiş</h3>
              <p className="text-xs text-slate-400 mb-4">
                Panonuza sütunlar ekleyerek görevlerinizi organize etmeye başlayın.
              </p>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleApplyTemplate(COLUMN_TEMPLATES[0])}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                >
                  📋 Klasik Kanban ile Başla
                </button>
                <button
                  onClick={() => handleApplyTemplate(COLUMN_TEMPLATES[1])}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                >
                  🗓️ 7 Günlük Haftalık Plan ile Başla
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Dynamic Detail Modal: Contextual for Exercise or General Item */}
      {selectedCardForDetail && (() => {
        const cardTitle = (selectedCardForDetail.itemDetails?.title as string) || '';
        const isCardExercise = forceExerciseModal || isFitness || isRecognizedExercise(cardTitle);

        if (isCardExercise) {
          return (
            <ExerciseDetailModal
              item={selectedCardForDetail}
              workspaceId={board.workspaceId}
              onClose={() => {
                setSelectedCardForDetail(null);
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
              setSelectedCardForDetail(null);
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

interface BoardCardProps {
  item: BoardItem;
  columns: BoardColumn[];
  isFitnessBoard: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMove: (itemId: string, targetColId: string | null) => void;
  onRemove: (itemId: string) => void;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onClick: (item: BoardItem) => void;
  getPriorityBadgeClass: (priority?: string) => string;
}

const BoardCard: React.FC<BoardCardProps> = ({
  item,
  columns,
  isFitnessBoard,
  isMenuOpen,
  onToggleMenu,
  onMove,
  onRemove,
  onDragStart,
  onClick,
  getPriorityBadgeClass,
}) => {
  const details = item.itemDetails || {};
  const isTask = item.itemType === 'TASK';
  const isNote = item.itemType === 'NOTE';
  const title = (details.title as string) || '';

  // Kart gerçekten egzersiz mi yoksa genel bir iş/görev mi?
  const isCardExercise = isFitnessBoard || isRecognizedExercise(title);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={() => onClick(item)}
      className="p-3.5 rounded-xl bg-slate-800/85 border border-slate-700/80 hover:border-blue-500/70 hover:bg-slate-800 transition-all shadow-sm hover:shadow-xl cursor-pointer group relative select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
          <GripVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition cursor-grab" />
          {isTask && <CheckSquare className="w-3.5 h-3.5 text-blue-400" />}
          {isNote && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
          {!isTask && !isNote && <PenTool className="w-3.5 h-3.5 text-purple-400" />}
          <span>{isTask ? 'Görev' : isNote ? 'Not' : 'Çizim'}</span>
        </div>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggleMenu}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700/60 transition"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-20 space-y-1 animate-fade-in text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Sütuna Taşı
              </div>
              <button
                onClick={() => onMove(item.id, null)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300"
              >
                Sütunsuz Bırak
              </button>
              {columns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onMove(item.id, c.id)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 truncate"
                >
                  → {c.name}
                </button>
              ))}
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-red-500/20 text-red-400 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" /> Panodan Kaldır
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white mt-1.5 leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
        {title || 'Başlıksız'}
      </h4>

      {details.snippet && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-normal leading-relaxed">
          {details.snippet as string}
        </p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/50 flex-wrap">
        {details.priority && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getPriorityBadgeClass(
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

      {/* Contextual Card Footer */}
      {isCardExercise ? (
        <div className="flex items-center justify-between text-[10px] text-blue-400/80 font-medium pt-2 mt-2 border-t border-slate-700/30 group-hover:text-blue-300 transition-colors">
          <span className="flex items-center gap-1">
            <Dumbbell className="w-3 h-3" /> Egzersiz & Doğru Form Rehberi
          </span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      ) : (
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 mt-2 border-t border-slate-700/30 group-hover:text-slate-300 transition-colors">
          <span className="flex items-center gap-1">
            {isTask ? <CheckSquare className="w-3 h-3 text-slate-500" /> : <FileText className="w-3 h-3 text-slate-500" />}
            <span>Detaylar & Notlar</span>
          </span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </div>
  );
};
