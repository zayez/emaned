import type { EmanedApp } from '../../hooks/use-emaned';
import { CATS } from '../../constants';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './cat-bar.module.css';

export function CatBar({ app }: { app: EmanedApp }) {
  return (
    <nav aria-label="Categories" className={styles.catBar}>
      {CATS.map((c) => (
        <button
          key={c.id}
          onClick={() => app.setCat(c.id)}
          className={cx(shared.chip, styles.catChip, app.cat === c.id && shared.on)}
        >
          {c.label}
        </button>
      ))}
    </nav>
  );
}
