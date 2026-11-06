import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiError } from '../lib/api';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  /**
   * 409 Conflict algılandığında çağrılır. Sürüm gibi bayat state'i sunucudan
   * yenileyip kurtarma başarısını dönmelidir. true dönerse kayıt BİR kez daha
   * denenir; böylece kullanıcı aynı bayat sürümü sonsuza kadar tekrar tekrar
   * göndermez.
   */
  onConflictRecovery?: () => Promise<boolean>;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 1200,
  enabled = true,
  onConflictRecovery,
}: UseAutosaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const dataRef = useRef<T>(data);
  const onSaveRef = useRef(onSave);
  const onConflictRecoveryRef = useRef(onConflictRecovery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const isDirtyRef = useRef(false);
  /** Zamanlanmış ama henüz ateşlenmemiş bir kayıt var mı? (unmount flush'ı için) */
  const pendingRef = useRef(false);
  const isFirstRender = useRef(true);

  // Always keep latest refs
  dataRef.current = data;
  onSaveRef.current = onSave;
  onConflictRecoveryRef.current = onConflictRecovery;

  const executeSave = useCallback(async () => {
    if (!enabled) return;

    if (isSavingRef.current) {
      isDirtyRef.current = true;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = false;

    isSavingRef.current = true;
    isDirtyRef.current = false;
    setSaveStatus('saving');
    setErrorMessage(null);

    let attemptedRecovery = false;
    let recoveredThisRun = false;

    // Döngü: başarılı olana, ya da kurtarılabilir conflict kalmayana kadar dene.
    // Kurtarma sonrası onSave kendi tazelenmiş sürümünü okuyacağı için tek tekrar yeterlidir.
    for (;;) {
      try {
        await onSaveRef.current(dataRef.current);
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        if (!recoveredThisRun) {
          // Kurtarmasız temiz kayıt: eski çakışma bildirimini kaldır
          setConflictNotice(null);
        }
        break;
      } catch (err: unknown) {
        const isConflict = err instanceof ApiError && err.status === 409;
        if (isConflict && !attemptedRecovery && onConflictRecoveryRef.current) {
          attemptedRecovery = true;
          let recovered = false;
          try {
            recovered = await onConflictRecoveryRef.current();
          } catch {
            recovered = false;
          }
          if (recovered) {
            recoveredThisRun = true;
            setConflictNotice(
              'Bu içerik başka bir yerde güncellendi. Sunucudaki sürüm alındı; ' +
              'sizdeki düzenlemeler korunarak yeniden kaydediliyor.'
            );
            continue;
          }
        }
        setSaveStatus('error');
        const msg = err instanceof Error ? err.message : 'Kaydetme sırasında bir hata oluştu.';
        setErrorMessage(msg);
        break;
      }
    }

    isSavingRef.current = false;
    if (isDirtyRef.current) {
      isDirtyRef.current = false;
      pendingRef.current = true;
      timerRef.current = setTimeout(executeSave, 400);
    }
  }, [enabled]);

  const executeSaveRef = useRef(executeSave);
  executeSaveRef.current = executeSave;

  // Debounced trigger function for imperative calls (e.g., Tiptap editor update)
  const triggerDebouncedSave = useCallback(() => {
    if (!enabled) return;
    setSaveStatus('dirty');
    setErrorMessage(null);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    pendingRef.current = true;
    timerRef.current = setTimeout(() => {
      pendingRef.current = false;
      executeSave();
    }, delay);
  }, [delay, enabled, executeSave]);

  // Track data changes and trigger debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    triggerDebouncedSave();
  }, [data, triggerDebouncedSave]);

  // Unmount: zamanlanmış ama henüz yazılmamış düzenlemeleri flushed et
  // (fire-and-forget) — aksi halde son ~delay ms'lik değişiklikler kaybolur.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (pendingRef.current || isDirtyRef.current) {
        pendingRef.current = false;
        isDirtyRef.current = false;
        void executeSaveRef.current();
      }
    };
  }, []);

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

  const dismissConflictNotice = useCallback(() => setConflictNotice(null), []);

  return {
    saveStatus,
    errorMessage,
    conflictNotice,
    dismissConflictNotice,
    lastSavedAt,
    saveNow: executeSave,
    triggerAutosave: triggerDebouncedSave,
  };
}
