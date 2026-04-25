import type { EmanedApp } from '../../hooks/use-emaned';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './zero-stage.module.css';

export function ZeroStage({ app }: { app: EmanedApp }) {
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
