import { useState, useRef, useEffect, Fragment, type CSSProperties, type ReactNode } from 'react';
import type { EmanedApp } from '../hooks/use-emaned';
import { useKeys } from '../hooks/use-keys';
import { useAutoFit } from '../hooks/use-auto-fit';
import { Icon } from '../components/icon';
import { PoolBlock } from '../components/pool-block';
import { specimenRows } from '../components/specimen-meta';
import { CATS, CASE_CHOICES } from '../constants';
import { getTotal } from '../domain/corpus';
import { formatCase } from '../domain/casing';
import { ERAS, VIBES, type Specimen } from '../domain/types';
import shared from '../shared.module.css';
import styles from './desktop.module.css';
import { cx } from '../cx';

const TOTAL = getTotal();

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

interface TopBarProps {
  app: EmanedApp;
  onFavs: () => void;
  onAbout: () => void;
  onHelp: () => void;
}

function TopBar({ app, onFavs, onAbout, onHelp }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.brandGroup}>
        <button onClick={() => app.setPage('home')} className={styles.brandBtn}>
          <span className={styles.brand}>
            emaned<span className={styles.accentDot}>.</span>
          </span>
        </button>
        <span className={cx(shared.mono, styles.subtitle)}>A CODENAME GENERATOR</span>
      </div>
      <nav className={cx(shared.mono, styles.topNav)}>
        <button onClick={onFavs} className={styles.navBtn}>
          FAVORITES <span className={styles.navCount}>{app.favs.length.toString().padStart(2, '0')}</span>
        </button>
        <button onClick={onAbout} className={styles.navBtn}>
          ABOUT
        </button>
      </nav>
      <div className={styles.topActions}>
        <button className={shared.iconBtn} title="Shortcuts (?)" onClick={onHelp}>
          <Icon name="help" size={14} />
        </button>
        <button
          className={shared.iconBtn}
          title="Theme"
          onClick={() => app.setTheme(app.theme === 'dark' ? 'light' : 'dark')}
        >
          <Icon name={app.theme === 'dark' ? 'sun' : 'moon'} size={14} />
        </button>
      </div>
    </header>
  );
}

function CategoryRail({ app }: { app: EmanedApp }) {
  return (
    <aside className={styles.categoryRail}>
      <div className={cx(shared.mono, styles.railLabel)}>CATEGORY</div>
      {CATS.map((c) => {
        const on = app.cat === c.id;
        return (
          <button
            key={c.id}
            onClick={() => app.setCat(c.id)}
            className={cx(styles.catBtn, on && styles.on)}
          >
            <span className={styles.catDot} />
            {c.label}
            {c.id === 'all' && <span className={cx(shared.mono, styles.catCount)}>{TOTAL}</span>}
          </button>
        );
      })}
      <div className={cx(shared.mono, styles.railFooter)}>
        <div className={styles.railFooterText}>
          CURATED WORDBANK
          <br />
          FOR NAMING THINGS.
        </div>
      </div>
    </aside>
  );
}

