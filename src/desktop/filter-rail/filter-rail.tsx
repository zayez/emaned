import type { EmanedApp } from '../../hooks/use-emaned';
import { ERAS, VIBES } from '../../domain/types';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './filter-rail.module.css';

export function FilterRail({ app }: { app: EmanedApp }) {
  const activeCount = (app.era ? 1 : 0) + app.vibes.length + (app.maxSyl ? 1 : 0);
  return (
    <aside aria-label="Filters" className={styles.filterRail}>
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
