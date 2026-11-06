import { ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { ImageNodeView } from './ImageNodeView';

/**
 * Optimizes pasted/dropped images: reads as DataURL, resizes giant screenshots to max 1600px width/height
 * to ensure snappy saves and keep base64 payload light.
 */
const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Dosya bir görsel değil'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      // If file is already reasonably small (< 600KB), keep directly
      if (file.size < 600 * 1024) {
        return resolve(result);
      }

      const img = new window.Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(result);
        }
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';
        const compressed = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Custom Image extension that adds width & alignment attributes,
 * makes images draggable in the document, and uses ImageNodeView for interactive resizing and positioning.
 */
const CustomImage = Image.extend({
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) => element.style.width || element.getAttribute('width') || '100%',
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            style: `width: ${attributes.width}`,
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-alignment') || 'center',
        renderHTML: (attributes) => {
          return {
            'data-alignment': attributes.alignment || 'center',
          };
        },
      },
      posX: {
        default: 0,
        parseHTML: (element) => parseFloat(element.getAttribute('data-pos-x') || '0'),
        renderHTML: (attributes) => {
          return {
            'data-pos-x': attributes.posX || 0,
          };
        },
      },
      posY: {
        default: 0,
        parseHTML: (element) => parseFloat(element.getAttribute('data-pos-y') || '0'),
        renderHTML: (attributes) => {
          return {
            'data-pos-y': attributes.posY || 0,
          };
        },
      },
      isPinned: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-is-pinned') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-is-pinned': attributes.isPinned ? 'true' : 'false',
          };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

export { processImageFile, CustomImage };
