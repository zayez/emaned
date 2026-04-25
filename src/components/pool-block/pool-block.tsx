import type { EmanedApp } from '../../hooks/use-emaned';
import shared from '../../shared.module.css';
import styles from './pool-block.module.css';
import { cx } from '../../cx';

interface Props {
  app: EmanedApp;
  big?: boolean;
}

export function PoolBlock({ app, big = false }: Props) {
  const n = app.pool.length;
  const zero = n === 0;
  return (
    <div className={styles.root} data-zero={zero}>
      <span className={cx(shared.mono, styles.label)}>POOL</span>
      <span className={cx(styles.count, big && styles.big)}>{n}</span>
      <span className={cx(shared.mono, styles.total)}>of {app.total}</span>
    </div>
  );
}
