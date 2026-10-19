import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Link2,
  Table2,
  Undo,
  Redo,
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
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline hover:text-blue-300',
        },
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
        version,
      };

      const updated = await onUpdateNote(req);
      setVersion(updated.version);
      if (onNoteSaved) {
        onNoteSaved(updated);
      }
    },
    [editor, title, areaId, tags, version, onUpdateNote, onNoteSaved]
  );

  const { saveStatus, errorMessage, lastSavedAt, saveNow } = useAutosave({
    data: currentFormData,
    onSave: handleSave,
    delay: 2000,
  });

  // Listen to editor content change to trigger autosave
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Trigger save by forcing state change or debounced call
      saveNow();
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, saveNow]);

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

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Top Meta Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        {/* Title Input */}
        <div className="flex-1 min-w-[260px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Not başlığı..."
            className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-0 border-b border-transparent focus:border-blue-500/50 pb-1 transition"
          />
        </div>

        {/* Action Controls & Save Status */}
        <div className="flex items-center gap-3">
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
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/70 flex flex-wrap items-center gap-1 text-slate-300">
          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Başlık 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Başlık 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Başlık 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Inline Styles */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Kalın (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="İtalik (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Üstü Çizili"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Satır İçi Kod"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists & Blocks */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Madde İşaretli Liste"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numaralı Liste"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Alıntı"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Kod Bloğu"
          >
            <SquareCode className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Links & Tables */}
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Bağlantı Ekle / Düzenle"
          >
            <Link2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            isActive={editor.isActive('table')}
            title="Tablo Ekle (3x3)"
          >
          <Table2 className="w-4 h-4" />
        </ToolbarButton>

          {editor.isActive('table') && (
        <div className="flex items-center gap-1 text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="hover:text-white"
            title="Sütun Ekle"
          >
            +Sütun
          </button>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="hover:text-white"
            title="Satır Ekle"
          >
            +Satır
          </button>
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="hover:text-red-400"
            title="Tabloyu Sil"
          >
            Sil
          </button>
        </div>
      )}

      <ToolbarDivider />

      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Geri Al (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="İleri Al (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}

{/* Editor Content Area */ }
<div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
  <EditorContent editor={editor} />
</div>

{/* Footer Info */ }
<div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between">
  <span>Sürüm (Version): #{version}</span>
  {lastSavedAt && (
    <span>Son Kayıt: {lastSavedAt.toLocaleTimeString('tr-TR')}</span>
  )}
</div>
    </div >
  );
};

/* ---------- Sub-components ---------- */

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg transition text-xs ${isActive
        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-[1px] h-4 bg-slate-700/60 mx-1" />;
