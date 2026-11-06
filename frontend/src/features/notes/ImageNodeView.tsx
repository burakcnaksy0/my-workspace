import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  Move,
  Pin,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  Trash2,
} from 'lucide-react';

export const ImageNodeView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isPinned = Boolean(node.attrs.isPinned);
  const [currentWidth, setCurrentWidth] = useState<string>(node.attrs.width || '100%');
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: node.attrs.posX || 0,
    y: node.attrs.posY || 0,
  });

  const width = node.attrs.width || '100%';
  const alignment = node.attrs.alignment || 'center'; // 'left' | 'center' | 'right' | 'float-left' | 'float-right' | 'pinned'

  useEffect(() => {
    if (!isResizing) {
      setCurrentWidth(node.attrs.width || '100%');
    }
  }, [node.attrs.width, isResizing]);

  useEffect(() => {
    if (!isDragging) {
      setPos({
        x: node.attrs.posX || 0,
        y: node.attrs.posY || 0,
      });
    }
  }, [node.attrs.posX, node.attrs.posY, isDragging]);

  // --- Toggle Pin / Sabitleme (Anchored absolute vs in-flow) ---
  const handleTogglePin = () => {
    if (!isPinned) {
      // Calculate current rendered pixel offset relative to .tiptap container
      const tiptapEl = containerRef.current?.closest('.tiptap') || containerRef.current?.offsetParent;
      if (containerRef.current && tiptapEl) {
        const tiptapRect = tiptapEl.getBoundingClientRect();
        const imgRect = containerRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.round(imgRect.left - tiptapRect.left));
        const newY = Math.max(0, Math.round(imgRect.top - tiptapRect.top));

        setPos({ x: newX, y: newY });
        updateAttributes({
          isPinned: true,
          posX: newX,
          posY: newY,
          alignment: 'pinned',
        });
        return;
      }
      updateAttributes({ isPinned: true, alignment: 'pinned' });
    } else {
      // Unpin: return to normal inline document flow
      setPos({ x: 0, y: 0 });
      updateAttributes({
        isPinned: false,
        posX: 0,
        posY: 0,
        alignment: 'center',
      });
    }
  };

  // --- Smooth Freeform Dragging ---
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If not pinned yet, determine starting position relative to .tiptap
    let initialX = pos.x;
    let initialY = pos.y;

    const tiptapEl = containerRef.current?.closest('.tiptap') || containerRef.current?.offsetParent;
    if (!isPinned && containerRef.current && tiptapEl) {
      const tiptapRect = tiptapEl.getBoundingClientRect();
      const imgRect = containerRef.current.getBoundingClientRect();
      initialX = Math.max(0, Math.round(imgRect.left - tiptapRect.left));
      initialY = Math.max(0, Math.round(imgRect.top - tiptapRect.top));
      setPos({ x: initialX, y: initialY });
    }

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const dx = moveEvent.clientX - startMouseX;
      const dy = moveEvent.clientY - startMouseY;
      setPos({
        x: Math.max(0, Math.round(initialX + dx)),
        y: Math.max(0, Math.round(initialY + dy)),
      });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const dx = upEvent.clientX - startMouseX;
      const dy = upEvent.clientY - startMouseY;
      const finalX = Math.max(0, Math.round(initialX + dx));
      const finalY = Math.max(0, Math.round(initialY + dy));

      setPos({ x: finalX, y: finalY });
      // When dragged freely, auto-pin to this position so Enter will NEVER push it down!
      updateAttributes({
        posX: finalX,
        posY: finalY,
        isPinned: true,
        alignment: 'pinned',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // --- Corner / Edge Resizing ---
  const handleResizeStart = (
    e: React.MouseEvent,
    direction: 'se' | 'sw' | 'e' | 'w'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const startX = e.clientX;
    const startRect = containerRef.current.getBoundingClientRect();
    const startWidth = startRect.width;

    const parent = containerRef.current.closest('.prose') || containerRef.current.parentElement;
    const parentWidth = parent ? parent.getBoundingClientRect().width : 800;

    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      let deltaX = moveEvent.clientX - startX;
      if (direction === 'sw' || direction === 'w') {
        deltaX = -deltaX;
      }
      const newPixelWidth = Math.max(120, Math.min(parentWidth, startWidth + deltaX));
      const percent = Math.min(100, Math.max(15, Math.round((newPixelWidth / parentWidth) * 100)));
      setCurrentWidth(`${percent}%`);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      let deltaX = upEvent.clientX - startX;
      if (direction === 'sw' || direction === 'w') {
        deltaX = -deltaX;
      }
      const finalPixelWidth = Math.max(120, Math.min(parentWidth, startWidth + deltaX));
      const finalPercent = `${Math.min(100, Math.max(15, Math.round((finalPixelWidth / parentWidth) * 100)))}%`;
      setCurrentWidth(finalPercent);
      updateAttributes({ width: finalPercent });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Reset free position back to normal document flow
  const handleResetPosition = (
    newAlignment: 'center' | 'left' | 'right' | 'float-left' | 'float-right' = 'center'
  ) => {
    setPos({ x: 0, y: 0 });
    updateAttributes({
      isPinned: false,
      posX: 0,
      posY: 0,
      alignment: newAlignment,
    });
  };

  // Wrapper alignment classes
  const getAlignmentWrapperClasses = () => {
    if (isPinned) {
      return '';
    }
    switch (alignment) {
      case 'left':
        return 'flex justify-start my-4 clear-both';
      case 'right':
        return 'flex justify-end my-4 clear-both';
      case 'float-left':
        return 'float-left mr-6 mb-4 mt-2 clear-left';
      case 'float-right':
        return 'float-right ml-6 mb-4 mt-2 clear-right';
      case 'center':
      default:
        return 'flex justify-center my-4 clear-both';
    }
  };

  const showToolbar = selected || isHovered || isResizing || isDragging;

  return (
    <NodeViewWrapper
      className={`select-none transition-all ${getAlignmentWrapperClasses()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        isPinned
          ? {
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: currentWidth,
              zIndex: isDragging ? 50 : 25,
            }
          : undefined
      }
    >
      <div
        ref={containerRef}
        style={{ width: isPinned ? '100%' : currentWidth }}
        className={`relative group inline-block max-w-full rounded-2xl transition-all ${
          isDragging
            ? 'ring-2 ring-blue-400 shadow-2xl scale-[1.01] cursor-grabbing'
            : selected
            ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20'
            : isHovered
            ? 'ring-1 ring-slate-600/70 shadow-lg'
            : ''
        } ${isPinned ? 'backdrop-blur-sm bg-slate-900/20 shadow-2xl' : ''}`}
      >
        {/* Top Drag Bar (Header of Image for easy click & drag anywhere) */}
        {showToolbar && (
          <div
            onMouseDown={handleDragStart}
            title="Görseli serbestçe taşımak için buraya tıklayıp istediğiniz yere sürükleyin"
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white text-[11px] font-medium shadow-lg cursor-grab active:cursor-grabbing select-none backdrop-blur-sm border border-blue-400/30 transition"
            contentEditable={false}
          >
            <Move className="w-3 h-3" />
            <span>{isPinned ? '📌 Sabit Taşı' : 'Serbest Taşı'}</span>
          </div>
        )}

        {/* Pin Badge on top-right of image */}
        {isPinned && !isDragging && (
          <div
            title="Bu görsel sabitlendi (Enter'a basınca aşağı kaymaz)"
            className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-blue-600/90 text-white font-medium text-[10px] shadow-lg flex items-center gap-1 border border-blue-400/30 pointer-events-none"
          >
            <Pin className="w-3 h-3" />
            <span>Sabitlendi</span>
          </div>
        )}

        {/* Floating Controls Toolbar */}
        {showToolbar && (
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2.5 py-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
            contentEditable={false}
          >
            {/* PIN / UNPIN BUTTON */}
            <button
              type="button"
              onClick={handleTogglePin}
              title={
                isPinned
                  ? 'Sabitlemeyi kaldır (Normal satır akışına geri döndür)'
                  : 'Konumu Sabitle (Pin): Enter tuşuna bastıkça aşağı kaymaz, bu noktada sabit kalır'
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isPinned
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'hover:bg-slate-800 text-blue-400 hover:text-white border border-blue-500/40'
              }`}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <Pin className="w-3.5 h-3.5" />}
              <span>{isPinned ? 'Sabitlendi' : '📌 Sabitle'}</span>
            </button>

            {/* Drag Handle Button */}
            <div
              onMouseDown={handleDragStart}
              title="Serbest Taşı: Tıklayıp istediğiniz yere sürükleyip bırakın (otomatik sabitler)"
              className="p-1.5 hover:bg-slate-800 rounded cursor-grab active:cursor-grabbing text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <Move className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-medium hidden sm:inline">Taşı</span>
            </div>

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            {/* Alignment: Float Right (Side-by-side with text on right) */}
            <button
              type="button"
              onClick={() => handleResetPosition('float-right')}
              title="Metnin Sağına Al (Metinle Yan Yana)"
              className={`px-2 py-1 text-[11px] rounded transition flex items-center gap-1 ${
                alignment === 'float-right' && !isPinned
                  ? 'bg-blue-600/40 text-blue-300 border border-blue-500/50'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <AlignRight className="w-3 h-3 text-blue-400" />
              <span>Sağa Yasla</span>
            </button>

            {/* Alignment: Float Left (Side-by-side with text on left) */}
            <button
              type="button"
              onClick={() => handleResetPosition('float-left')}
              title="Metnin Soluna Al (Metinle Yan Yana)"
              className={`px-2 py-1 text-[11px] rounded transition flex items-center gap-1 ${
                alignment === 'float-left' && !isPinned
                  ? 'bg-blue-600/40 text-blue-300 border border-blue-500/50'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <AlignLeft className="w-3 h-3 text-blue-400" />
              <span>Sola Yasla</span>
            </button>

            {/* Alignment: Center Block */}
            <button
              type="button"
              onClick={() => handleResetPosition('center')}
              title="Ortala (Normal Satır)"
              className={`p-1.5 rounded transition ${
                alignment === 'center' && !isPinned
                  ? 'bg-blue-600/30 text-blue-400'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>

            {/* Reset / Unpin button */}
            {isPinned && (
              <button
                type="button"
                onClick={() => handleResetPosition('center')}
                title="Sabitlemeyi kaldır ve satır akışına geri al"
                className="p-1 hover:bg-amber-500/20 text-amber-400 rounded transition flex items-center gap-1 text-[10px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Sıfırla</span>
              </button>
            )}

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            {/* Quick Size Presets */}
            <button
              type="button"
              onClick={() => {
                setCurrentWidth('30%');
                updateAttributes({ width: '30%' });
              }}
              title="%30 Genişlik"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
                width === '30%' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              30%
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentWidth('50%');
                updateAttributes({ width: '50%' });
              }}
              title="%50 Genişlik"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
                width === '50%' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentWidth('75%');
                updateAttributes({ width: '75%' });
              }}
              title="%75 Genişlik"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
                width === '75%' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentWidth('100%');
                updateAttributes({ width: '100%' });
              }}
              title="Tam Genişlik (%100)"
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
                width === '100%' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              100%
            </button>

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            {/* Delete button */}
            <button
              type="button"
              onClick={deleteNode}
              title="Görseli Sil"
              className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Realtime Size Badge while resizing */}
        {isResizing && (
          <div className="absolute top-3 left-3 z-30 px-2 py-0.5 rounded-md bg-blue-600/90 text-white font-mono text-[11px] shadow-lg pointer-events-none">
            {currentWidth}
          </div>
        )}

        {/* Realtime Position Badge while dragging */}
        {isDragging && (
          <div className="absolute top-3 left-3 z-30 px-2.5 py-1 rounded-md bg-indigo-600/95 text-white font-mono text-[11px] shadow-xl pointer-events-none border border-indigo-400/40">
            📌 Sabit Konum: X: {pos.x}px | Y: {pos.y}px
          </div>
        )}

        {/* Image Display */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          className="w-full h-auto rounded-xl object-contain block shadow-md pointer-events-none border border-slate-700/60"
        />

        {/* Resize Handles (Visible when selected or hovered) */}
        {showToolbar && !isDragging && (
          <>
            {/* Bottom-Right Corner Handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 hover:bg-blue-400 border-2 border-white rounded-full cursor-se-resize z-20 shadow-md hover:scale-125 transition-transform"
              title="Boyutlandırmak için sürükleyin"
            />

            {/* Bottom-Left Corner Handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 hover:bg-blue-400 border-2 border-white rounded-full cursor-sw-resize z-20 shadow-md hover:scale-125 transition-transform"
              title="Boyutlandırmak için sürükleyin"
            />

            {/* Right-Edge Bar Handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'e')}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-10 bg-blue-500/70 hover:bg-blue-400 rounded-full cursor-e-resize z-20 -mr-1 shadow"
              title="Genişliği ayarlamak için çekin"
            />

            {/* Left-Edge Bar Handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'w')}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-10 bg-blue-500/70 hover:bg-blue-400 rounded-full cursor-w-resize z-20 -ml-1 shadow"
              title="Genişliği ayarlamak için çekin"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
