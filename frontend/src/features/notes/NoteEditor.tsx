import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { TextSelection } from 'prosemirror-state';
import {
  Save,
  Trash2,
  Tag as TagIcon,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  Layers,
} from 'lucide-react';
import { useAutosave } from '../../hooks/useAutosave';
import { NoteToolbar } from './NoteToolbar';
import { processImageFile, CustomImage } from './noteImage';
import { apiRequest } from '../../lib/api';
import type { Note, UpdateNoteRequest } from '../../types/note';
import type { Area } from '../../types/workspace';

interface NoteEditorProps {
  note: Note;
  areas: Area[];
  onUpdateNote: (req: UpdateNoteRequest) => Promise<Note>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onNoteSaved?: (savedNote: Note) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  areas,
  onUpdateNote,
  onDeleteNote,
  onNoteSaved,
}) => {
  const [title, setTitle] = useState(note.title);
  const [areaId, setAreaId] = useState<string | null>(note.areaId);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [version, setVersion] = useState(note.version);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state if a different note is selected
  useEffect(() => {
    setTitle(note.title);
    setAreaId(note.areaId);
    setTags(note.tags || []);
    setVersion(note.version);
  }, [note.id]);

  // Initial content parsing
  const initialContent = useMemo(() => {
    if (!note.content) return '';
    try {
      return JSON.parse(note.content);
    } catch {
      return note.content;
    }
  }, [note.id]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        dropcursor: {
          color: '#3b82f6',
          width: 3,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline hover:text-blue-300',
        },
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-slate max-w-none min-h-[400px] focus:outline-none p-4 text-slate-200 text-sm leading-relaxed',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));
        if (imageItem) {
          const file = imageItem.getAsFile();
          if (file) {
            event.preventDefault();
            processImageFile(file)
              .then((src) => {
                const { schema } = view.state;
                if (schema.nodes.image) {
                  const imageNode = schema.nodes.image.create({
                    src,
                    width: '100%',
                    alignment: 'center',
                  });
                  const pNode = schema.nodes.paragraph.create();
                  let tr = view.state.tr.replaceSelectionWith(imageNode);
                  const insertPos = tr.selection.to;
                  tr = tr.insert(insertPos, pNode);
                  const targetPos = Math.min(insertPos + 1, tr.doc.content.size);
                  try {
                    const resolvedPos = tr.doc.resolve(targetPos);
                    tr = tr.setSelection(TextSelection.near(resolvedPos));
                  } catch {
                    // ignore
                  }
                  view.dispatch(tr);
                  view.focus();
                }
              })
              .catch((err) => console.error('Pasted image failed:', err));
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            event.preventDefault();
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            processImageFile(file)
              .then((src) => {
                const { schema } = view.state;
                if (schema.nodes.image) {
                  const imageNode = schema.nodes.image.create({
                    src,
                    width: '100%',
                    alignment: 'center',
                  });
                  const pNode = schema.nodes.paragraph.create();
                  let tr = view.state.tr;
                  if (coordinates) {
                    tr = tr.insert(coordinates.pos, [imageNode, pNode]);
                    const targetPos = Math.min(coordinates.pos + imageNode.nodeSize + 1, tr.doc.content.size);
                    try {
                      const resolvedPos = tr.doc.resolve(targetPos);
                      tr = tr.setSelection(TextSelection.near(resolvedPos));
                    } catch {
                      // ignore
                    }
                  } else {
                    tr = tr.replaceSelectionWith(imageNode);
                    const insertPos = tr.selection.to;
                    tr = tr.insert(insertPos, pNode);
                    const targetPos = Math.min(insertPos + 1, tr.doc.content.size);
                    try {
                      const resolvedPos = tr.doc.resolve(targetPos);
                      tr = tr.setSelection(TextSelection.near(resolvedPos));
                    } catch {
                      // ignore
                    }
                  }
                  view.dispatch(tr);
                  view.focus();
                }
              })
              .catch((err) => console.error('Dropped image failed:', err));
            return true;
          }
        }
        return false;
      },
    },
  });

  // Re-set editor content when note changes
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, note.id]);

  // Prepare autosave payload
  const currentFormData = useMemo(() => {
    return {
      title,
      areaId,
      tags,
      // Will extract JSON and text inside save callback
    };
  }, [title, areaId, tags]);

  const versionRef = useRef(version);
  versionRef.current = version;

  /**
   * 409 çakışmasında sunucudaki güncel sürümü getirir; yerel düzenlemeler
   * korunur, yalnızca optimistic-lock sürümü tazelenir.
   */
  const recoverConflictVersion = useCallback(async () => {
    try {
      const latest = await apiRequest<Note>(
        `/api/workspaces/${note.workspaceId}/notes/${note.id}`
      );
      versionRef.current = latest.version;
      setVersion(latest.version);
      return true;
    } catch {
      return false;
    }
  }, [note.workspaceId, note.id]);

  const handleSave = useCallback(
    async (_data: typeof currentFormData) => {
      if (!editor) return;
      const contentJson = JSON.stringify(editor.getJSON());
      const contentText = editor.getText();

      const req: UpdateNoteRequest = {
        title: title.trim() || 'Başlıksız Not',
        areaId: areaId || null,
        content: contentJson,
        contentText,
        contentFormat: 'tiptap-json-v1',
        tags,
        version: versionRef.current,
      };

      const updated = await onUpdateNote(req);
      versionRef.current = updated.version;
      setVersion(updated.version);
      if (onNoteSaved) {
        onNoteSaved(updated);
      }
    },
    [editor, title, areaId, tags, onUpdateNote, onNoteSaved]
  );

  const { saveStatus, errorMessage, conflictNotice, dismissConflictNotice, lastSavedAt, saveNow, triggerAutosave } = useAutosave({
    data: currentFormData,
    onSave: handleSave,
    delay: 1200,
    onConflictRecovery: recoverConflictVersion,
  });

  // Listen to editor content change to trigger debounced autosave (NOT instant saveNow!)
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      triggerAutosave();
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, triggerAutosave]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = newTagInput.trim().toLowerCase().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Bağlantı adresi (URL):', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const src = await processImageFile(file);
      editor.chain().focus().setImage({ src, width: '100%', alignment: 'center' } as any).run();
      editor.chain().focus().insertContent('<p></p>').run();
    } catch (err) {
      console.error('Görsel yüklenemedi:', err);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Top Meta Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        {/* Title Input */}
        <div className="w-full sm:w-auto sm:flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Not başlığı..."
            className="w-full bg-transparent text-lg sm:text-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-0 border-b border-transparent focus:border-blue-500/50 pb-1 transition"
          />
        </div>

        {/* Action Controls & Save Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Area Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={areaId || ''}
              onChange={(e) => setAreaId(e.target.value || null)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-300">
                Alansız (Genel)
              </option>
              {areas.map((area) => (
                <option key={area.id} value={area.id} className="bg-slate-900 text-white">
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-blue-400 bg-blue-900/30 border border-blue-500/30 px-2.5 py-1 rounded-full animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Kaydediliyor...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Kaydedildi
              </span>
            )}
            {saveStatus === 'dirty' && (
              <span className="flex items-center gap-1 text-amber-400 bg-amber-900/30 border border-amber-500/30 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                Kaydedilmemiş
              </span>
            )}
            {saveStatus === 'error' && (
              <span
                className="flex items-center gap-1 text-red-400 bg-red-900/30 border border-red-500/30 px-2.5 py-1 rounded-full cursor-help"
                title={errorMessage || 'Kaydetme hatası'}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Kayıt Hatası
              </span>
            )}
          </div>

          {/* Manual Save Button */}
          <button
            onClick={() => saveNow()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-md shadow-blue-500/10 active:scale-95"
            title="Manuel Kaydet (Ctrl + S)"
          >
            <Save className="w-3.5 h-3.5" />
            Kaydet
          </button>

          {/* Delete Button */}
          <button
            onClick={async () => {
              if (window.confirm(`"${note.title}" başlıklı notu silmek istediğinize emin misiniz?`)) {
                setIsDeleting(true);
                try {
                  await onDeleteNote(note.id);
                } finally {
                  setIsDeleting(false);
                }
              }
            }}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            title="Notu Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conflict Recovery Notice (bilgilendirme, kayıt otomatik devam eder) */}
      {conflictNotice && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-900/30 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="flex-1">{conflictNotice}</span>
          <button
            type="button"
            onClick={dismissConflictNotice}
            className="text-amber-300 hover:text-amber-100 shrink-0"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Conflict Error Alert if any */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tag Editor Bar */}
      <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-900/30 flex items-center gap-2 flex-wrap text-xs">
        <TagIcon className="w-3.5 h-3.5 text-slate-400" />
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px]"
          >
            #{tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-slate-400 hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <Plus className="w-3 h-3 text-slate-500" />
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Etiket ekle... (Enter)"
            className="bg-transparent text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none w-32"
          />
        </div>
      </div>

      {/* Tiptap Formatting Toolbar */}
      {editor && (
        <NoteToolbar
          editor={editor}
          onSetLink={setLink}
          fileInputRef={fileInputRef}
          onImageFileChange={handleImageFileChange}
        />
      )}

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <EditorContent editor={editor} />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Sürüm (Version): #{version}</span>
        {lastSavedAt && (
          <span>Son Kayıt: {lastSavedAt.toLocaleTimeString('tr-TR')}</span>
        )}
      </div>
    </div>
  );
};
