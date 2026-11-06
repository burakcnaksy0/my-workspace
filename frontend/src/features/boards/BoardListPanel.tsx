import React, { useState, useEffect, useCallback } from 'react';
import {
  Kanban,
  Plus,
  RefreshCw,
  LayoutGrid,
  Columns3,
  Calendar,
  Trash2,
  ArrowLeft,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { boardsApi } from './api';
import { ColumnBoardView } from './ColumnBoardView';
import { FreeformBoardView } from './FreeformBoardView';
import { AddItemModal } from './AddItemModal';
import type { BoardSummary, BoardDetails, CreateBoardRequest, BoardType } from './types';

export const BoardListPanel: React.FC = () => {
  const { activeWorkspace, areas } = useAuth();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [activeBoard, setActiveBoard] = useState<BoardDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Yeni Pano Form State
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardType, setNewBoardType] = useState<BoardType>('COLUMNS');
  const [newBoardAreaId, setNewBoardAreaId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const [selectedColumnForAdd, setSelectedColumnForAdd] = useState<string | undefined>(undefined);

  const workspaceId = activeWorkspace?.id;

  const fetchBoards = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const data = await boardsApi.getBoards(workspaceId);
      setBoards(data);
    } catch (err) {
      console.error('Panolar yüklenirken hata:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  const loadBoardDetails = async (boardId: string) => {
    if (!workspaceId) return;
    setIsBoardLoading(true);
    try {
      const details = await boardsApi.getBoard(workspaceId, boardId);
      setActiveBoard(details);
    } catch (err) {
      console.error('Pano detayları yüklenirken hata:', err);
    } finally {
      setIsBoardLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !newBoardName.trim()) return;

    setIsCreating(true);
    try {
      const req: CreateBoardRequest = {
        name: newBoardName.trim(),
        boardType: newBoardType,
        areaId: newBoardAreaId || null,
      };
      const created = await boardsApi.createBoard(workspaceId, req);
      setNewBoardName('');
      setNewBoardType('COLUMNS');
      setNewBoardAreaId('');
      setIsCreateModalOpen(false);
      await fetchBoards();
      setActiveBoard(created);
    } catch (err) {
      console.error('Pano oluşturulurken hata:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!workspaceId) return;
    if (!window.confirm('Bu panoyu silmek istediğinize emin misiniz? Panodaki görev ve notlar korunacaktır.')) {
      return;
    }

    try {
      await boardsApi.deleteBoard(workspaceId, boardId);
      if (activeBoard?.id === boardId) {
        setActiveBoard(null);
      }
      fetchBoards();
    } catch (err) {
      console.error('Pano silinirken hata:', err);
    }
  };

  const handleItemAdded = async (
    itemType: 'TASK' | 'NOTE' | 'DRAWING',
    itemId: string,
    columnId?: string
  ) => {
    if (!workspaceId || !activeBoard) return;
    try {
      await boardsApi.addItem(workspaceId, activeBoard.id, {
        itemType,
        itemId,
        columnId,
        positionX: 50 + Math.random() * 200,
        positionY: 50 + Math.random() * 200,
      });
      setIsAddItemModalOpen(false);
      loadBoardDetails(activeBoard.id);
    } catch (err) {
      console.error('Öğe eklenirken hata:', err);
      alert('Öğe panoya eklenemedi (zaten ekli olabilir).');
    }
  };

  // Aktif pano açıksa pano detayını render et
  if (activeBoard) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#090d16] text-slate-100 overflow-hidden">
        {/* Navigation Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              setActiveBoard(null);
              fetchBoards();
            }}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Panolara Dön
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadBoardDetails(activeBoard.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isBoardLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={(e) => handleDeleteBoard(activeBoard.id, e)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Panoyu Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Component */}
        {activeBoard.boardType === 'COLUMNS' ? (
          <ColumnBoardView
            board={activeBoard}
            onRefresh={() => loadBoardDetails(activeBoard.id)}
            onOpenAddItemModal={(colId?: string) => {
              setSelectedColumnForAdd(colId);
              setIsAddItemModalOpen(true);
            }}
          />
        ) : (
          <FreeformBoardView
            board={activeBoard}
            onRefresh={() => loadBoardDetails(activeBoard.id)}
            onOpenAddItemModal={() => {
              setSelectedColumnForAdd(undefined);
              setIsAddItemModalOpen(true);
            }}
          />
        )}

        {/* Add Item Modal */}
        {workspaceId && (
          <AddItemModal
            isOpen={isAddItemModalOpen}
            onClose={() => {
              setIsAddItemModalOpen(false);
              setSelectedColumnForAdd(undefined);
            }}
            workspaceId={workspaceId}
            boardName={activeBoard.name}
            columns={activeBoard.columns}
            existingItems={activeBoard.items}
            defaultColumnId={selectedColumnForAdd}
            areaId={activeBoard.areaId}
            onItemAdded={handleItemAdded}
          />
        )}
      </div>
    );
  }

  // Pano Listesi Görünümü
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 w-full max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Kanban className="w-7 h-7 text-blue-500" /> Çalışma Panoları
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sütunlu Kanban veya Serbest Tuval panolarında görevleri ve notları görsel olarak düzenleyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBoards}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Yeni Pano Oluştur
          </button>
        </div>
      </div>

      {/* Grid of Boards */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Panolar yükleniyor...</div>
      ) : boards.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Kanban className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">Henüz Pano Yok</h3>
          <p className="text-xs text-slate-400 mt-1.5 mb-6">
            Görevlerinizi sütunlara dizmek veya serbestçe ilişkilendirmek için ilk panonuzu oluşturun.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> İlk Panoyu Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {boards.map((b) => {
            const area = areas.find((a) => a.id === b.areaId);
            const isColumns = b.boardType === 'COLUMNS';

            return (
              <div
                key={b.id}
                onClick={() => loadBoardDetails(b.id)}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group shadow-lg hover:shadow-xl hover:bg-slate-900/80"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                        isColumns
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {isColumns ? <Columns3 className="w-3 h-3" /> : <LayoutGrid className="w-3 h-3" />}
                      {isColumns ? 'Sütunlu Kanban' : 'Serbest Tuval'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteBoard(b.id, e)}
                      className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition"
                      title="Panoyu Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    {b.name}
                  </h3>

                  {area && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                      <Compass className="w-3.5 h-3.5" style={{ color: area.color || '#3b82f6' }} />
                      <span>{area.name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(b.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
                    Aç →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Yeni Pano Oluştur Modalı */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Yeni Çalışma Panosu</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Pano Adı</label>
                <input
                  type="text"
                  placeholder="örn: Sprint 1 Panosu veya Mimari Taslak"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Pano Türü</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewBoardType('COLUMNS')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                      newBoardType === 'COLUMNS'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Columns3 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold">Sütunlu Kanban</span>
                    <span className="text-[10px] text-slate-500">Yapılacak, Devam, Bitti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewBoardType('FREEFORM')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                      newBoardType === 'FREEFORM'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold">Serbest Tuval</span>
                    <span className="text-[10px] text-slate-500">2D yerleşim ve bağlantılar</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">İlişkili Alan (İsteğe bağlı)</label>
                <select
                  value={newBoardAreaId}
                  onChange={(e) => setNewBoardAreaId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="">Genel (Alansız)</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!newBoardName.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition disabled:opacity-50"
                >
                  {isCreating ? 'Oluşturuluyor...' : 'Pano Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
