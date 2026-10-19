import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Folder, Briefcase, Code, Activity, User, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  code: Code,
  activity: Activity,
  user: User,
  folder: Folder,
  tag: Tag,
};

export const AreaManagementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { areas, createArea, activeWorkspace } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createArea({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
      });
      setName('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Alan oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
  const availableIcons = ['briefcase', 'code', 'activity', 'user', 'folder', 'tag'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-base">Çalışma Alanları (Areas)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeWorkspace?.name || 'Kişisel Çalışma Alanım'} için kategorileri yönetin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing areas list */}
        <div className="py-4 space-y-2 max-h-52 overflow-y-auto pr-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Mevcut Alanlar ({areas.length})
          </div>
          {areas.map((area) => {
            const IconComp = ICON_MAP[area.icon || 'folder'] || Folder;
            return (
              <div
                key={area.id}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${area.color || '#3b82f6'}20`, color: area.color || '#3b82f6' }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{area.name}</div>
                    {area.description && (
                      <div className="text-[11px] text-slate-400">{area.description}</div>
                    )}
                  </div>
                </div>
                <span
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: area.color || '#3b82f6' }}
                />
              </div>
            );
          })}
        </div>

        {/* Add new area form */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-800 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Yeni Alan Ekle
          </div>

          {error && <div className="text-xs text-red-400">{error}</div>}

          <div>
            <input
              type="text"
              required
              placeholder="Alan adı (Ör: Finans, Kitaplar...)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Açıklama (isteğe bağlı)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Color & Icon Picker */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Renk:</span>
              {availableColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full transition ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">İkon:</span>
              {availableIcons.map((ic) => {
                const Ic = ICON_MAP[ic];
                return (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`p-1 rounded transition ${
                      icon === ic ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Ic className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Alanı Kaydet</span>
          </button>
        </form>
      </div>
    </div>
  );
};
