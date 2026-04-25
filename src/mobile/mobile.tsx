import { useEffect, useRef, useState, Fragment, type ReactNode } from 'react';
import type { EmanedApp } from '../hooks/use-emaned';
import { useKeys } from '../hooks/use-keys';
import { useAutoFit } from '../hooks/use-auto-fit';
import { Icon, type IconName } from '../components/icon';
import { specimenRows } from '../components/specimen-meta';
import { CATS, CASE_CHOICES } from '../constants';
import { getTotal } from '../domain/corpus';
import { formatCase } from '../domain/casing';
import { ERAS, VIBES, type Specimen } from '../domain/types';

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
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 68,
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      <header
        style={{
          height: 52,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--line)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => app.setPage('home')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)' }} />
          <span className="mono" style={{ fontSize: 11, letterSpacing: '.22em', fontWeight: 500 }}>
            EMANED
          </span>
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn hit" onClick={() => setSheet('favs')} title="Favorites">
            <Icon name="star" size={13} />
          </button>
          <button
            className="icon-btn hit"
            onClick={() => app.setTheme(app.theme === 'dark' ? 'light' : 'dark')}
            title="Theme"
          >
            <Icon name={app.theme === 'dark' ? 'sun' : 'moon'} size={13} />
          </button>
        </div>
      </header>

      <div style={{ padding: '12px 16px 8px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => app.setCat(c.id)}
            className={`chip ${app.cat === c.id ? 'on' : ''}`}
            style={{ flexShrink: 0, padding: '7px 12px' }}
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
  return (
    <section
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 22px',
        textAlign: 'center',
        gap: 20,
      }}
    >
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)' }}>
        — A CODENAME GENERATOR —
      </div>
      <h1 className="hero" style={{ fontSize: 'clamp(84px,28vw,140px)', margin: 0 }}>
        emaned<span style={{ color: 'var(--accent)' }}>.</span>
      </h1>
      <p
        style={{
          fontSize: 15.5,
          lineHeight: 1.45,
          color: 'var(--muted)',
          textWrap: 'pretty',
          maxWidth: 320,
          margin: 0,
          letterSpacing: '-.01em',
        }}
      >
        One word at a time, from <span style={{ color: 'var(--fg)' }}>{TOTAL} specimens</span> across five curated taxonomies. Filter by vibe, era, or length.
      </p>
      <button className="generate" onClick={app.generate} style={{ marginTop: 8, padding: '18px 28px', fontSize: 13 }}>
        Generate <Icon name="arrow" size={14} />
      </button>
    </section>
  );
}

function MobileEmpty({ app }: { app: EmanedApp }) {
  return (
    <section
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 14,
      }}
    >
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)' }}>
        POOL <span style={{ color: 'var(--fg)' }}>{app.pool.length}</span> READY
      </div>
      <button className="generate" onClick={app.generate} style={{ fontSize: 13 }}>
        Generate
      </button>
    </section>
  );
}

