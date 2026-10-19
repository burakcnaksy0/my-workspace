import { useState, useEffect, useRef, useCallback } from 'react';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 1500,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const dataRef = useRef<T>(data);
  const onSaveRef = useRef(onSave);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Update refs on render
  dataRef.current = data;
  onSaveRef.current = onSave;

  const executeSave = useCallback(async () => {
    if (!enabled) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      await onSaveRef.current(dataRef.current);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (err: unknown) {
      setSaveStatus('error');
      const msg = err instanceof Error ? err.message : 'Kaydetme sırasında bir hata oluştu.';
      setErrorMessage(msg);
    }
  }, [enabled]);

  // Track data changes and trigger debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    setSaveStatus('dirty');
    setErrorMessage(null);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      executeSave();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, delay, enabled, executeSave]);

  // Global Ctrl+S / Cmd+S shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        executeSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeSave]);

  return {
    saveStatus,
    errorMessage,
    lastSavedAt,
    saveNow: executeSave,
  };
}
