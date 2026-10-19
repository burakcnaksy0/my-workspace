import React, { useState } from 'react';
import {
  Activity,
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Kanban,
  PenTool,
  Compass,
  LogOut,
  Plus,
  Briefcase,
  Code,
  Folder,
  User as UserIcon,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './features/auth/LoginForm';
import { AreaManagementModal } from './features/workspace/AreaManagementModal';
import { TaskListPanel } from './features/tasks/TaskListPanel';
import { DashboardPanel } from './features/dashboard/DashboardPanel';

const ICON_MAP: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  code: Code,
  activity: Activity,
  user: UserIcon,
  folder: Folder,
};

type TabId = 'overview' | 'tasks' | 'notes' | 'boards' | 'drawings' | 'areas';

const TAB_LABELS: Record<TabId, string> = {
  overview: 'Genel Bakış',
  tasks: 'Günlük Plan & Görevler',
  notes: 'Notlar (Tiptap)',
  boards: 'Çalışma Panoları',
  drawings: 'Çizimler (Excalidraw)',
  areas: 'Alanlar',
};

const DashboardContent: React.FC = () => {
  const { user, activeWorkspace, areas, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);

  const navItems = [
    { id: 'overview' as TabId, label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'tasks' as TabId, label: 'Günlük Plan & Görevler', icon: CalendarCheck },
    { id: 'notes' as TabId, label: 'Notlar (Tiptap)', icon: FileText, badge: 'Aşama 4' },
    { id: 'boards' as TabId, label: 'Çalışma Panoları', icon: Kanban, badge: 'Aşama 6' },
    { id: 'drawings' as TabId, label: 'Çizimler (Excalidraw)', icon: PenTool, badge: 'Aşama 5' },
    { id: 'areas' as TabId, label: 'Alanlar', icon: Compass, count: areas.length },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardPanel onNavigateToTasks={() => setActiveTab('tasks')} />;
      case 'tasks':
        return <TaskListPanel />;
      case 'areas':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Alanlar (Areas)</h3>
              <button
                onClick={() => setIsAreaModalOpen(true)}
                className="text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Yeni Alan
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {areas.map((area) => {
                const AreaIcon = ICON_MAP[area.icon || 'folder'] || Folder;
                return (
                  <div key={area.id} className="p-5 rounded-xl glass-card border border-slate-800 space-y-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${area.color || '#3b82f6'}20`, color: area.color || '#3b82f6' }}
                      >
                        <AreaIcon className="w-5 h-5" />
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: area.color || '#3b82f6' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{area.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{area.description || 'Açıklama belirtilmemiş'}</p>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                      Sıra: #{area.sortOrder + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4">
              <CalendarCheck className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">{TAB_LABELS[activeTab]}</p>
            <p className="text-xs mt-1">Bu modül ilerleyen aşamalarda geliştirilecektir.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 flex flex-col justify-between shrink-0 glass-panel">
        <div>
          {/* Logo & App Title */}
          <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
              PW
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Personal Workspace
              </h1>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                v1.0.0-phase3
              </div>
            </div>
          </div>

          {/* Active Workspace Pill */}
          <div className="p-3 mx-3 mt-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Çalışma Alanı</div>
            <div className="font-semibold text-white truncate mt-0.5">{activeWorkspace?.name || 'Kişisel Alan'}</div>
            <div className="text-[10px] text-blue-400 font-mono mt-0.5">Rol: {activeWorkspace?.role || 'OWNER'}</div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Modüller
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Areas List in Sidebar */}
          <div className="p-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-3 py-1 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Alanlar</span>
              <button
                onClick={() => setIsAreaModalOpen(true)}
                className="text-slate-400 hover:text-white text-xs p-1 rounded hover:bg-slate-800"
                title="Yeni Alan Ekle"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {areas.map((a) => {
                const AreaIcon = ICON_MAP[a.icon || 'folder'] || Folder;
                return (
                  <div
                    key={a.id}
                    className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800/40 transition"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: a.color || '#3b82f6' }}
                    />
                    <AreaIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{a.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with User info & Logout button */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
              {user?.username?.substring(0, 2) || 'AD'}
            </div>
            <div>
              <div className="text-xs font-semibold text-white leading-tight">{user?.username}</div>
              <div className="text-[10px] text-emerald-400 font-mono">Aktif Oturum</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition"
            title="Güvenli Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#0b101c] to-[#080c14]">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between glass-panel sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span>{activeWorkspace?.name || 'Kişisel Çalışma Alanım'}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                / {TAB_LABELS[activeTab]}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Aşama 3: Görev Yönetimi & Dashboard — Gerçek Verilerle
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition flex items-center gap-1.5 border border-slate-700/60"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              OpenAPI (Swagger)
            </a>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Area modal */}
      <AreaManagementModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
};

const AuthConsumer: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070b14] text-slate-300 font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-mono text-slate-400">Oturum kontrol ediliyor...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <DashboardContent />;
};

export default App;
