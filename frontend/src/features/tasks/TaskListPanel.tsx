import React, { useState, useEffect, useCallback } from 'react';
import { useDialogA11y } from '../../hooks/useDialogA11y';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatusUpdateRequest, PagedResponse } from '../../types/task';
import {
  Plus, Check, AlertTriangle, Trash2, Edit3, X,
  ChevronUp, ChevronDown, Minus, Calendar, Tag, Filter, RefreshCw,
  LayoutList, Columns3, CheckCircle2, Clock, Zap, CheckSquare
} from 'lucide-react';

const PRIORITY_CONFIG = {
  HIGH: { label: 'Yüksek', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: ChevronUp },
  MEDIUM: { label: 'Orta', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Minus },
  LOW: { label: 'Düşük', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: ChevronDown },
};

const STATUS_CONFIG = {
  TODO: { label: 'Yapılacak', color: 'text-slate-400', bg: 'bg-slate-500/10', dotColor: 'bg-slate-400' },
  IN_PROGRESS: { label: 'Devam Ediyor', color: 'text-blue-400', bg: 'bg-blue-500/10', dotColor: 'bg-blue-400' },
  DONE: { label: 'Tamamlandı', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dotColor: 'bg-emerald-400' },
};

function formatDate(isoString: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(task: Task): boolean {
  if (!task.dueAt || task.status === 'DONE') return false;
  return new Date(task.dueAt) < new Date();
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  areaId: string;
  dueAt: string;
}

export const TaskListPanel: React.FC = () => {
  const { activeWorkspace, areas } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View mode: 'LIST' or 'COLUMNS' (default: 'COLUMNS')
  const [viewMode, setViewMode] = useState<'LIST' | 'COLUMNS'>('COLUMNS');

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAreaId, setFilterAreaId] = useState<string>('');

  // Quick Inline Add Bar
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAreaId, setQuickAreaId] = useState('');
  const [quickPriority, setQuickPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Create form modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TaskFormData>({
    title: '', description: '', priority: 'MEDIUM', areaId: '', dueAt: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit form
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const createModalRef = useDialogA11y<HTMLDivElement>(
    () => setIsCreateOpen(false),
    isCreateOpen
  );
  const editModalRef = useDialogA11y<HTMLDivElement>(
    () => setEditingTask(null),
    !!editingTask
  );
  const [editForm, setEditForm] = useState<TaskFormData>({
    title: '', description: '', priority: 'MEDIUM', areaId: '', dueAt: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('size', '100');
      if (filterStatus) params.set('status', filterStatus);
      if (filterPriority) params.set('priority', filterPriority);
      if (filterAreaId) params.set('areaId', filterAreaId);

      const data = await apiRequest<PagedResponse<Task>>(
        `/api/workspaces/${activeWorkspace.id}/tasks?${params.toString()}`
      );
      setTasks(data.content);
      setTotalElements(data.totalElements);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Görevler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace, filterStatus, filterPriority, filterAreaId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Quick Task Create with optimistic prepend
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !quickTitle.trim()) return;

    setIsQuickAdding(true);
    try {
      const req: CreateTaskRequest = {
        title: quickTitle.trim(),
        priority: quickPriority,
        areaId: quickAreaId || filterAreaId || undefined,
      };
      const created = await apiRequest<Task>(`/api/workspaces/${activeWorkspace.id}/tasks`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
      setQuickTitle('');
      setTasks((prev) => [created, ...prev]);
      setTotalElements((prev) => prev + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Görev oluşturulamadı');
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !createForm.title.trim()) return;
    setIsCreating(true);
    try {
      const req: CreateTaskRequest = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        priority: createForm.priority,
        areaId: createForm.areaId || undefined,
        dueAt: createForm.dueAt ? new Date(createForm.dueAt).toISOString() : undefined,
      };
      const created = await apiRequest<Task>(`/api/workspaces/${activeWorkspace.id}/tasks`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
      setCreateForm({ title: '', description: '', priority: 'MEDIUM', areaId: '', dueAt: '' });
      setIsCreateOpen(false);
      setTasks((prev) => [created, ...prev]);
      setTotalElements((prev) => prev + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Görev oluşturulamadı');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !editingTask) return;
    setIsEditing(true);
    try {
      const req: UpdateTaskRequest = {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        priority: editForm.priority,
        status: editingTask.status,
        areaId: editForm.areaId || null,
        dueAt: editForm.dueAt ? new Date(editForm.dueAt).toISOString() : null,
        version: editingTask.version,
      };
      const updated = await apiRequest<Task>(`/api/workspaces/${activeWorkspace.id}/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(req),
      });
      setEditingTask(null);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Görev güncellenemedi');
    } finally {
      setIsEditing(false);
    }
  };

  // Instant Optimistic Status Change (Zero Delay feedback)
  const handleStatusChange = useCallback(async (task: Task, newStatus: Task['status']) => {
    if (!activeWorkspace) return;
    const prevTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus, version: t.version + 1 } : t))
    );
    try {
      const req: TaskStatusUpdateRequest = { status: newStatus, version: task.version };
      const updated = await apiRequest<Task>(`/api/workspaces/${activeWorkspace.id}/tasks/${task.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: unknown) {
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : 'Durum güncellenemedi');
    }
  }, [activeWorkspace, tasks]);

  // Instant Optimistic Task Deletion
  const handleDeleteTask = useCallback(async (task: Task) => {
    if (!activeWorkspace) return;
    if (!window.confirm(`"${task.title}" görevi silinecek. Emin misiniz?`)) return;
    const prevTasks = [...tasks];
    const prevTotal = totalElements;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setTotalElements((prev) => Math.max(0, prev - 1));
    try {
      await apiRequest<void>(`/api/workspaces/${activeWorkspace.id}/tasks/${task.id}`, {
        method: 'DELETE',
      });
    } catch (err: unknown) {
      setTasks(prevTasks);
      // Sayfalı listede toplam, o anki sayfa uzunluğuna değil öncesi tutulan değere dönmeli
      setTotalElements(prevTotal);
      setError(err instanceof Error ? err.message : 'Görev silinemedi');
    }
  }, [activeWorkspace, tasks, totalElements]);

  const startEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      areaId: task.areaId || '',
      dueAt: task.dueAt ? new Date(task.dueAt).toISOString().substring(0, 16) : '',
    });
  }, []);

  // Stats
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const overdueCount = tasks.filter(isOverdue).length;

  return (
    <div className="space-y-6">
      {/* Top Header & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            Günlük Plan & Görevler
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {totalElements} Görev
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Görevlerinizi, günlük planlarınızı ve hedeflerinizi kolayca yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'LIST'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Liste
            </button>
            <button
              onClick={() => setViewMode('COLUMNS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'COLUMNS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" /> Durum Sütunları
            </button>
          </div>

          <button
            onClick={loadTasks}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="text-xs px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Detaylı Görev
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Yapılacak
          </div>
          <div className="text-2xl font-bold text-white mt-1">{todoCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="text-xs font-medium text-blue-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Devam Eden
          </div>
          <div className="text-2xl font-bold text-blue-300 mt-1">{inProgressCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tamamlanan
          </div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{doneCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="text-xs font-medium text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Geciken
          </div>
          <div className="text-2xl font-bold text-red-300 mt-1">{overdueCount}</div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md"
      >
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            required
            placeholder="⚡ Hızlı bir görev ekleyin (örn: Müşteri sunumu hazırla veya Squat 4x10)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 transition"
          />
        </div>

        <select
          value={quickAreaId || filterAreaId}
          onChange={(e) => setQuickAreaId(e.target.value)}
          className="bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
        >
          <option value="">Alan Seçin (Genel)</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value as Task['priority'])}
          className="bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
        >
          <option value="LOW">Düşük Öncelik</option>
          <option value="MEDIUM">Orta Öncelik</option>
          <option value="HIGH">Yüksek Öncelik</option>
        </select>

        <button
          type="submit"
          disabled={isQuickAdding || !quickTitle.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          {isQuickAdding ? 'Ekleniyor...' : 'Hızlı Ekle'}
        </button>
      </form>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="TODO">Yapılacak</option>
            <option value="IN_PROGRESS">Devam Ediyor</option>
            <option value="DONE">Tamamlandı</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tüm Öncelikler</option>
            <option value="HIGH">Yüksek</option>
            <option value="MEDIUM">Orta</option>
            <option value="LOW">Düşük</option>
          </select>
          <select
            value={filterAreaId}
            onChange={(e) => setFilterAreaId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tüm Alanlar</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>

        {(filterStatus || filterPriority || filterAreaId) && (
          <button
            onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterAreaId(''); }}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-slate-800 transition"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tasks View: LIST vs COLUMNS */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-xs space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span>Görevler yükleniyor...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">Henüz Görev Bulunmuyor</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Yukarıdaki hızlı ekleme kutusunu kullanarak yeni görevler ekleyin.
          </p>
        </div>
      ) : viewMode === 'COLUMNS' ? (
        /* Status Kanban Columns View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((colStatus) => {
            const colConf = STATUS_CONFIG[colStatus];
            const colTasks = tasks.filter((t) => t.status === colStatus);

            return (
              <div
                key={colStatus}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-4 shadow-xl flex flex-col min-h-[400px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colConf.dotColor}`} />
                    <h4 className="text-sm font-bold text-white">{colConf.label}</h4>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-medium">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-600 border border-dashed border-slate-800/60 rounded-xl">
                      Bu durumda görev yok
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={startEdit}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full-width List View */
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={startEdit}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}
        >
          <div
            ref={createModalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Yeni görev oluştur"
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="font-semibold text-white">Yeni Görev</h4>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                type="text"
                required
                autoFocus
                placeholder="Görev başlığı"
                value={createForm.title}
                onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Açıklama veya detaylar (isteğe bağlı)..."
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Öncelik</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm((p) => ({ ...p, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HIGH">Yüksek</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="LOW">Düşük</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Alan</label>
                  <select
                    value={createForm.areaId}
                    onChange={(e) => setCreateForm((p) => ({ ...p, areaId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seçilmedi</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Son Tarih</label>
                <input
                  type="datetime-local"
                  value={createForm.dueAt}
                  onChange={(e) => setCreateForm((p) => ({ ...p, dueAt: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {isCreating ? 'Kaydediliyor...' : 'Görevi Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingTask(null); }}
        >
          <div
            ref={editModalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Görevi düzenle"
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="font-semibold text-white">Görevi Düzenle</h4>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-3">
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Öncelik</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HIGH">Yüksek</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="LOW">Düşük</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Alan</label>
                  <select
                    value={editForm.areaId}
                    onChange={(e) => setEditForm((p) => ({ ...p, areaId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seçilmedi</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Son Tarih</label>
                <input
                  type="datetime-local"
                  value={editForm.dueAt}
                  onChange={(e) => setEditForm((p) => ({ ...p, dueAt: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {isEditing ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = React.memo(({ task, onStatusChange, onEdit, onDelete }) => {
  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
  const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const PriorityIcon = priorityConf.icon;
  const overdue = isOverdue(task);

  return (
    <div className="p-4 rounded-xl bg-slate-900/75 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-md group">
      <div className="flex items-start gap-3.5">
        {/* Status Checkbox Button */}
        <button
          onClick={() => {
            const nextStatus: Record<string, Task['status']> = {
              TODO: 'IN_PROGRESS',
              IN_PROGRESS: 'DONE',
              DONE: 'TODO',
            };
            onStatusChange(task, nextStatus[task.status]);
          }}
          className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition shrink-0 ${
            task.status === 'DONE'
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : task.status === 'IN_PROGRESS'
              ? 'border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white'
              : 'border-slate-600 text-transparent hover:border-slate-400 hover:text-slate-400'
          }`}
          title={`Durumu değiştir: ${statusConf.label}`}
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-semibold truncate ${
                task.status === 'DONE' ? 'line-through text-slate-500' : 'text-white'
              }`}
            >
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${priorityConf.bg} ${priorityConf.color} font-medium`}
            >
              <PriorityIcon className="w-3 h-3" />
              {priorityConf.label}
            </span>

            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md ${statusConf.bg} ${statusConf.color} font-medium`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor}`} />
              {statusConf.label}
            </span>

            {/* Area */}
            {task.areaName && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                <Tag className="w-3 h-3" />
                {task.areaName}
              </span>
            )}

            {/* Due Date */}
            {task.dueAt && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md ${
                  overdue
                    ? 'bg-red-900/40 text-red-300 border border-red-500/30 font-medium'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueAt)}
                {overdue && <AlertTriangle className="w-3 h-3 text-red-400" />}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Düzenle"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition"
            title="Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