function FilterRail({ app }: { app: EmanedApp }) {
  const activeCount = (app.era ? 1 : 0) + app.vibes.length + (app.maxSyl ? 1 : 0);
  return (
    <aside className={styles.filterRail}>
      <div className={styles.filterHeader}>
        <div className={cx(shared.mono, styles.filterLabel)}>
          FILTERS {activeCount ? <span className={styles.filterCountActive}>· {activeCount}</span> : ''}
        </div>
        {activeCount > 0 && (
          <button onClick={app.clearFilters} className={cx(shared.mono, styles.clearBtn)}>
            CLEAR
          </button>
        )}
      </div>

      <div>
        <div className={cx(shared.mono, styles.sectionLabel)}>VIBE</div>
        <div className={styles.vibeRow}>
          {VIBES.map((v) => (
            <button
              key={v}
              onClick={() => app.toggleVibe(v)}
              className={cx(shared.chip, app.vibes.includes(v) && shared.accentOn)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={cx(shared.mono, styles.sectionLabel)}>ERA</div>
        <div className={styles.eraRow}>
          <button onClick={() => app.setEra(null)} className={cx(shared.chip, !app.era && shared.on)}>
            any
          </button>
          {ERAS.map((e) => (
            <button
              key={e}
              onClick={() => app.setEra(app.era === e ? null : e)}
              className={cx(shared.chip, app.era === e && shared.on)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={cx(shared.mono, styles.sylHeader)}>
          <span>SYLLABLES</span>
          <span className={styles.sylValue} data-active={app.maxSyl ? 'true' : 'false'}>
            {app.maxSyl ? `≤ ${app.maxSyl}` : 'any'}
          </span>
        </div>
        <div className={styles.sylRow}>
          <button
            onClick={() => app.setMaxSyl(null)}
            className={cx(shared.chip, styles.sylChip, !app.maxSyl && shared.on)}
          >
            any
          </button>
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => app.setMaxSyl(app.maxSyl === n ? null : n)}
              className={cx(shared.chip, styles.sylChip, app.maxSyl === n && shared.on)}
            >
              ≤{n}
            </button>
          ))}
        </div>
      </div>

      <div className={cx(shared.mono, styles.shortcutsHints)}>
        <div className={styles.shortcutsHintsText}>
          SPACE · GENERATE
          <br />
          C · COPY &nbsp;&nbsp; F · FAVORITE
          <br />? · SHORTCUTS
        </div>
      </div>
    </aside>
  );
}

function HomeStage({ app }: { app: EmanedApp }) {
  const stageRef = useRef<HTMLElement>(null);
  const [avail, setAvail] = useState(820);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(Math.max(320, el.clientWidth - 48)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [heroRef, heroSize] = useAutoFit<HTMLHeadingElement>([avail], avail, 260, 80);

  return (
    <section ref={stageRef} className={styles.homeStage}>
      <div className={cx(shared.mono, styles.eyebrow)}>— A CODENAME GENERATOR —</div>

      <h1
        ref={heroRef}
        className={cx(shared.hero, styles.homeHero)}
        style={{ '--hero-size': `${heroSize}px` } as CSSProperties}
      >
        emaned<span className={styles.accentDot}>.</span>
      </h1>

      <p className={styles.intro}>
        Draw a single evocative word from <span className={styles.fg}>{TOTAL} specimens</span> across five taxonomies
        — Intel processors, mountains, celestial bodies, gemstones, and Greek mythology. Filter by{' '}
        <em className={styles.em}>vibe</em>, <em className={styles.em}>era</em>, or <em className={styles.em}>length</em>.
        Keep what you like.
      </p>

      <button className={cx(shared.generate, styles.homeGenerate)} onClick={app.generate}>
        Generate a codename
        <span className={cx(shared.mono, styles.spaceHint)}>SPACE</span>
      </button>

      <div className={styles.browseRow}>
        <span className={cx(shared.mono, styles.browseLabel)}>OR BROWSE →</span>
        <div className={styles.browseChips}>
          {CATS.slice(1).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                app.setCat(c.id);
                app.generate();
              }}
              className={cx(shared.chip, styles.browseChip)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

interface GeneratorStageProps {
  app: EmanedApp;
  copied: boolean;
  onCopy: () => void;
}

function GeneratorStage({ app, copied, onCopy }: GeneratorStageProps) {
  const w = app.current;
  const zero = app.pool.length === 0;

  const heroBoxRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState<number>(800);
  useEffect(() => {
    const el = heroBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(Math.max(320, el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [heroRef, heroSize] = useAutoFit<HTMLButtonElement>(
    [w?.word, app.casing, avail],
    avail,
    300,
    48,
  );

  if (!w && !zero) {
    return (
      <section className={styles.poolReadyStage}>
        <div className={cx(shared.mono, styles.poolReadyEyebrow)}>
          POOL <span className={styles.poolReadyCount}>{app.pool.length}</span> ready
        </div>
        <button className={cx(shared.generate, styles.bigGenerate)} onClick={app.generate}>
          Generate <span className={cx(shared.mono, styles.spaceHint)}>SPACE</span>
        </button>
      </section>
    );
  }
  if (zero) return <ZeroStage app={app} />;

  const displayed = formatCase(w!.word, app.casing);
  return (
    <section className={styles.generatorStage}>
      <div className={styles.poolBlockSlot}>
        <PoolBlock app={app} big />
      </div>
      <div className={cx(shared.mono, styles.specimenLabel)}>SPECIMEN · {w!._cat.toUpperCase()}</div>

      <div ref={heroBoxRef} className={styles.heroBox}>
        <button
          onClick={onCopy}
          title="Click to copy"
          ref={heroRef}
          key={w!.word + app.casing}
          className={cx(shared.reveal, styles.specimenHero)}
          style={{ '--hero-size': `${heroSize}px` } as CSSProperties}
        >
          {displayed}
        </button>
        <div className={cx(shared.mono, styles.origin)}>{w!.origin}</div>
      </div>

      <SpecimenCard w={w!} app={app} copied={copied} onCopy={onCopy} />
    </section>
  );
}

interface SpecimenCardProps {
  w: Specimen;
  app: EmanedApp;
  copied: boolean;
  onCopy: () => void;
}

function SpecimenCard({ w, app, copied, onCopy }: SpecimenCardProps) {
  const rows = specimenRows(w);
  const cols = Math.max(5, rows.length);
  return (
    <div>
      <div
        className={styles.specimenGrid}
        style={{ '--row-count': cols } as CSSProperties}
      >
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className={cx(shared.mono, styles.rowKey)}>{k}</div>
            <div className={styles.rowValue}>{v}</div>
          </div>
        ))}
      </div>
      <div className={styles.actionsRow}>
        <div className={styles.actionsLeft}>
          <button className={shared.iconBtn} title="Copy (C)" onClick={onCopy}>
            <Icon name={copied ? 'check' : 'copy'} size={14} />
          </button>
          <button
            className={cx(shared.iconBtn, app.isFav(w) && shared.on)}
            title="Favorite (F)"
            onClick={() => app.toggleFav(w)}
          >
            <Icon name="star" size={14} />
          </button>
          <span className={cx(shared.mono, styles.caseLabel)}>CASE</span>
          {CASE_CHOICES.map((c) => (
            <button
              key={c.id}
              onClick={() => app.setCasing(c.id)}
              className={cx(shared.chip, styles.caseChip, app.casing === c.id && shared.on)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button className={shared.generate} onClick={app.generate}>
          Generate <span className={cx(shared.mono, styles.spaceHint)}>SPACE</span>
        </button>
      </div>
    </div>
  );
}

function ZeroStage({ app }: { app: EmanedApp }) {
  return (
    <section className={styles.zeroStage}>
      <div className={styles.poolBlockSlot}>
        <PoolBlock app={app} big />
      </div>
      <div className={cx(shared.mono, styles.zeroEyebrow)}>POOL EMPTY</div>
      <div className={cx(shared.hero, styles.zeroNum)}>0</div>
      <div className={cx(shared.mono, styles.zeroNote)}>no specimens match. loosen a filter.</div>
      <button className={cx(shared.generate, styles.zeroGenerate)} disabled>
        Generate
      </button>
      <button onClick={app.clearFilters} className={cx(shared.chip, styles.zeroClear)}>
        Clear filters
      </button>
    </section>
  );
}

function HistoryStrip({ app }: { app: EmanedApp }) {
  return (
    <footer className={styles.history}>
      <span className={cx(shared.mono, styles.historyLabel)}>HISTORY</span>
      {app.history.length === 0 ? (
        <span className={cx(shared.mono, styles.historyEmpty)}>— the strip fills as you draw.</span>
      ) : (
        app.history.map((h, i) => (
          <button
            key={h.word + i}
            onClick={() => app.setCurrent(h)}
            className={cx(shared.mono, styles.historyItem)}
          >
            {h.word}
          </button>
        ))
      )}
    </footer>
  );
}

function FavoritesDrawer({ app, onClose }: { app: EmanedApp; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} className={cx(shared.fadeIn, styles.scrim)} />
      <aside className={cx(shared.drawerEnter, styles.favsDrawer)}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={cx(shared.mono, styles.drawerEyebrow)}>FAVORITES</div>
            <div className={styles.drawerCount}>{app.favs.length} saved</div>
          </div>
          <button className={shared.iconBtn} onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
        <div className={styles.favsList}>
          {app.favs.length === 0 ? (
            <div className={cx(shared.mono, styles.favsEmpty)}>
              <div className={styles.favsEmptyText}>
                nothing saved yet.
                <br />
                press <span className={styles.favsEmptyKey}>F</span> when you land on one you like.
              </div>
            </div>
          ) : (
            app.favs.map((f) => (
              <div key={f.word} className={styles.favItem}>
                <div className={styles.favItemMain}>
                  <div className={styles.favWord}>{f.word.toUpperCase()}</div>
                  <div className={cx(shared.mono, styles.favCat)}>{f._cat?.toUpperCase()}</div>
                </div>
                <button
                  className={cx(shared.iconBtn, shared.on, styles.favStarBtn)}
                  onClick={() => app.toggleFav(f)}
                >
                  <Icon name="star" size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className={cx(shared.mono, styles.drawerFooter)}>ESC TO CLOSE · STORED LOCALLY</div>
      </aside>
    </>
  );
}

function Modal({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return (
    <div className={cx(shared.fadeIn, styles.modalScrim)} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <div className={cx(shared.mono, styles.modalTitle)}>{title.toUpperCase()}</div>
          <button className={shared.iconBtn} onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ShortcutsContent() {
  const keys: Array<[string, string]> = [
    ['Space', 'Generate'],
    ['C', 'Copy to clipboard'],
    ['F', 'Toggle favorite'],
    ['?', 'This panel'],
    ['Esc', 'Close overlays'],
  ];
  return (
    <div>
      <div className={styles.shortcutsGrid}>
        {keys.map(([k, v]) => (
          <Fragment key={k}>
            <kbd className={cx(shared.mono, styles.kbd)}>{k}</kbd>
            <span className={styles.kbdLabel}>{v}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function AboutContent() {
  return (
    <div className={styles.about}>
      <p className={styles.aboutPara}>
        emaned is a static tool for drawing a single evocative word from curated taxonomies. {TOTAL} specimens across
        five categories, cross-filterable by vibe, era, and length.
      </p>
      <p className={styles.aboutMuted}>
        No accounts. No sync. Favorites and history live on this device only.
      </p>
      <div className={cx(shared.mono, styles.aboutLinks)}>
        <a
          href="https://github.com/zayez/emaned"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.aboutLink}
        >
          GitHub ↗
        </a>
        <a
          href="https://github.com/zayez/emaned/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.aboutLink}
        >
          MIT License ↗
        </a>
      </div>
      <p className={cx(shared.mono, styles.aboutVersion)}>v1 · mmxxvi</p>
    </div>
  );
}
