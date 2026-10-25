import React, { useState, useEffect } from 'react';
import { X, CheckSquare, FileText, PenTool, Search, Plus, Check, Zap, Sparkles } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { isFitnessContext } from './exerciseDatabase';
import type { BoardColumn, BoardItem } from './types';
import type { Task } from '../../types/task';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  boardName?: string;
  columns?: BoardColumn[];
  existingItems: BoardItem[];
  defaultColumnId?: string;
  areaId?: string | null;
  onItemAdded: (itemType: 'TASK' | 'NOTE' | 'DRAWING', itemId: string, columnId?: string) => Promise<void>;
}

interface GenericItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'TASK' | 'NOTE' | 'DRAWING';
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  boardName,
  columns,
  existingItems,
  defaultColumnId,
  areaId,
  onItemAdded,
}) => {
  const isFitness = isFitnessContext(boardName);
  const [modalMode, setModalMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [activeTab, setActiveTab] = useState<'TASK' | 'NOTE' | 'DRAWING'>('TASK');
  const [search, setSearch] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState<string>(defaultColumnId || columns?.[0]?.id || '');
  const [items, setItems] = useState<GenericItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Quick Task Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [quickSuccessMsg, setQuickSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (defaultColumnId) {
      setSelectedColumnId(defaultColumnId);
    } else if (columns && columns.length > 0 && !selectedColumnId) {
      setSelectedColumnId(columns[0].id);
    }
    loadCandidates(activeTab);
  }, [isOpen, activeTab, workspaceId, defaultColumnId]);

  const loadCandidates = async (type: 'TASK' | 'NOTE' | 'DRAWING') => {
    setIsLoading(true);
    try {
      if (type === 'TASK') {
        const res = await apiRequest<{ content: Array<{ id: string; title: string; status: string; priority: string }> }>(
          `/api/workspaces/${workspaceId}/tasks?size=50`
        );
        const mapped = (res.content || []).map((t) => ({
          id: t.id,
          title: t.title,
          subtitle: `Durum: ${t.status} • Öncelik: ${t.priority}`,
          type: 'TASK' as const,
        }));
        setItems(mapped);
      } else if (type === 'NOTE') {
        const res = await apiRequest<{ content: Array<{ id: string; title: string; contentText?: string }> }>(
          `/api/workspaces/${workspaceId}/notes?size=50`
        );
        const mapped = (res.content || []).map((n) => ({
          id: n.id,
          title: n.title,
          subtitle: n.contentText ? n.contentText.slice(0, 60) + '...' : undefined,
          type: 'NOTE' as const,
        }));
        setItems(mapped);
      } else {
        const res = await apiRequest<Array<{ id: string; title: string }>>(
          `/api/workspaces/${workspaceId}/drawings`
        );
        const mapped = (res || []).map((d) => ({
          id: d.id,
          title: d.title,
          subtitle: 'Excalidraw Çizimi',
          type: 'DRAWING' as const,
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error('Aday öğeler yüklenirken hata:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isAlreadyAdded = (id: string, type: string) => {
    return existingItems.some((bi) => bi.itemId === id && bi.itemType === type);
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (candidate: GenericItem) => {
    setAddingId(candidate.id);
    try {
      await onItemAdded(candidate.type, candidate.id, selectedColumnId || undefined);
    } finally {
      setAddingId(null);
    }
  };

  const handleQuickCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmittingQuick(true);
    setQuickSuccessMsg(null);
    try {
      // 1. Create task
      const created = await apiRequest<Task>(`/api/workspaces/${workspaceId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          priority: newPriority,
          areaId: areaId || undefined,
        }),
      });

      // 2. Add to board
      await onItemAdded('TASK', created.id, selectedColumnId || undefined);

      setQuickSuccessMsg(`"${created.title}" oluşturuldu ve panoya eklendi!`);
      setNewTitle('');
      setNewDesc('');
      loadCandidates('TASK');

      setTimeout(() => setQuickSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Hızlı görev eklenirken hata:', err);
      alert('Kart oluşturulamadı.');
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> Panoya Kart / Öğe Ekle
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hızlı yeni kart oluşturun veya mevcut görev/notlardan seçin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Column Selection (if columns exist) */}
        {columns && columns.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Hedef Gün / Sütun:</span>
            <select
              value={selectedColumnId}
              onChange={(e) => setSelectedColumnId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.mappedStatus ? `(${c.mappedStatus})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mode Switcher: Quick Create vs Select Existing */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800 text-xs font-medium">
          <button
            onClick={() => setModalMode('CREATE')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              modalMode === 'CREATE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> {isFitness ? '⚡ Hızlı Egzersiz Ekle' : '⚡ Hızlı Yeni Kart Ekle'}
          </button>
          <button
            onClick={() => setModalMode('SELECT')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              modalMode === 'SELECT'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Mevcut Öğelerden Seç
          </button>
        </div>

        {modalMode === 'CREATE' ? (
          /* Quick Create Form */
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {quickSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{quickSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleQuickCreateAndAdd} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  {isFitness ? 'Egzersiz / Hareket Başlığı' : 'Kart / Görev Başlığı'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={
                    isFitness
                      ? 'örn: Bench Press (4 set x 10 tekrar)'
                      : 'örn: Sprint planlaması yap veya Müşteri teklifini hazırla'
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  {isFitness ? 'Detay / Ağırlık / Not (İsteğe bağlı)' : 'Açıklama / Detaylar (İsteğe bağlı)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isFitness
                      ? 'örn: 70kg hedef ağırlık, form odağı...'
                      : 'örn: İlgili hedefler, notlar veya alt maddeler...'
                  }
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 resize-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Öncelik</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-1.5 px-2 rounded-lg border text-center font-medium transition ${
                        newPriority === p
                          ? p === 'HIGH'
                            ? 'bg-red-500/20 border-red-500 text-red-300'
                            : p === 'MEDIUM'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p === 'HIGH' ? 'Yüksek' : p === 'MEDIUM' ? 'Orta' : 'Düşük'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingQuick || !newTitle.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {isSubmittingQuick ? 'Oluşturuluyor...' : 'Hemen Oluştur ve Sütuna Ekle'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Select Existing Items View */
          <>
            {/* Type Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/20 px-4 pt-2 gap-2">
              <button
                onClick={() => setActiveTab('TASK')}
                className={`pb-2.5 px-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'TASK'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Görevler
              </button>
              <button
                onClick={() => setActiveTab('NOTE')}
                className={`pb-2.5 px-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'NOTE'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Notlar
              </button>
              <button
                onClick={() => setActiveTab('DRAWING')}
                className={`pb-2.5 px-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'DRAWING'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" /> Çizimler
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/30">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="İsme göre ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Yükleniyor...</div>
              ) : filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <p>{search ? 'Aramaya uygun öğe bulunamadı.' : 'Henüz bu türde kayıtlı bir öğe bulunmuyor.'}</p>
                  <button
                    type="button"
                    onClick={() => setModalMode('CREATE')}
                    className="text-blue-400 hover:underline text-xs"
                  >
                    ⚡ Buradan yeni kart oluşturarak ekleyin
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const alreadyAdded = isAlreadyAdded(item.id, item.type);
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition ${
                        alreadyAdded
                          ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <h4 className="text-sm font-medium text-slate-200 truncate">{item.title}</h4>
                        {item.subtitle && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                        )}
                      </div>
                      <div>
                        {alreadyAdded ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                            <Check className="w-3 h-3" /> Eklendi
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAdd(item)}
                            disabled={addingId === item.id}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1 disabled:opacity-50"
                          >
                            <Plus className="w-3.5 h-3.5" /> Ekle
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Tamam / Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
