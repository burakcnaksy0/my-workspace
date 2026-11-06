import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDialogA11y } from './useDialogA11y';

describe('useDialogA11y', () => {
  it('Escape ile onClose çağırır', () => {
    const onClose = vi.fn();
    renderHook(() => useDialogA11y(onClose, true));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('active=false iken Escape onClose çağırmaz', () => {
    const onClose = vi.fn();
    renderHook(() => useDialogA11y(onClose, false));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
