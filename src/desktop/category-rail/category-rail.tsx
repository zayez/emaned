import type { EmanedApp } from '../../hooks/use-emaned';
import { CATS } from '../../constants';
import { getTotal } from '../../domain/corpus';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './category-rail.module.css';

const TOTAL = getTotal();

export function CategoryRail({ app }: { app: EmanedApp }) {
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
