import { useEffect, useRef } from 'react';

/**
 * Modal panelleri için temel erişilebilirlik davranışı:
 * - Açılışta panel odaklanır, kapanışta önceki odağa dönülür
 * - Escape ile kapanır
 * - Tab / Shift+Tab odağı panel içinde hapseder (focus-trap)
 *
 * Kullanım: dönen ref'i panel div'ine verin; panele ayrıca
 * role="dialog" aria-modal="true" tabIndex={-1} ekleyin.
 */
export function useDialogA11y<T extends HTMLElement>(onClose: () => void, active: boolean = true) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    el?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && el) {
        const focusables = Array.from(
          el.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}
