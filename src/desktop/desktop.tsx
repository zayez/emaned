import { useState, useRef, useEffect, Fragment, type ReactNode } from 'react';
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
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: '56px 1fr 36px',
        position: 'relative',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      <TopBar
        app={app}
        onFavs={() => setFavsOpen(true)}
        onAbout={() => setAboutOpen(true)}
        onHelp={() => setShortcutsOpen(true)}
      />

      <main style={{ display: 'grid', gridTemplateColumns: '204px 1fr 268px', minHeight: 0, minWidth: 0 }}>
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
    <header
      style={{
        gridRow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <button
          onClick={() => app.setPage('home')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, fontStretch: '125%', letterSpacing: '-.04em' }}>
            emaned<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
        </button>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: '.18em', color: 'var(--muted)' }}>
          A CODENAME GENERATOR
        </span>
      </div>
      <nav
        className="mono"
        style={{ fontSize: 11, letterSpacing: '.18em', color: 'var(--muted)', display: 'flex', gap: 24 }}
      >
        <button
          onClick={onFavs}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}
        >
          FAVORITES{' '}
          <span style={{ color: 'var(--fg)', marginLeft: 4 }}>
            {app.favs.length.toString().padStart(2, '0')}
          </span>
        </button>
        <button
          onClick={onAbout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}
        >
          ABOUT
        </button>
      </nav>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="icon-btn" title="Shortcuts (?)" onClick={onHelp}>
          <Icon name="help" size={14} />
        </button>
        <button
          className="icon-btn"
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
    <aside
      style={{
        borderRight: '1px solid var(--line)',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        overflow: 'hidden',
      }}
    >
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 14 }}>
        CATEGORY
      </div>
      {CATS.map((c) => {
        const on = app.cat === c.id;
        return (
          <button
            key={c.id}
            onClick={() => app.setCat(c.id)}
            style={{
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              padding: '8px 0',
              cursor: 'pointer',
              color: on ? 'var(--fg)' : 'var(--muted)',
              fontSize: 16,
              fontWeight: on ? 700 : 500,
              letterSpacing: '-.01em',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'inherit',
              fontStretch: '125%',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: on ? 'var(--accent)' : 'transparent',
                border: on ? 'none' : '1px solid var(--line)',
                flexShrink: 0,
              }}
            />
            {c.label}
            {c.id === 'all' && (
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 9.5, letterSpacing: '.18em', color: 'var(--muted)' }}>
                {TOTAL}
              </span>
            )}
          </button>
        );
      })}
      <div style={{ marginTop: 'auto', paddingTop: 24 }} className="mono">
        <div style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--muted)', lineHeight: 1.7 }}>
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
    <aside
      style={{
        borderLeft: '1px solid var(--line)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '.2em', color: 'var(--muted)' }}>
          FILTERS {activeCount ? <span style={{ color: 'var(--fg)' }}>· {activeCount}</span> : ''}
        </div>
        {activeCount > 0 && (
          <button
            onClick={app.clearFilters}
            className="mono"
            style={{ background: 'none', border: 'none', fontSize: 10, letterSpacing: '.18em', color: 'var(--accent)', cursor: 'pointer' }}
          >
            CLEAR
          </button>
        )}
      </div>

      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 10 }}>
          VIBE
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
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
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
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
        <div style={{ display: 'flex', gap: 4 }}>
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

      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--line)' }} className="mono">
        <div style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--muted)', lineHeight: 1.8 }}>
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
    <section
      ref={stageRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 48px',
        textAlign: 'center',
        position: 'relative',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div className="mono" style={{ fontSize: 11, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 22 }}>
        — A CODENAME GENERATOR —
      </div>

      <h1
        ref={heroRef}
        className="hero"
        style={{ fontSize: heroSize, margin: 0, letterSpacing: '-.055em', whiteSpace: 'nowrap', maxWidth: '100%' }}
      >
        emaned<span style={{ color: 'var(--accent)' }}>.</span>
      </h1>

      <p
        style={{
          maxWidth: 680,
          marginTop: 30,
          fontSize: 21,
          fontStretch: '125%',
          lineHeight: 1.4,
          color: 'var(--muted)',
          textWrap: 'pretty',
          letterSpacing: '-.015em',
        }}
      >
        Draw a single evocative word from{' '}
        <span style={{ color: 'var(--fg)' }}>{TOTAL} specimens</span> across five taxonomies — Intel processors, mountains, celestial bodies, gemstones, and Greek mythology. Filter by{' '}
        <em style={{ fontStyle: 'normal', color: 'var(--fg)' }}>vibe</em>,{' '}
        <em style={{ fontStyle: 'normal', color: 'var(--fg)' }}>era</em>, or{' '}
        <em style={{ fontStyle: 'normal', color: 'var(--fg)' }}>length</em>. Keep what you like.
      </p>

      <button className="generate" style={{ marginTop: 44, padding: '22px 36px', fontSize: 14 }} onClick={app.generate}>
        Generate a codename
        <span className="mono" style={{ fontSize: 10, opacity: 0.55, letterSpacing: '.2em' }}>
          SPACE
        </span>
      </button>

      <div style={{ marginTop: 56, display: 'flex', gap: 28, alignItems: 'center', opacity: 0.7 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)' }}>
          OR BROWSE →
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {CATS.slice(1).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                app.setCat(c.id);
                app.generate();
              }}
              className="chip"
              style={{ fontStretch: 'normal' }}
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
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 48px',
          textAlign: 'center',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <div className="mono" style={{ fontSize: 11, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 22 }}>
          POOL <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{app.pool.length}</span> ready
        </div>
        <button className="generate" onClick={app.generate} style={{ fontSize: 14, padding: '22px 36px' }}>
          Generate{' '}
          <span className="mono" style={{ fontSize: 10, opacity: 0.55, letterSpacing: '.2em' }}>
            SPACE
          </span>
        </button>
      </section>
    );
  }
  if (zero) return <ZeroStage app={app} />;

  const displayed = formatCase(w!.word, app.casing);
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 48px 20px',
        position: 'relative',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 32, left: 48 }}>
        <PoolBlock app={app} big />
      </div>
      <div
        className="mono"
        style={{ position: 'absolute', top: 32, right: 48, fontSize: 10.5, letterSpacing: '.2em', color: 'var(--muted)' }}
      >
        SPECIMEN · {w!._cat.toUpperCase()}
      </div>

      <div
        ref={heroBoxRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          minWidth: 0,
          padding: '60px 0 20px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onCopy}
          title="Click to copy"
          ref={heroRef}
          key={w!.word + app.casing}
          className="hero reveal"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'inherit',
            cursor: 'pointer',
            fontSize: heroSize,
            whiteSpace: 'normal',
            textWrap: 'balance',
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
            marginTop: 24,
            fontSize: 12,
            color: 'var(--muted)',
            letterSpacing: '.08em',
            textAlign: 'center',
            maxWidth: 640,
            lineHeight: 1.7,
            textWrap: 'pretty',
          }}
        >
          {w!.origin}
        </div>
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
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(5, rows.length)},1fr)`,
          gap: 2,
          border: '1px solid var(--line)',
          padding: '16px 20px',
        }}
      >
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 5 }}>
              {k}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-.01em' }}>{v}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 18,
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="icon-btn" title="Copy (C)" onClick={onCopy}>
            <Icon name={copied ? 'check' : 'copy'} size={14} />
          </button>
          <button
            className={`icon-btn ${app.isFav(w) ? 'on' : ''}`}
            title="Favorite (F)"
            onClick={() => app.toggleFav(w)}
          >
            <Icon name="star" size={14} />
          </button>
          <span className="mono" style={{ marginLeft: 8, fontSize: 10.5, letterSpacing: '.16em', color: 'var(--muted)' }}>
            CASE
          </span>
          {CASE_CHOICES.map((c) => (
            <button
              key={c.id}
              onClick={() => app.setCasing(c.id)}
              className={`chip ${app.casing === c.id ? 'on' : ''}`}
              style={{ fontSize: 10, padding: '6px 10px' }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button className="generate" onClick={app.generate}>
          Generate{' '}
          <span className="mono" style={{ fontSize: 10, opacity: 0.55, letterSpacing: '.2em' }}>
            SPACE
          </span>
        </button>
      </div>
    </div>
  );
}

function ZeroStage({ app }: { app: EmanedApp }) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 48px',
        textAlign: 'center',
        position: 'relative',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 32, left: 48 }}>
        <PoolBlock app={app} big />
      </div>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '.2em', color: 'var(--muted)', marginBottom: 18 }}>
        POOL EMPTY
      </div>
      <div className="hero" style={{ fontSize: 320, color: 'var(--accent)', lineHeight: 0.82 }}>
        0
      </div>
      <div className="mono" style={{ marginTop: 26, fontSize: 13, color: 'var(--muted)', letterSpacing: '.08em' }}>
        no specimens match. loosen a filter.
      </div>
      <button className="generate" disabled style={{ marginTop: 28 }}>
        Generate
      </button>
      <button onClick={app.clearFilters} className="chip" style={{ marginTop: 20 }}>
        Clear filters
      </button>
    </section>
  );
}

function HistoryStrip({ app }: { app: EmanedApp }) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        gap: 24,
        overflow: 'hidden',
      }}
    >
      <span className="mono" style={{ fontSize: 10.5, letterSpacing: '.2em', color: 'var(--muted)' }}>
        HISTORY
      </span>
      {app.history.length === 0 ? (
        <span
          className="mono"
          style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.08em', fontStyle: 'italic' }}
        >
          — the strip fills as you draw.
        </span>
      ) : (
        app.history.map((h, i) => (
          <button
            key={h.word + i}
            onClick={() => app.setCurrent(h)}
            className="mono"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              letterSpacing: '.06em',
              color: 'var(--muted)',
              padding: 0,
              fontFamily: 'inherit',
              transition: 'color .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
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
      <div
        onClick={onClose}
        className="fade-in"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 40 }}
      />
      <aside
        className="drawer-enter"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '92vw',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--line)',
          padding: '32px 32px',
          boxShadow: '-30px 0 60px rgba(0,0,0,.2)',
          zIndex: 41,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: '.22em', color: 'var(--muted)', marginBottom: 4 }}>
              FAVORITES
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.03em' }}>
              {app.favs.length} saved
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background: 'var(--line)',
            border: '1px solid var(--line)',
          }}
        >
          {app.favs.length === 0 ? (
            <div style={{ background: 'var(--bg)', padding: '40px 20px', textAlign: 'center' }} className="mono">
              <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.08em', lineHeight: 1.6 }}>
                nothing saved yet.
                <br />
                press <span style={{ color: 'var(--accent)' }}>F</span> when you land on one you like.
              </div>
            </div>
          ) : (
            app.favs.map((f) => (
              <div
                key={f.word}
                style={{
                  background: 'var(--bg)',
                  padding: '18px 16px',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '-.03em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {f.word.toUpperCase()}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--muted)', marginTop: 2 }}
                  >
                    {f._cat?.toUpperCase()}
                  </div>
                </div>
                <button className="icon-btn on" style={{ flexShrink: 0 }} onClick={() => app.toggleFav(f)}>
                  <Icon name="star" size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--muted)', marginTop: 20 }}>
          ESC TO CLOSE · STORED LOCALLY
        </div>
      </aside>
    </>
  );
}

function Modal({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return (
    <div
      className="fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: '32px 36px', maxWidth: 520, width: '100%', position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: '.22em', color: 'var(--muted)' }}>
            {title.toUpperCase()}
          </div>
          <button className="icon-btn" onClick={onClose}>
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
    </div>
  );
}

function AboutContent() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.55, textWrap: 'pretty', color: 'var(--fg)' }}>
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