function MobileZero({ app }: { app: EmanedApp }) {
  return (
    <section
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        gap: 16,
      }}
    >
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)' }}>
        POOL EMPTY
      </div>
      <div className="hero" style={{ fontSize: 220, color: 'var(--accent)', lineHeight: 0.82 }}>
        0
      </div>
      <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.08em' }}>
        no specimens match. loosen a filter.
      </div>
      <button onClick={app.clearFilters} className="chip">
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
    <section
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 20px 120px',
        gap: 18,
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)' }}>
          SPECIMEN · {w._cat.toUpperCase()}
        </span>
        <span
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: '.2em',
            color: app.pool.length === 0 ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          POOL <span style={{ color: 'var(--fg)' }}>{app.pool.length}</span>/{app.total}
        </span>
      </div>
      <div
        ref={stageRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          minHeight: 220,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onCopy}
          ref={heroRef}
          key={w.word + app.casing}
          className="hero reveal"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'inherit',
            cursor: 'pointer',
            fontSize: heroSize,
            whiteSpace: 'nowrap',
            letterSpacing: '-.055em',
            fontStretch: '125%',
            fontWeight: 800,
            maxWidth: '100%',
          }}
        >
          {displayed}
        </button>
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            letterSpacing: '.06em',
            lineHeight: 1.6,
            textWrap: 'pretty',
            maxWidth: 320,
          }}
        >
          {w.origin}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 1,
          background: 'var(--line)',
          border: '1px solid var(--line)',
          textAlign: 'left',
        }}
      >
        {rows.map(([k, v]) => (
          <div key={k} style={{ background: 'var(--bg)', padding: '10px 12px' }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 3 }}>
              {k}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-.01em' }}>{v}</div>
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
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        background: 'var(--bg)',
        borderTop: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 20,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onOpen(item.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            minHeight: 48,
            minWidth: 48,
            color: 'var(--muted)',
            fontFamily: 'inherit',
            position: 'relative',
          }}
        >
          <Icon name={item.icon} size={20} />
          <span className="mono" style={{ fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase' }}>
            {item.label}
          </span>
          {item.badge ? (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 10,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 99,
                background: 'var(--accent)',
                color: '#0b0b0b',
                fontSize: 9.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {item.badge}
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}

function StickyGenerate({ app, copied, onCopy }: { app: EmanedApp; copied: boolean; onCopy: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 68,
        padding: '10px 16px 12px',
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        zIndex: 15,
      }}
    >
      <button className="icon-btn hit" onClick={onCopy}>
        <Icon name={copied ? 'check' : 'copy'} size={14} />
      </button>
      <button
        className={`icon-btn hit ${app.isFav(app.current) ? 'on' : ''}`}
        onClick={() => app.toggleFav(app.current)}
      >
        <Icon name="star" size={14} />
      </button>
      <button
        className="generate"
        onClick={app.generate}
        disabled={!app.pool.length}
        style={{ flex: 1, justifyContent: 'center', padding: '16px 0', fontSize: 13 }}
      >
        Generate{' '}
        <span className="mono" style={{ fontSize: 9.5, letterSpacing: '.2em', opacity: 0.6 }}>
          SPC
        </span>
      </button>
    </div>
  );
}

function Sheet({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return (
    <>
      <div
        className="fade-in"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 50 }}
      />
      <div
        className="sheet-enter"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg)',
          borderTop: '1px solid var(--line)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          zIndex: 51,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div style={{ padding: '14px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 3, background: 'var(--line)' }} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 8px',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</div>
          <button className="icon-btn hit" onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 20px 24px' }}>{children}</div>
      </div>
    </>
  );
}

