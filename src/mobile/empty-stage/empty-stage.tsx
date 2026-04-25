import type { EmanedApp } from '../../hooks/use-emaned';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './empty-stage.module.css';

export function EmptyStage({ app }: { app: EmanedApp }) {
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
