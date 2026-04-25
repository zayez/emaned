import type { EmanedApp } from '../../hooks/use-emaned';
import { ERAS, VIBES } from '../../domain/types';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './sheet.module.css';

interface Props {
  app: EmanedApp;
  onClose: () => void;
}

export function FilterSheet({ app, onClose }: Props) {
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
