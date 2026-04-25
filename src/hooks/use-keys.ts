import { useEffect } from 'react';
import type { EmanedApp } from './use-emaned';

interface KeyHandlers {
  openShortcuts?: () => void;
  openFavs?: () => void;
  closeOverlays?: () => void;
}

export function useKeys(app: EmanedApp, handlers: KeyHandlers): void {
  const { openShortcuts, closeOverlays } = handlers;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

      if (e.key === 'Escape') closeOverlays?.();
      if (e.key === ' ') {
        e.preventDefault();
        app.generate();
      }
      if (e.key?.toLowerCase() === 'c' && app.current) app.copyCurrent();
      if (e.key?.toLowerCase() === 'f' && app.current) app.toggleFav(app.current);
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        openShortcuts?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [app, openShortcuts, closeOverlays]);
}
