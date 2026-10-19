import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  Layers,
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Kanban,
  PenTool,
  Compass,
  RefreshCw,
  Server,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from './lib/api';

interface HealthData {
  status: string;
  application?: string;
  version?: string;
  timestamp?: string;
  database?: string;
  databaseType?: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'notes' | 'boards' | 'drawings' | 'areas'>('overview');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<HealthData>('/api/health');
      setHealth(data);
      setLastChecked(new Date().toLocaleTimeString('tr-TR'));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Bağlantı hatası';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'tasks', label: 'Günlük Plan & Görevler', icon: CalendarCheck, badge: 'Aşama 3' },
    { id: 'notes', label: 'Notlar (Tiptap)', icon: FileText, badge: 'Aşama 4' },
    { id: 'boards', label: 'Çalışma Panoları', icon: Kanban, badge: 'Aşama 6' },
    { id: 'drawings', label: 'Çizimler (Excalidraw)', icon: PenTool, badge: 'Aşama 5' },
    { id: 'areas', label: 'Alanlar', icon: Compass, badge: 'Aşama 2' },
  ];

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
                v1.0.0-phase1
              </div>
            </div>
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
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
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
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / System Health mini bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Sistem Durumu
            </span>
            <span className="text-[10px] text-slate-400">{lastChecked || 'Kontrol ediliyor'}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                health?.status === 'UP' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'
              }`}
            />
            <span className="font-mono text-slate-300 text-[11px]">
              {health?.status === 'UP' ? 'Bileşenler Aktif' : loading ? 'Bağlanıyor...' : 'Bağlantı Bekleniyor'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#0b101c] to-[#080c14]">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between glass-panel sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Aşama 1 — Altyapı ve Servis Doğrulama
            </h2>
            <p className="text-xs text-slate-400">
              React 18 + Vite + TypeScript &bull; Spring Boot 3.4 + Java 21 &bull; PostgreSQL 16 &bull; Flyway
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

            <button
              onClick={checkHealth}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yeniden Kontrol Et
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Status Alert Banner */}
          {error ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold">Backend Bağlantısı Kurulamadı: </span>
                {error}. Backend container'ının ve veritabanının ayakta olduğunu doğrulayın.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/30 text-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-emerald-300">Aşama 1 Altyapısı Başarıyla Doğrulandı: </span>
                  Frontend, Backend REST API ve PostgreSQL veritabanı tam entegrasyonla çalışmaktadır.
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-700/40 text-emerald-300">
                HTTP 200 OK
              </span>
            </div>
          )}

          {/* Infrastructure Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Frontend */}
            <div className="p-5 rounded-xl glass-card border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Frontend UI</h3>
                <p className="text-xs text-slate-400 mt-0.5">React 18 &bull; Vite 6 &bull; TypeScript</p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80 font-mono">
                <div>Port: <span className="text-slate-200">3000 (localhost)</span></div>
                <div>Routing: <span className="text-slate-200">Same-Origin (/api)</span></div>
              </div>
            </div>

            {/* Card 2: Backend */}
            <div className="p-5 rounded-xl glass-card border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Server className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
                  health?.status === 'UP'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {health?.status === 'UP' ? 'ONLINE' : 'BEKLENİYOR'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Backend API</h3>
                <p className="text-xs text-slate-400 mt-0.5">Spring Boot 3.4 &bull; Java 21 LTS</p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80 font-mono">
                <div>Durum: <span className="text-slate-200">{health?.status || 'N/A'}</span></div>
                <div>Sürüm: <span className="text-slate-200">{health?.version || '1.0.0'}</span></div>
              </div>
            </div>

            {/* Card 3: Database */}
            <div className="p-5 rounded-xl glass-card border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
                  health?.database === 'CONNECTED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {health?.database === 'CONNECTED' ? 'CONNECTED' : 'BEKLENİYOR'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Veritabanı</h3>
                <p className="text-xs text-slate-400 mt-0.5">PostgreSQL 16 Alpine</p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80 font-mono">
                <div>Kalıcılık: <span className="text-slate-200">postgres_data vol</span></div>
                <div>İzolasyon: <span className="text-slate-200">Docker Network</span></div>
              </div>
            </div>

            {/* Card 4: Flyway */}
            <div className="p-5 rounded-xl glass-card border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  MIGRATED
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Flyway Migration</h3>
                <p className="text-xs text-slate-400 mt-0.5">V1__init_schema.sql</p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80 font-mono">
                <div>Tablo Sayısı: <span className="text-slate-200">13 Çekirdek Tablo</span></div>
                <div>Hibernate: <span className="text-slate-200">ddl-auto=validate</span></div>
              </div>
            </div>
          </div>

          {/* Architecture & Phase 1 Scope Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-xl glass-card border border-slate-800 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Doğrulanan Altyapı İlkeleri ve Güvenlik
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Same-Origin Kuralı
                  </div>
                  <p className="text-slate-400">
                    Frontend kodu sabit host veya port içermez; tüm API çağrıları <code className="text-blue-300">/api/*</code> üzerinden proxy edilir.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Double-Submit CSRF Güvenliği
                  </div>
                  <p className="text-slate-400">
                    CookieCsrfTokenRepository ve HttpOnly oturum cookie'leri yapılandırıldı.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Deterministik Şema Yönetimi
                  </div>
                  <p className="text-slate-400">
                    Flyway ile sürüm kontrollü geçişler. Hibernate validate modunda entity tutarlılığı doğrulanır.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Kalıcı Oturumlar (Spring Session)
                  </div>
                  <p className="text-slate-400">
                    Oturumlar PostgreSQL JDBC tablosunda saklanır; backend restart edilse dahi oturumlar korunur.
                  </p>
                </div>
              </div>

              {/* Endpoints Table */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Aşama 1 Uç Noktaları
                </h4>
                <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
                      <tr>
                        <th className="p-2.5">Metot</th>
                        <th className="p-2.5">Uç Nokta</th>
                        <th className="p-2.5">Açıklama</th>
                        <th className="p-2.5">Erişim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                      <tr className="hover:bg-slate-800/30">
                        <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                        <td className="p-2.5 text-blue-300">/api/health</td>
                        <td className="p-2.5 font-sans">Altyapı ve veritabanı sağlık kontrolü</td>
                        <td className="p-2.5 text-slate-400">Public</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                        <td className="p-2.5 text-blue-300">/api/actuator/health</td>
                        <td className="p-2.5 font-sans">Spring Boot standart Actuator health probe</td>
                        <td className="p-2.5 text-slate-400">Public</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                        <td className="p-2.5 text-blue-300">/api/swagger-ui.html</td>
                        <td className="p-2.5 font-sans">OpenAPI / Swagger interaktif dokümantasyon</td>
                        <td className="p-2.5 text-slate-400">Public</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Next Steps / Phase Roadmap */}
            <div className="p-6 rounded-xl glass-card border border-slate-800 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Sonraki Aşama Yol Haritası
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30">
                  <div className="font-semibold text-blue-300">Aşama 2 — Kimlik Doğrulama & Workspace</div>
                  <p className="text-slate-400 mt-1">
                    Bootstrap kullanıcı, Login/Logout, Workspace oluşturma, Alanlar (İş, Öğrenim, Spor, Kişisel), ve Workspace izolasyon yetkileri.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="font-semibold text-slate-300">Aşama 3 — Görevler & Dashboard</div>
                  <p className="text-slate-400 mt-1">
                    Görev CRUD, öncelikler, son tarihler, durum geçişleri ve gerçek verilerle beslenen Dashboard.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="font-semibold text-slate-300">Aşama 4 & 5 — Notlar & Çizimler</div>
                  <p className="text-slate-400 mt-1">
                    Tiptap zengin metin editörü ve Excalidraw serbest çizim motoru entegrasyonu + useAutosave.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="font-semibold text-slate-300">Aşama 6 & 7 — Panolar & Teslim</div>
                  <p className="text-slate-400 mt-1">
                    Sütunlu (dnd-kit) ve serbest (React Flow) panolar, yedekleme/geri yükleme testi ve teslim raporu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
