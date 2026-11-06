import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemo } from 'react';
import { useAutosave } from './useAutosave';
import { ApiError } from '../lib/api';

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('data değişince debounce süresi sonunda tek kayıt yapar', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ value }) => {
        const data = useMemo(() => ({ value }), [value]);
        return useAutosave({ data, onSave, delay: 1000 });
      },
      { initialProps: { value: 1 } }
    );

    rerender({ value: 2 });
    rerender({ value: 3 }); // debounce: yalnızca son değer kaydedilmeli

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ value: 3 });
    expect(result.current.saveStatus).toBe('saved');
  });

  it('unmount sırasında bekleyen düzenlemeyi flush eder', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { rerender, unmount } = renderHook(
      ({ value }) => useAutosave({ data: { value }, onSave, delay: 5000 }),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    // Debounce süresi dolmadan ayrıl
    unmount();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ value: 'b' });
  });

  it('409 conflictte kurtarma başarılıysa sürümü tazeleyip bir kez daha dener', async () => {
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('sürüm uyuşmazlığı', 409))
      .mockResolvedValueOnce(undefined);
    const onConflictRecovery = vi.fn().mockResolvedValue(true);

    const { result } = renderHook(() => {
      const data = useMemo(() => ({ v: 1 }), []);
      return useAutosave({ data, onSave, delay: 100, onConflictRecovery });
    });

    await act(async () => {
      await result.current.saveNow();
    });

    expect(onConflictRecovery).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.conflictNotice).toContain('güncellendi');
  });

  it('kurtarma başarısızsa hata durumu kalır ve tekrar denemez', async () => {
    const onSave = vi
      .fn()
      .mockRejectedValue(new ApiError('sürüm uyuşmazlığı', 409));
    const onConflictRecovery = vi.fn().mockResolvedValue(false);

    const { result } = renderHook(() => {
      const data = useMemo(() => ({ v: 1 }), []);
      return useAutosave({ data, onSave, delay: 100, onConflictRecovery });
    });

    await act(async () => {
      await result.current.saveNow();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onConflictRecovery).toHaveBeenCalledTimes(1);
    expect(result.current.saveStatus).toBe('error');
    expect(result.current.errorMessage).toContain('uyuşmazlığı');
  });

  it('kurtarma tanımsızysa 409 düz hataya düşer (geriye dönük uyum)', async () => {
    const onSave = vi
      .fn()
      .mockRejectedValue(new ApiError('çakışma', 409));

    const { result } = renderHook(() => {
      const data = useMemo(() => ({ v: 1 }), []);
      return useAutosave({ data, onSave, delay: 100 });
    });

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.saveStatus).toBe('error');
  });
});
