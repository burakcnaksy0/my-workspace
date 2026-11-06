import React, { useState } from 'react';
import type { Editor } from '@tiptap/react';
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
  Image as ImageIcon,
  Undo,
  Redo,
  LayoutTemplate,
  ChevronDown,
} from 'lucide-react';
import { NOTE_TEMPLATES } from './noteTemplates';

interface NoteToolbarProps {
  editor: Editor;
  onSetLink: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Tiptap biçimlendirme çubuğu: başlıklar, satır içi stiller, listeler,
 * bağlantı/görsel/tablo ekleme ve hazır şablon menüsü.
 */
export const NoteToolbar: React.FC<NoteToolbarProps> = ({
  editor,
  onSetLink,
  fileInputRef,
  onImageFileChange,
}) => {
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  return (
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

          {/* Links, Images & Tables */}
          <ToolbarButton
            onClick={onSetLink}
            isActive={editor.isActive('link')}
            title="Bağlantı Ekle / Düzenle"
          >
            <Link2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            title="Görsel Ekle / Yükle (veya doğrudan panodan Ctrl+V yapıştırın)"
          >
            <ImageIcon className="w-4 h-4" />
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageFileChange}
        />

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

          {/* Note Templates Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0"
              title="Not Hazır Şablonları"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Hazır Şablon</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-30 animate-fade-in space-y-1">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Hazır Not Şablonları
                </div>
                {NOTE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertContent(tmpl.html).run();
                      setIsTemplateMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition flex items-start gap-2.5 group"
                  >
                    <span className="text-lg leading-none mt-0.5">{tmpl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {tmpl.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {tmpl.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

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
  );
};

/* ---------- Toolbar sub-components ---------- */

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