function FilterSheet({ app, onClose }: { app: EmanedApp; onClose: () => void }) {
  const activeCount = (app.era ? 1 : 0) + app.vibes.length + (app.maxSyl ? 1 : 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 10 }}>
          VIBE
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {VIBES.map((v) => (
            <button
              key={v}
              onClick={() => app.toggleVibe(v)}
              className={`chip ${app.vibes.includes(v) ? 'accent-on' : ''}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 10 }}>
          ERA
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => app.setEra(null)} className={`chip ${!app.era ? 'on' : ''}`}>
            any
          </button>
          {ERAS.map((e) => (
            <button
              key={e}
              onClick={() => app.setEra(app.era === e ? null : e)}
              className={`chip ${app.era === e ? 'on' : ''}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: '.2em',
            color: 'var(--muted)',
            marginBottom: 10,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>SYLLABLES</span>
          <span style={{ color: app.maxSyl ? 'var(--fg)' : 'var(--muted)' }}>
            {app.maxSyl ? `≤ ${app.maxSyl}` : 'any'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => app.setMaxSyl(null)}
            className={`chip ${!app.maxSyl ? 'on' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            any
          </button>
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => app.setMaxSyl(app.maxSyl === n ? null : n)}
              className={`chip ${app.maxSyl === n ? 'on' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              ≤{n}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {activeCount > 0 && (
          <button onClick={app.clearFilters} className="chip" style={{ flex: 1, justifyContent: 'center', padding: '12px 0' }}>
            Clear ({activeCount})
          </button>
        )}
        <button className="generate" onClick={onClose} style={{ flex: 2, justifyContent: 'center', padding: '14px 0', fontSize: 12 }}>
          Apply ·{' '}
          <span className="mono" style={{ fontSize: 10, letterSpacing: '.18em', opacity: 0.7 }}>
            {app.pool.length} IN POOL
          </span>
        </button>
      </div>
    </div>
  );
}

function HistorySheet({ app, onPick }: { app: EmanedApp; onPick: (h: Specimen) => void }) {
  if (app.history.length === 0) return <EmptySheet line="no history yet. draw something." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
      {app.history.map((h, i) => (
        <button
          key={h.word + i}
          onClick={() => onPick(h)}
          style={{
            background: 'var(--bg)',
            padding: '14px 14px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontFamily: 'inherit',
            color: 'inherit',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>
              {h.word.toUpperCase()}
            </div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '.18em', color: 'var(--muted)', marginTop: 2 }}>
              {h._cat?.toUpperCase()}
            </div>
          </div>
          <Icon name="arrow" size={14} />
        </button>
      ))}
    </div>
  );
}

function CaseSheet({ app }: { app: EmanedApp }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {CASE_CHOICES.map((c) => (
        <button
          key={c.id}
          onClick={() => app.setCasing(c.id)}
          style={{
            background: app.casing === c.id ? 'var(--fg)' : 'transparent',
            color: app.casing === c.id ? 'var(--bg)' : 'var(--fg)',
            border: '1px solid var(--line)',
            padding: '16px 18px',
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.02em' }}>{c.label}</span>
          <span className="mono" style={{ fontSize: 11, letterSpacing: '.08em', opacity: 0.7 }}>
            {app.current ? formatCase(app.current.word, c.id) : formatCase('Annapurna', c.id)}
          </span>
        </button>
      ))}
    </div>
  );
}

function AboutSheet() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.55, textWrap: 'pretty' }}>
      <p style={{ margin: '0 0 14px' }}>
        emaned is a static tool for drawing a single evocative word from curated taxonomies. {TOTAL} specimens across five categories, cross-filterable by vibe, era, and length.
      </p>
      <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>
        No accounts. No sync. Favorites and history live on this device only.
      </p>
      <p
        className="mono"
        style={{ margin: 0, fontSize: 11, letterSpacing: '.18em', color: 'var(--muted)', textTransform: 'uppercase' }}
      >
        v1 · mmxxvi
      </p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
      {app.favs.map((f) => (
        <div
          key={f.word}
          style={{
            background: 'var(--bg)',
            padding: '14px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
          }}
        >
          <button
            onClick={() => onPick(f)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'inherit',
              textAlign: 'left',
              flex: 1,
              fontFamily: 'inherit',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {f.word.toUpperCase()}
            </div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '.18em', color: 'var(--muted)', marginTop: 2 }}>
              {f._cat?.toUpperCase()}
            </div>
          </button>
          <button className="icon-btn on hit" onClick={() => app.toggleFav(f)}>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 12, columnGap: 16, alignItems: 'baseline' }}>
      {keys.map(([k, v]) => (
        <Fragment key={k}>
          <kbd
            className="mono"
            style={{
              padding: '4px 10px',
              border: '1px solid var(--line)',
              borderBottomWidth: 2,
              fontSize: 11,
              letterSpacing: '.1em',
              minWidth: 40,
              textAlign: 'center',
            }}
          >
            {k}
          </kbd>
          <span style={{ fontSize: 15 }}>{v}</span>
        </Fragment>
      ))}
    </div>
  );
}

function EmptySheet({ line }: { line: ReactNode }) {
  return (
    <div
      className="mono"
      style={{
        textAlign: 'center',
        padding: '32px 16px',
        fontSize: 12,
        color: 'var(--muted)',
        letterSpacing: '.06em',
        lineHeight: 1.7,
      }}
    >
      {line}
    </div>
  );
}
