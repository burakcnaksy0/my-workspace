import React, { useCallback, useEffect, useState } from 'react';
import { Link2, Loader2, PenTool, Plus, CheckSquare, StickyNote, Trash2 } from 'lucide-react';
import {
  contentLinksApi,
  fetchCandidates,
  REF_TYPE_LABELS,
  type ContentCandidate,
  type ContentLinkDto,
  type ContentRefType,
} from './api';
import { useToast } from '../../components/ui/toast';

interface ContentLinksPanelProps {
  workspaceId: string;
  /** Bağlantısı gösterilen içerik (bu panelin ait olduğu öğe). */
  refType: ContentRefType;
  refId: string;
}

const TYPE_ICONS: Record<ContentRefType, React.ReactNode> = {
  TASK: <CheckSquare className="w-3 h-3" />,
  NOTE: <StickyNote className="w-3 h-3" />,
  DRAWING: <PenTool className="w-3 h-3" />,
};

/**
 * Bir içeriğin (görev/not/çizim) çapraz bağlantılarını gösterir:
 * listeleme, tür + hedef seçip ekleme, bağlantıyı kaldırma.
 */
export const ContentLinksPanel: React.FC<ContentLinksPanelProps> = ({
  workspaceId,
  refType,
  refId,
}) => {
  const toast = useToast();
  const [links, setLinks] = useState<ContentLinkDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [targetType, setTargetType] = useState<ContentRefType>('NOTE');
  const [candidates, setCandidates] = useState<ContentCandidate[]>([]);
  const [targetId, setTargetId] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLinks(await contentLinksApi.listRelated(workspaceId, refType, refId));
    } catch {
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, refType, refId]);

  useEffect(() => {
    load();
  }, [load]);

  // Hedef türü değişince aday listesini tazela
  useEffect(() => {
    let cancelled = false;
    setTargetId('');
    fetchCandidates(workspaceId, targetType)
      .then((c) => {
        if (!cancelled) setCandidates(c);
      })
      .catch(() => {
        if (!cancelled) setCandidates([]);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, targetType]);

  /** Bağlantının panele bakmayan ucu (karşı taraf). */
  const otherSide = (l: ContentLinkDto) =>
    l.sourceType === refType && l.sourceId === refId
      ? { type: l.targetType, id: l.targetId, title: l.targetTitle, exists: l.targetExists }
      : { type: l.sourceType, id: l.sourceId, title: l.sourceTitle, exists: l.sourceExists };

  const alreadyLinked = new Set(links.map((l) => otherSide(l).id));
  const availableCandidates = candidates.filter(
    (c) => c.id !== refId && !alreadyLinked.has(c.id)
  );

  const handleAdd = async () => {
    if (!targetId) return;
    setBusy(true);
    try {
      await contentLinksApi.create(workspaceId, {
        sourceType: refType,
        sourceId: refId,
        targetType,
        targetId,
      });
      await load();
      toast.success('Bağlantı oluşturuldu.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bağlantı oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (linkId: string) => {
    try {
      await contentLinksApi.remove(workspaceId, linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bağlantı silinemedi.');
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <Link2 className="w-4 h-4 text-blue-400" /> Bağlantılar
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Bağlantılar yükleniyor...
        </div>
      ) : (
        <ul className="space-y-1.5">
          {links.length === 0 && (
            <li className="text-xs text-slate-500">
              Henüz bağlantı yok. Aşağıdan görev, not veya çizim bağlayabilirsiniz.
            </li>
          )}
          {links.map((l) => {
            const other = otherSide(l);
            return (
              <li
                key={l.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs"
              >
                <span className="flex items-center gap-1 text-slate-400 shrink-0">
                  {TYPE_ICONS[other.type]}
                  {REF_TYPE_LABELS[other.type]}
                </span>
                <span
                  className={`flex-1 truncate ${other.exists ? 'text-slate-200' : 'text-slate-500 line-through'}`}
                  title={other.title}
                >
                  {other.title}
                </span>
                {l.label && (
                  <span className="text-[10px] text-slate-500 italic truncate max-w-24">{l.label}</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(l.id)}
                  className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                  title="Bağlantıyı kaldır"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Yeni bağlantı ekle */}
      <div className="flex items-center gap-1.5 pt-1">
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value as ContentRefType)}
          className="bg-slate-800 border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer"
          title="Bağlanacak içerik türü"
        >
          <option value="TASK">Görev</option>
          <option value="NOTE">Not</option>
          <option value="DRAWING">Çizim</option>
        </select>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="flex-1 min-w-0 bg-slate-800 border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer"
        >
          <option value="">
            {candidates.length === 0 ? 'Bağlanacak içerik yok' : 'Hedef seçin...'}
          </option>
          {availableCandidates.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900 text-white">
              {c.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!targetId || busy}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition shrink-0"
          title="Bağlantı kur"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Ekle
        </button>
      </div>
    </div>
  );
};
