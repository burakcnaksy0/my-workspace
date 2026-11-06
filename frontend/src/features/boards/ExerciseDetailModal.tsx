import React, { useState } from 'react';
import {
  X,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wind,
  Sparkles,
  Target,
  Edit2,
  Save,
  Clock,
  Flame,
} from 'lucide-react';
import { findExerciseInDatabase } from './exerciseDatabase';
import { ExerciseVisual } from './ExerciseVisual';
import { apiRequest } from '../../lib/api';
import { useDialogA11y } from '../../hooks/useDialogA11y';
import type { BoardItem } from './types';
import type { Task, TaskStatusUpdateRequest } from '../../types/task';

interface ExerciseDetailModalProps {
  item: BoardItem;
  workspaceId: string;
  onClose: () => void;
  onRefreshBoard: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  item,
  workspaceId,
  onClose,
  onRefreshBoard,
}) => {
  const details = item.itemDetails || {};
  const title = details.title || 'Egzersiz';
  const exercise = findExerciseInDatabase(title);
  // 'dynamic-' önekli kayıtlar veritabanında bulunamayınca otomatik üretilir
  const isDynamicContent = exercise.id.startsWith('dynamic-');

  const [activeTab, setActiveTab] = useState<'FORM' | 'TIPS' | 'TRACKER'>('FORM');
  const [currentStatus, setCurrentStatus] = useState<string>(details.status || 'TODO');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Set / Note Tracker state
  const [userNotes, setUserNotes] = useState<string>(details.snippet || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const panelRef = useDialogA11y<HTMLDivElement>(onClose);

  // Status Change handler
  const handleStatusChange = async (newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (item.itemType !== 'TASK') return;
    setIsUpdatingStatus(true);
    setErrorMsg(null);
    try {
      const req: TaskStatusUpdateRequest = {
        status: newStatus,
        version: (details.version as number) ?? 0,
      };
      await apiRequest<Task>(`/api/workspaces/${workspaceId}/tasks/${item.itemId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
      setCurrentStatus(newStatus);
      onRefreshBoard();
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Durum güncellenemedi.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save personal workout notes / weights
  const handleSaveNotes = async () => {
    if (item.itemType !== 'TASK') return;
    setIsSavingNotes(true);
    setErrorMsg(null);
    try {
      await apiRequest<Task>(`/api/workspaces/${workspaceId}/tasks/${item.itemId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description: userNotes,
          priority: details.priority || 'MEDIUM',
          status: currentStatus,
          version: (details.version as number) ?? 0,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onRefreshBoard();
    } catch (err) {
      console.error('Notlar kaydedilemedi:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Notlar kaydedilemedi.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} egzersiz rehberi`}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto outline-none"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" />
                {exercise?.category || 'Spor Egzersizi'}
              </span>
              {exercise?.difficulty && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {exercise.difficulty} Seviye
                </span>
              )}
              {exercise?.benchAngle && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  {exercise.benchAngle}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {exercise?.name || title}
            </h2>
            {exercise?.nameTr && (
              <p className="text-xs sm:text-sm text-slate-400 font-medium">{exercise.nameTr}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Quick Switch Bar */}
        <div className="px-5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            Bugünkü Durum:
          </span>
          <div className="flex items-center gap-1.5">
            {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                disabled={isUpdatingStatus}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  currentStatus === st
                    ? st === 'DONE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : st === 'IN_PROGRESS'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'TODO' ? 'Yapılacak' : st === 'IN_PROGRESS' ? 'Setteyim / Yapılıyor' : 'Tamamlandı'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-3 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('FORM')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'FORM'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" /> Biyomekanik & Doğru Form
          </button>
          <button
            onClick={() => setActiveTab('TIPS')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'TIPS'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" /> İpuçları & Hatalar
          </button>
          <button
            onClick={() => setActiveTab('TRACKER')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'TRACKER'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit2 className="w-4 h-4" /> Ağırlık / Set Kaydı
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {isDynamicContent && (
            <div
              role="note"
              className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Bu hareket veritabanımızda kayıtlı değil; aşağıdaki rehber hareket adı ve
                kategori benzerliğine göre <strong>otomatik üretilmiştir</strong>. Genel form
                ilkeleri hakkında yol göstericidir, kişisel eğitim önerisi yerine geçmez.
              </p>
            </div>
          )}
          {activeTab === 'FORM' && (
            <>
              {/* Anatomical & Biomechanical Graphic */}
              {exercise ? (
                <ExerciseVisual exercise={exercise} />
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
                  <Dumbbell className="w-8 h-8 text-blue-500 mx-auto" />
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p>Bu hareket için özel veritabanı rehberi hazırlanıyor.</p>
                </div>
              )}

              {/* Target Muscles */}
              {exercise && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-400" /> Hedef Kas Grupları
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                      <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                        Birincil Kaslar (Primary)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {exercise.targetMuscles.primary.map((m) => (
                          <span
                            key={m}
                            className="text-xs px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-200 font-medium border border-blue-500/30"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        İkincil / Yardımcı Kaslar
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {exercise.targetMuscles.secondary.map((m) => (
                          <span
                            key={m}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium border border-slate-700"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              {exercise?.instructions && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Adım Adım Doğru Form (Cues)
                  </h3>
                  <div className="space-y-2">
                    {exercise.instructions.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Breathing Guide */}
              {exercise?.breathing && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
                  <Wind className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Nefes Tekniği
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{exercise.breathing}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'TIPS' && (
            <>
              {/* Pro Tips */}
              {exercise?.proTips && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" /> Antrenör Püf Noktaları (Pro Tips)
                  </h3>
                  <div className="space-y-2">
                    {exercise.proTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3"
                      >
                        <span className="text-amber-400 text-sm mt-0.5">💡</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              {exercise?.commonMistakes && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Sık Yapılan Hatalar & Sakatlık Önleme
                  </h3>
                  <div className="space-y-2">
                    {exercise.commonMistakes.map((mistake, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                      >
                        <span className="text-red-400 text-sm mt-0.5">❌</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{mistake}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Sets */}
              {exercise?.recommendedSets && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Önerilen Set & Tekrar Aralığı
                    </span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      {exercise.recommendedSets}
                    </span>
                  </div>
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
              )}

              {/* Alternatives */}
              {exercise?.alternatives && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Alternatif Egzersizler
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.alternatives.map((alt) => (
                      <span
                        key={alt}
                        className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'TRACKER' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-400" /> Kişisel Antrenman & Ağırlık Notları
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Bu harekette kaldırdığınız kiloları ve tekrar sayılarınızı kaydedin.
                </p>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kayıtlar başarıyla güncellendi!</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Set, Ağırlık ve Tekrar Kayıtları:
                </label>
                <textarea
                  rows={5}
                  placeholder={`Örnek:\nSet 1: 22.5 kg x 10 tekrar\nSet 2: 25 kg x 8 tekrar\nSet 3: 25 kg x 8 tekrar (Son set tükeniş)`}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Otomatik olarak panodaki kart detayında saklanır.
                </span>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingNotes ? 'Kaydediliyor...' : 'Notları Kaydet'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Açık Kaynak Biyomekanik Egzersiz Rehberi
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition shadow-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
