import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatusUpdateRequest, PagedResponse } from '../../types/task';
import {
  Plus, Check, AlertTriangle, Trash2, Edit3, X,
  ChevronUp, ChevronDown, Minus, Calendar, Tag, Filter, RefreshCw
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

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAreaId, setFilterAreaId] = useState<string>('');

  // Create form
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TaskFormData>({
    title: '', description: '', priority: 'MEDIUM', areaId: '', dueAt: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit form
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
      await apiRequest<Task>(`/api/workspaces/${activeWorkspace.id}/tasks`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
      setCreateForm({ title: '', description: '', priority: 'MEDIUM', areaId: '', dueAt: '' });
      setIsCreateOpen(false);
      loadTasks();
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
      await apiRequest<Task>(`/api/workspaces/${activeWorkspace.id}/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(req),
      });
      setEditingTask(null);
      loadTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Görev güncellenemedi');
    } finally {
      setIsEditing(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    if (!activeWorkspace) return;
    try {
      const req: TaskStatusUpdateRequest = { status: newStatus, version: task.version };
      await apiRequest<Task>(`/api/workspaces/${activeWorkspace.id}/tasks/${task.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
      loadTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Durum güncellenemedi');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!activeWorkspace) return;
    if (!window.confirm(`"${task.title}" görevi silinecek. Emin misiniz?`)) return;
    try {
      await apiRequest<void>(`/api/workspaces/${activeWorkspace.id}/tasks/${task.id}`, {
        method: 'DELETE',
      });
      loadTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Görev silinemedi');
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      areaId: task.areaId || '',
      dueAt: task.dueAt ? new Date(task.dueAt).toISOString().substring(0, 16) : '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Görevler</h3>
          <p className="text-xs text-slate-400 mt-0.5">{totalElements} görev toplam</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTasks}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Yeni Görev
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">Tüm Durumlar</option>
          <option value="TODO">Yapılacak</option>
          <option value="IN_PROGRESS">Devam Ediyor</option>
          <option value="DONE">Tamamlandı</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">Tüm Öncelikler</option>
          <option value="HIGH">Yüksek</option>
          <option value="MEDIUM">Orta</option>
          <option value="LOW">Düşük</option>
        </select>
        <select
          value={filterAreaId}
          onChange={(e) => setFilterAreaId(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">Tüm Alanlar</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
        {(filterStatus || filterPriority || filterAreaId) && (
          <button
            onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterAreaId(''); }}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition"
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
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="font-semibold text-white">Yeni Görev</h4>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                type="text" required autoFocus
                placeholder="Görev başlığı"
                value={createForm.title}
                onChange={(e) => setCreateForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Açıklama (isteğe bağlı)"
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Öncelik</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(p => ({ ...p, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
                    onChange={(e) => setCreateForm(p => ({ ...p, areaId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
                  onChange={(e) => setCreateForm(p => ({ ...p, dueAt: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating || !createForm.title.trim()}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {isCreating ? 'Oluşturuluyor...' : 'Görev Oluştur'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="font-semibold text-white">Görevi Düzenle</h4>
              <button onClick={() => setEditingTask(null)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-3">
              <input
                type="text" required autoFocus
                value={editForm.title}
                onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Öncelik</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm(p => ({ ...p, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
                    onChange={(e) => setEditForm(p => ({ ...p, areaId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
                  onChange={(e) => setEditForm(p => ({ ...p, dueAt: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isEditing || !editForm.title.trim()}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-dashed border-slate-600" />
          <p className="text-sm">Henüz görev yok.</p>
          <p className="text-xs mt-1">Yukarıdaki "Yeni Görev" düğmesine tıklayarak başlayın.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const priorityConf = PRIORITY_CONFIG[task.priority];
            const statusConf = STATUS_CONFIG[task.status];
            const PriorityIcon = priorityConf.icon;
            const overdue = isOverdue(task);

            return (
              <div
                key={task.id}
                className={`group p-4 rounded-xl glass-card border transition-all duration-150 ${
                  task.status === 'DONE'
                    ? 'border-slate-800/60 opacity-70'
                    : overdue
                    ? 'border-red-500/30 bg-red-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => {
                      const nextStatus: Record<string, Task['status']> = {
                        'TODO': 'IN_PROGRESS',
                        'IN_PROGRESS': 'DONE',
                        'DONE': 'TODO',
                      };
                      handleStatusChange(task, nextStatus[task.status]);
                    }}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                      task.status === 'DONE'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : task.status === 'IN_PROGRESS'
                        ? 'border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white'
                        : 'border-slate-600 text-transparent hover:border-slate-400 hover:text-slate-400'
                    }`}
                    title={`Durumu değiştir: ${statusConf.label}`}
                  >
                    <Check className="w-3 h-3" />
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium truncate ${
                        task.status === 'DONE' ? 'line-through text-slate-500' : 'text-white'
                      }`}>
                        {task.title}
                      </h4>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* Priority Badge */}
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${priorityConf.bg} ${priorityConf.color}`}>
                        <PriorityIcon className="w-3 h-3" />
                        {priorityConf.label}
                      </span>
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${statusConf.bg} ${statusConf.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor}`} />
                        {statusConf.label}
                      </span>
                      {/* Area */}
                      {task.areaName && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          <Tag className="w-3 h-3" />
                          {task.areaName}
                        </span>
                      )}
                      {/* Due Date */}
                      {task.dueAt && (
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${
                          overdue ? 'bg-red-900/40 text-red-300 border border-red-500/30' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueAt)}
                          {overdue && <AlertTriangle className="w-3 h-3 text-red-400" />}
                        </span>
                      )}
                      {/* Completed at */}
                      {task.completedAt && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-300">
                          <Check className="w-3 h-3" />
                          {formatDate(task.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
