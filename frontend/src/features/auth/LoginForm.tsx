import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('workspace_admin_password_change_me');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login({ username, password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kullanıcı adı veya parola hatalı';
      setErrorMsg(message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070b14] relative overflow-hidden font-sans">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center shadow-lg shadow-blue-500/25 text-white font-extrabold text-2xl mb-2">
            PW
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Personal Workspace</h1>
          <p className="text-sm text-slate-400">
            Kişisel bilgi, görev ve çalışma merkezinize giriş yapın.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Güvenli Oturum Girişi
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Aşama 2
            </span>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Kullanıcı adınız"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Parola
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              <span>{isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Seed credentials info badge */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-300">Varsayılan Bootstrap Kullanıcısı:</span>
            <div className="mt-1 font-mono text-slate-400 space-y-0.5">
              <div>Kullanıcı Adı: <span className="text-blue-400">admin</span></div>
              <div>Parola: <span className="text-slate-200">.env dosyasındaki BOOTSTRAP_ADMIN_PASSWORD</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
