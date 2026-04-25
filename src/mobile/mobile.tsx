import { useEffect, useRef, useState, Fragment, type CSSProperties, type ReactNode } from 'react';
import type { EmanedApp } from '../hooks/use-emaned';
import { useKeys } from '../hooks/use-keys';
import { useAutoFit } from '../hooks/use-auto-fit';
import { Icon, type IconName } from '../components/icon';
import { specimenRows } from '../components/specimen-meta';
import { CATS, CASE_CHOICES } from '../constants';
import { getTotal } from '../domain/corpus';
import { formatCase } from '../domain/casing';
import { ERAS, VIBES, type Specimen } from '../domain/types';
import shared from '../shared.module.css';
import styles from './mobile.module.css';
import { cx } from '../cx';

const TOTAL = getTotal();

type SheetId = 'filter' | 'history' | 'case' | 'about' | 'favs' | 'shortcuts' | null;

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
      <header className={styles.topBar}>
        <button onClick={() => app.setPage('home')} className={styles.brandBtn}>
          <span className={styles.brand}>
            emaned<span className={styles.accentDot}>.</span>
          </span>
        </button>
        <div className={styles.topActions}>
          <button className={shared.iconBtn} onClick={() => setSheet('favs')} title="Favorites">
            <Icon name="star" size={13} />
          </button>
          <button
            className={shared.iconBtn}
            onClick={() => app.setTheme(app.theme === 'dark' ? 'light' : 'dark')}
            title="Theme"
          >
            <Icon name={app.theme === 'dark' ? 'sun' : 'moon'} size={13} />
          </button>
        </div>
      </header>

      <div className={styles.catBar}>
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => app.setCat(c.id)}
            className={cx(shared.chip, styles.catChip, app.cat === c.id && shared.on)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {app.page === 'home' && !w ? (
        <MobileHome app={app} />
      ) : zero ? (
        <MobileZero app={app} />
      ) : !w ? (
        <MobileEmpty app={app} />
      ) : (
        <MobileGenerator app={app} w={w} onCopy={doCopy} />
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

function MobileHome({ app }: { app: EmanedApp }) {
  const stageRef = useRef<HTMLElement>(null);
  const [avail, setAvail] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(220, window.innerWidth - 44) : 320,
  );
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(Math.max(220, el.clientWidth - 44)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [heroRef, heroSize] = useAutoFit<HTMLHeadingElement>([avail], avail, 140, 56);

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
        Generate <Icon name="arrow" size={14} />
      </button>
    </section>
  );
}

function MobileEmpty({ app }: { app: EmanedApp }) {
  return (
    <section className={styles.emptyStage}>
      <div className={cx(shared.mono, styles.eyebrow)}>
        POOL <span className={styles.fg}>{app.pool.length}</span> READY
      </div>
      <button className={cx(shared.generate, styles.emptyGenerate)} onClick={app.generate}>
        Generate
      </button>
    </section>
  );
}

function MobileZero({ app }: { app: EmanedApp }) {
  return (
    <section className={styles.zeroStage}>
      <div className={cx(shared.mono, styles.eyebrow)}>POOL EMPTY</div>
      <div className={cx(shared.hero, styles.zeroNum)}>0</div>
      <div className={cx(shared.mono, styles.zeroNote)}>no specimens match. loosen a filter.</div>
      <button onClick={app.clearFilters} className={shared.chip}>
        Clear filters
      </button>
    </section>
  );
}

interface MobileGeneratorProps {
  app: EmanedApp;
  w: Specimen;
  onCopy: () => void;
}

function MobileGenerator({ app, w, onCopy }: MobileGeneratorProps) {
  const displayed = formatCase(w.word, app.casing);
  const rows = specimenRows(w);

  const stageRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(200, window.innerWidth - 40) : 320,
  );
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(Math.max(200, el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [heroRef, heroSize] = useAutoFit<HTMLButtonElement>(
    [w.word, app.casing, avail],
    avail,
    88,
    28,
  );
  return (
    <section className={styles.generatorStage}>
      <div className={styles.generatorHeader}>
        <span className={cx(shared.mono, styles.specimenLabel)}>SPECIMEN · {w._cat.toUpperCase()}</span>
        <span
          className={cx(shared.mono, styles.poolStat)}
          data-zero={app.pool.length === 0 ? 'true' : 'false'}
        >
          POOL <span className={styles.fg}>{app.pool.length}</span>/{app.total}
        </span>
      </div>
      <div ref={stageRef} className={styles.heroBox}>
        <button
          onClick={onCopy}
          ref={heroRef}
          key={w.word + app.casing}
          className={cx(shared.reveal, styles.specimenHero)}
          style={{ '--hero-size': `${heroSize}px` } as CSSProperties}
        >
          {displayed}
        </button>
        <div className={cx(shared.mono, styles.origin)}>{w.origin}</div>
      </div>
      <div className={styles.specimenGrid}>
        {rows.map(([k, v]) => (
          <div key={k} className={styles.specimenCell}>
            <div className={cx(shared.mono, styles.rowKey)}>{k}</div>
            <div className={styles.rowValue}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface NavItem {
  id: Exclude<SheetId, null>;
  label: string;
  icon: IconName;
  badge?: number;
}

function BottomNav({ app, onOpen }: { app: EmanedApp; onOpen: (s: SheetId) => void }) {
  const items: NavItem[] = [
    {
      id: 'filter',
      label: 'Filter',
      icon: 'filter',
      badge: (app.era ? 1 : 0) + app.vibes.length + (app.maxSyl ? 1 : 0),
    },
    { id: 'history', label: 'History', icon: 'clock', badge: app.history.length },
    { id: 'case', label: 'Case', icon: 'aa' },
    { id: 'about', label: 'About', icon: 'info' },
  ];
  return (
    <nav className={styles.bottomNav}>
      {items.map((item) => (
        <button key={item.id} onClick={() => onOpen(item.id)} className={styles.navBtn}>
          <Icon name={item.icon} size={20} />
          <span className={cx(shared.mono, styles.navLabel)}>{item.label}</span>
          {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
        </button>
      ))}
    </nav>
  );
}

function StickyGenerate({ app, copied, onCopy }: { app: EmanedApp; copied: boolean; onCopy: () => void }) {
  return (
    <div className={styles.stickyBar}>
      <button className={shared.iconBtn} onClick={onCopy}>
        <Icon name={copied ? 'check' : 'copy'} size={14} />
      </button>
      <button
        className={cx(shared.iconBtn, app.isFav(app.current) && shared.on)}
        onClick={() => app.toggleFav(app.current)}
      >
        <Icon name="star" size={14} />
      </button>
      <button
        className={cx(shared.generate, styles.stickyGenerate)}
        onClick={app.generate}
        disabled={!app.pool.length}
      >
        Generate <span className={cx(shared.mono, styles.stickyHint)}>SPC</span>
      </button>
    </div>
  );
}

function Sheet({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} className={cx(shared.fadeIn, styles.scrim)} />
      <div className={cx(shared.sheetEnter, styles.sheet)}>
        <div className={styles.sheetHandleSlot}>
          <div className={styles.sheetHandle} />
        </div>
        <div className={styles.sheetHeader}>
          <div className={styles.sheetTitle}>{title}</div>
          <button className={shared.iconBtn} onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
        <div className={styles.sheetBody}>{children}</div>
      </div>
    </>
  );
}

function FilterSheet({ app, onClose }: { app: EmanedApp; onClose: () => void }) {
  const activeCount = (app.era ? 1 : 0) + app.vibes.length + (app.maxSyl ? 1 : 0);
  return (
    <div className={styles.filterColumn}>
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
      <div className={styles.filterActions}>
        {activeCount > 0 && (
          <button onClick={app.clearFilters} className={cx(shared.chip, styles.clearChip)}>
            Clear ({activeCount})
          </button>
        )}
        <button className={cx(shared.generate, styles.applyBtn)} onClick={onClose}>
          Apply ·{' '}
          <span className={cx(shared.mono, styles.applyHint)}>{app.pool.length} IN POOL</span>
        </button>
      </div>
    </div>
  );
}

function HistorySheet({ app, onPick }: { app: EmanedApp; onPick: (h: Specimen) => void }) {
  if (app.history.length === 0) return <EmptySheet line="no history yet. draw something." />;
  return (
    <div className={styles.list}>
      {app.history.map((h, i) => (
        <button key={h.word + i} onClick={() => onPick(h)} className={styles.historyItem}>
          <div>
            <div className={styles.historyWord}>{h.word.toUpperCase()}</div>
            <div className={cx(shared.mono, styles.historyCat)}>{h._cat?.toUpperCase()}</div>
          </div>
          <Icon name="arrow" size={14} />
        </button>
      ))}
    </div>
  );
}

function CaseSheet({ app }: { app: EmanedApp }) {
  return (
    <div className={styles.caseList}>
      {CASE_CHOICES.map((c) => (
        <button
          key={c.id}
          onClick={() => app.setCasing(c.id)}
          className={cx(styles.caseBtn, app.casing === c.id && styles.on)}
        >
          <span className={styles.caseLabel}>{c.label}</span>
          <span className={cx(shared.mono, styles.casePreview)}>
            {app.current ? formatCase(app.current.word, c.id) : formatCase('Annapurna', c.id)}
          </span>
        </button>
      ))}
    </div>
  );
}

function AboutSheet() {
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

function FavsSheet({ app, onPick }: { app: EmanedApp; onPick: (f: Specimen) => void }) {
  if (app.favs.length === 0)
    return (
      <EmptySheet
        line={
          <>
            nothing saved yet. tap the <Icon name="star" size={11} /> to keep one.
          </>
        }
      />
    );
  return (
    <div className={styles.list}>
      {app.favs.map((f) => (
        <div key={f.word} className={styles.favItem}>
          <button onClick={() => onPick(f)} className={styles.favPickBtn}>
            <div className={styles.favWord}>{f.word.toUpperCase()}</div>
            <div className={cx(shared.mono, styles.favCat)}>{f._cat?.toUpperCase()}</div>
          </button>
          <button className={cx(shared.iconBtn, shared.on)} onClick={() => app.toggleFav(f)}>
            <Icon name="star" size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

function ShortcutsSheet() {
  const keys: Array<[string, string]> = [
    ['Space', 'Generate'],
    ['C', 'Copy'],
    ['F', 'Favorite'],
    ['Esc', 'Close'],
  ];
  return (
    <div className={styles.shortcutsGrid}>
      {keys.map(([k, v]) => (
        <Fragment key={k}>
          <kbd className={cx(shared.mono, styles.kbd)}>{k}</kbd>
          <span className={styles.kbdLabel}>{v}</span>
        </Fragment>
      ))}
    </div>
  );
}

function EmptySheet({ line }: { line: ReactNode }) {
  return <div className={cx(shared.mono, styles.emptySheet)}>{line}</div>;
}
