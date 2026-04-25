import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterPool, totalFor } from '../domain/filter';
import { formatCase } from '../domain/casing';
import { pickOne } from '../domain/generate';
import { createPersistence } from '../domain/persistence';
import type {
  Casing,
  CategorySelector,
  Era,
  Specimen,
  Vibe,
} from '../domain/types';

const HISTORY_MAX = 10;
const persist = createPersistence();

export type Page = 'home' | 'generator';

export interface EmanedApp {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  page: Page;
  setPage: (p: Page) => void;
  cat: CategorySelector;
  setCat: (c: CategorySelector) => void;
  era: Era | null;
  setEra: (e: Era | null) => void;
  vibes: Vibe[];
  toggleVibe: (v: Vibe) => void;
  maxSyl: number | null;
  setMaxSyl: (n: number | null) => void;
  casing: Casing;
  setCasing: (c: Casing) => void;
  current: Specimen | null;
  setCurrent: (s: Specimen | null) => void;
  history: Specimen[];
  favs: Specimen[];
  pool: Specimen[];
  total: number;
  generate: () => void;
  clearFilters: () => void;
  toggleFav: (w: Specimen | null) => void;
  isFav: (w: Specimen | null) => boolean;
  copyCurrent: () => void;
  clearCurrent: () => void;
}

export function useEmaned(): EmanedApp {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    persist.get<'light' | 'dark'>('theme', 'light'),
  );
  const [page, setPage] = useState<Page>(() => persist.get<Page>('page', 'home'));
  const [cat, setCat] = useState<CategorySelector>(() =>
    persist.get<CategorySelector>('cat', 'all'),
  );
  const [era, setEra] = useState<Era | null>(() => persist.get<Era | null>('era', null));
  const [vibes, setVibes] = useState<Vibe[]>(() => persist.get<Vibe[]>('vibes', []));
  const [maxSyl, setMaxSyl] = useState<number | null>(() =>
    persist.get<number | null>('maxSyl', null),
  );
  const [casing, setCasing] = useState<Casing>(() => persist.get<Casing>('casing', 'upper'));
  const [current, setCurrent] = useState<Specimen | null>(null);
  const [history, setHistory] = useState<Specimen[]>(() =>
    persist.get<Specimen[]>('history', []),
  );
  const [favs, setFavs] = useState<Specimen[]>(() => persist.get<Specimen[]>('favs', []));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persist.set('theme', theme);
  }, [theme]);
  useEffect(() => {
    persist.set('page', page);
  }, [page]);
  useEffect(() => {
    persist.set('cat', cat);
  }, [cat]);
  useEffect(() => {
    persist.set('era', era);
  }, [era]);
  useEffect(() => {
    persist.set('vibes', vibes);
  }, [vibes]);
  useEffect(() => {
    persist.set('maxSyl', maxSyl);
  }, [maxSyl]);
  useEffect(() => {
    persist.set('casing', casing);
  }, [casing]);
  useEffect(() => {
    persist.set('history', history);
  }, [history]);
  useEffect(() => {
    persist.set('favs', favs);
  }, [favs]);

  const pool = useMemo(
    () => filterPool(cat, { era, vibes, maxSyl }),
    [cat, era, vibes, maxSyl],
  );
  const total = useMemo(() => totalFor(cat), [cat]);

  const generate = useCallback(() => {
    if (!pool.length) return;
    setCurrent((prev) => {
      if (prev) {
        setHistory((h) => [prev, ...h.filter((x) => x.word !== prev.word)].slice(0, HISTORY_MAX));
      }
      return pickOne(pool);
    });
    setPage('generator');
  }, [pool]);

  const toggleVibe = useCallback(
    (v: Vibe) =>
      setVibes((vs) => (vs.includes(v) ? vs.filter((x) => x !== v) : [...vs, v])),
    [],
  );

  const clearFilters = useCallback(() => {
    setEra(null);
    setVibes([]);
    setMaxSyl(null);
  }, []);

  const toggleFav = useCallback((w: Specimen | null) => {
    if (!w) return;
    setFavs((fs) => (fs.some((f) => f.word === w.word) ? fs.filter((f) => f.word !== w.word) : [w, ...fs]));
  }, []);

  const isFav = useCallback(
    (w: Specimen | null) => !!w && favs.some((f) => f.word === w.word),
    [favs],
  );

  const copyCurrent = useCallback(() => {
    if (!current) return;
    navigator.clipboard?.writeText(formatCase(current.word, casing));
  }, [current, casing]);

  const clearCurrent = useCallback(() => setCurrent(null), []);

  return {
    theme,
    setTheme,
    page,
    setPage,
    cat,
    setCat,
    era,
    setEra,
    vibes,
    toggleVibe,
    maxSyl,
    setMaxSyl,
    casing,
    setCasing,
    current,
    setCurrent,
    history,
    favs,
    pool,
    total,
    generate,
    clearFilters,
    toggleFav,
    isFav,
    copyCurrent,
    clearCurrent,
  };
}
