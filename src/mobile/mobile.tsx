import { useState } from 'react';
import type { EmanedApp } from '../hooks/use-emaned';
import { useKeys } from '../hooks/use-keys';
import { TopBar } from './top-bar/top-bar';
import { CatBar } from './cat-bar/cat-bar';
import { HomeStage } from './home-stage/home-stage';
import { EmptyStage } from './empty-stage/empty-stage';
import { ZeroStage } from './zero-stage/zero-stage';
import { Generator } from './generator/generator';
import { BottomNav, type SheetId } from './bottom-nav/bottom-nav';
import { StickyGenerate } from './sticky-generate/sticky-generate';
import { Sheet } from './sheet/sheet';
import { FilterSheet } from './sheet/filter-sheet';
import { HistorySheet } from './sheet/history-sheet';
import { CaseSheet } from './sheet/case-sheet';
import { AboutSheet } from './sheet/about-sheet';
import { FavsSheet } from './sheet/favs-sheet';
import { ShortcutsSheet } from './sheet/shortcuts-sheet';
import styles from './mobile.module.css';

export function Mobile({ app }: { app: EmanedApp }) {
  const [sheet, setSheet] = useState<SheetId>(null);
  const [copied, setCopied] = useState(false);

  useKeys(app, {
    openShortcuts: () => setSheet('shortcuts'),
    openFavs: () => setSheet('favs'),
    closeOverlays: () => setSheet(null),
  });

  const doCopy = () => {
    app.copyCurrent();
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const w = app.current;
  const zero = app.pool.length === 0;

  return (
    <div className={styles.app}>
      <TopBar app={app} onOpenFavs={() => setSheet('favs')} />
      <CatBar app={app} />

      {app.page === 'home' && !w ? (
        <HomeStage app={app} />
      ) : zero ? (
        <ZeroStage app={app} />
      ) : !w ? (
        <EmptyStage app={app} />
      ) : (
        <Generator app={app} w={w} onCopy={doCopy} />
      )}

      <BottomNav app={app} onOpen={setSheet} />

      {app.page !== 'home' && <StickyGenerate app={app} copied={copied} onCopy={doCopy} />}

      {sheet && (
        <Sheet title={sheetTitle(sheet)} onClose={() => setSheet(null)}>
          {sheet === 'filter' && <FilterSheet app={app} onClose={() => setSheet(null)} />}
          {sheet === 'history' && (
            <HistorySheet
              app={app}
              onPick={(h) => {
                app.setCurrent(h);
                setSheet(null);
              }}
            />
          )}
          {sheet === 'case' && <CaseSheet app={app} />}
          {sheet === 'about' && <AboutSheet />}
          {sheet === 'favs' && (
            <FavsSheet
              app={app}
              onPick={(f) => {
                app.setCurrent(f);
                setSheet(null);
              }}
            />
          )}
          {sheet === 'shortcuts' && <ShortcutsSheet />}
        </Sheet>
      )}
    </div>
  );
}

function sheetTitle(s: Exclude<SheetId, null>): string {
  return {
    filter: 'Filters',
    history: 'History',
    case: 'Casing',
    about: 'About emaned',
    favs: 'Favorites',
    shortcuts: 'Shortcuts',
  }[s];
}
