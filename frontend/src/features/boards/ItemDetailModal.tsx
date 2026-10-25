import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  FileText,
  CheckSquare,
  Sparkles,
  Calendar,
  Save,
  Dumbbell,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import type { BoardItem } from './types';
import type { Task, TaskStatusUpdateRequest } from '../../types/task';

interface ItemDetailModalProps {
  item: BoardItem;
  workspaceId: string;
  onClose: () => void;
  onRefreshBoard: () => void;
  onOpenAsExercise?: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  workspaceId,
  onClose,
  onRefreshBoard,
  onOpenAsExercise,
}) => {
  const details = item.itemDetails || {};
  const isTask = item.itemType === 'TASK';
  const isNote = item.itemType === 'NOTE';
  const title = (details.title as string) || (isTask ? 'Görev' : isNote ? 'Not' : 'Öğe');

  const [currentStatus, setCurrentStatus] = useState<string>(
    (details.status as string) || 'TODO'
  );
  const [currentPriority, setCurrentPriority] = useState<string>(
    (details.priority as string) || 'MEDIUM'
  );
  const [description, setDescription] = useState<string>(
    (details.snippet as string) || ''
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStatusChange = async (newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!isTask) return;
    setIsUpdatingStatus(true);
    try {
      const req: TaskStatusUpdateRequest = {
        status: newStatus,
        version: 0,
      };
      await apiRequest<Task>(`/api/workspaces/${workspaceId}/tasks/${item.itemId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
      setCurrentStatus(newStatus);
      onRefreshBoard();
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!isTask) return;
    setIsSaving(true);
    try {
      await apiRequest<Task>(`/api/workspaces/${workspaceId}/tasks/${item.itemId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description,
          priority: currentPriority,
          status: currentStatus,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onRefreshBoard();
    } catch (err) {
      console.error('Görev güncellenemedi:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  isTask
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : isNote
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                }`}
              >
                {isTask ? (
                  <CheckSquare className="w-3 h-3" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                {isTask ? 'Görev Kartı' : isNote ? 'Not Kartı' : 'Çizim'}
              </span>

              {isTask && (
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    currentPriority === 'URGENT' || currentPriority === 'HIGH'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : currentPriority === 'MEDIUM'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {currentPriority === 'URGENT'
                    ? 'Acil'
                    : currentPriority === 'HIGH'
                    ? 'Yüksek Öncelik'
                    : currentPriority === 'MEDIUM'
                    ? 'Orta Öncelik'
                    : 'Düşük Öncelik'}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white break-words">
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Status Switcher (Tasks only) */}
          {isTask && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                İlerleme Durumu
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange('TODO')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                    currentStatus === 'TODO'
                      ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Yapılacak
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                    currentStatus === 'IN_PROGRESS'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Devam Ediyor
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange('DONE')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                    currentStatus === 'DONE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                </button>
              </div>
            </div>
          )}

          {/* Description & Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isTask ? 'Açıklama & Detaylar' : 'Not İçeriği'}
              </label>
              {isTask && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-medium">Öncelik:</label>
                  <select
                    value={currentPriority}
                    onChange={(e) => setCurrentPriority(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                    <option value="URGENT">Acil</option>
                  </select>
                </div>
              )}
            </div>

            {isTask ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu göreve ait notlar, alt maddeler veya hedefler..."
                rows={5}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/80 transition resize-y font-sans leading-relaxed"
              />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {description || 'Bu not için henüz ek bir içerik yok.'}
              </div>
            )}
          </div>

          {/* Optional: Switch to Exercise View button if user wants to see sports guide */}
          {onOpenAsExercise && (
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Bu kart spor veya fitness hareketi ise kas haritasını ve form rehberini açabilirsiniz.
              </div>
              <button
                type="button"
                onClick={onOpenAsExercise}
                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition flex items-center gap-1.5 shrink-0"
              >
                <Dumbbell className="w-3.5 h-3.5" /> Egzersiz Rehberi
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {details.dueAt && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                Son Tarih: {new Date(details.dueAt as string).toLocaleDateString('tr-TR')}
              </span>
            )}
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Değişiklikler kaydedildi
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Kapat
            </button>
            {isTask && (
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-blue-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
