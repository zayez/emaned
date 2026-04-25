import { useLayoutEffect, useRef, useState, type DependencyList } from 'react';

export function useAutoFit<T extends HTMLElement = HTMLElement>(
  deps: DependencyList,
  avail: number,
  target: number,
  min = 36,
): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<number>(target);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      setSize(target);
      return;
    }
    const run = () => {
      el.style.fontSize = target + 'px';
      const w = el.scrollWidth;
      if (w <= avail) {
        setSize(target);
        return;
      }
      const next = Math.max(min, Math.floor((target * (avail / w)) * 0.99));
      el.style.fontSize = next + 'px';
      setSize(next);
    };
    run();
    if (document.fonts?.ready) {
      document.fonts.ready.then(run).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [ref, size];
}
