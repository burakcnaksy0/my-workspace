import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import type { DashboardData, Task } from '../../types/task';
import {
  LayoutDashboard, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  ListTodo, Loader2, ArrowRight, Calendar, ChevronUp, Minus, ChevronDown, Tag
} from 'lucide-react';

const PRIORITY_ICON: Record<string, React.ElementType> = {
  HIGH: ChevronUp,
  MEDIUM: Minus,
  LOW: ChevronDown,
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: 'text-red-400',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-blue-400',
};

function formatDate(isoString: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

interface Props {
  onNavigateToTasks?: () => void;
}

export const DashboardPanel: React.FC<Props> = ({ onNavigateToTasks }) => {
  const { activeWorkspace } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    setError(null);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
      const result = await apiRequest<DashboardData>(
        `/api/workspaces/${activeWorkspace.id}/dashboard?timezone=${encodeURIComponent(tz)}`
      );
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Dashboard verileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-sm">
        <AlertTriangle className="w-4 h-4 inline mr-2" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  const completionRate = data.totalTasks > 0
    ? Math.round((data.doneCount / data.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Toplam Görev"
          value={data.totalTasks}
          icon={LayoutDashboard}
          color="blue"
        />
        <StatCard
          label="Yapılacak"
          value={data.todoCount}
          icon={ListTodo}
          color="slate"
        />
        <StatCard
          label="Devam Ediyor"
          value={data.inProgressCount}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Tamamlandı"
          value={data.doneCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle={data.totalTasks > 0 ? `%${completionRate}` : undefined}
        />
      </div>

      {/* Progress Bar */}
      {data.totalTasks > 0 && (
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              Genel İlerleme
            </span>
            <span className="text-xs font-mono text-slate-400">
              {data.doneCount}/{data.totalTasks} görev
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="p-5 rounded-xl glass-card border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Geciken Görevler
            </h4>
            {(data.overdueCount || 0) > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-500/30 font-mono">
                {data.overdueCount}
              </span>
            )}
          </div>
          {(data.overdueTasks || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">🎉 Geciken görev yok!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(data.overdueTasks || []).map((task) => (
                <TaskMiniCard key={task.id} task={task} variant="overdue" />
              ))}
            </div>
          )}
        </div>

        {/* Due Today */}
        <div className="p-5 rounded-xl glass-card border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Bugün Son Tarihli
            </h4>
            {(data.dueTodayTasks || []).length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-500/30 font-mono">
                {(data.dueTodayTasks || []).length}
              </span>
            )}
          </div>
          {(data.dueTodayTasks || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Bugün için planlanan görev yok.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(data.dueTodayTasks || []).map((task) => (
                <TaskMiniCard key={task.id} task={task} variant="today" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently Completed */}
      <div className="p-5 rounded-xl glass-card border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Son Tamamlanan Görevler (7 gün)
          </h4>
          {onNavigateToTasks && (
            <button
              onClick={onNavigateToTasks}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              Tümünü Gör <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {(data.recentlyCompletedTasks || []).length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Son 7 günde tamamlanan görev yok. Hadi başlayalım!
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {(data.recentlyCompletedTasks || []).map((task) => (
              <TaskMiniCard key={task.id} task={task} variant="completed" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Sub-components ---------- */

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'slate' | 'amber' | 'emerald';
  subtitle?: string;
}

const COLOR_MAP = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  slate: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, subtitle }) => {
  const c = COLOR_MAP[color];
  return (
    <div className={`p-4 rounded-xl glass-card border border-slate-800 hover:border-slate-700 transition`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        {subtitle && (
          <span className={`text-xs font-mono ${c.text}`}>{subtitle}</span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
};

interface TaskMiniCardProps {
  task: Task;
  variant: 'overdue' | 'today' | 'completed';
}

const TaskMiniCard: React.FC<TaskMiniCardProps> = ({ task, variant }) => {
  const PIcon = PRIORITY_ICON[task.priority] || Minus;
  const pColor = PRIORITY_COLOR[task.priority] || 'text-slate-400';

  return (
    <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-3 ${
      variant === 'overdue'
        ? 'bg-red-950/20 border-red-500/20'
        : variant === 'today'
        ? 'bg-amber-950/20 border-amber-500/20'
        : 'bg-emerald-950/10 border-slate-800'
    }`}>
      <PIcon className={`w-3.5 h-3.5 shrink-0 ${pColor}`} />
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${variant === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
          {task.areaName && (
            <span className="flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" /> {task.areaName}
            </span>
          )}
          {task.dueAt && variant !== 'completed' && (
            <span>{formatDate(task.dueAt)}</span>
          )}
          {task.completedAt && variant === 'completed' && (
            <span>{timeAgo(task.completedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
