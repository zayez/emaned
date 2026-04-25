import { useState } from 'react';
import type { EmanedApp } from '../hooks/use-emaned';
import { useKeys } from '../hooks/use-keys';
import { TopBar } from './top-bar/top-bar';
import { CategoryRail } from './category-rail/category-rail';
import { FilterRail } from './filter-rail/filter-rail';
import { HomeStage } from './home-stage/home-stage';
import { GeneratorStage } from './generator-stage/generator-stage';
import { HistoryStrip } from './history-strip/history-strip';
import { FavoritesDrawer } from './favorites-drawer/favorites-drawer';
import { Modal } from './modal/modal';
import { ShortcutsContent } from './modal/shortcuts-content';
import { AboutContent } from './modal/about-content';
import styles from './desktop.module.css';

export function Desktop({ app }: { app: EmanedApp }) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [favsOpen, setFavsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useKeys(app, {
    openShortcuts: () => setShortcutsOpen(true),
    openFavs: () => setFavsOpen(true),
    closeOverlays: () => {
      setShortcutsOpen(false);
      setFavsOpen(false);
      setAboutOpen(false);
    },
  });

  const doCopy = () => {
    app.copyCurrent();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.app}>
      <TopBar
        app={app}
        onFavs={() => setFavsOpen(true)}
        onAbout={() => setAboutOpen(true)}
        onHelp={() => setShortcutsOpen(true)}
      />

      <main className={styles.main}>
        <CategoryRail app={app} />
        {app.page === 'home' ? <HomeStage app={app} /> : <GeneratorStage app={app} copied={copied} onCopy={doCopy} />}
        <FilterRail app={app} />
      </main>

      <HistoryStrip app={app} />

      {favsOpen && <FavoritesDrawer app={app} onClose={() => setFavsOpen(false)} />}
      {shortcutsOpen && (
        <Modal onClose={() => setShortcutsOpen(false)} title="Shortcuts">
          <ShortcutsContent />
        </Modal>
      )}
      {aboutOpen && (
        <Modal onClose={() => setAboutOpen(false)} title="About emaned">
          <AboutContent />
        </Modal>
      )}
    </div>
  );
}
