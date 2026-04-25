import type { EmanedApp } from '../../hooks/use-emaned';
import { PoolBlock } from '../../components/pool-block/pool-block';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './zero-stage.module.css';

export function ZeroStage({ app }: { app: EmanedApp }) {
  return (
    <section className={styles.zeroStage}>
      <div className={styles.poolBlockSlot}>
        <PoolBlock app={app} big />
      </div>
      <div className={cx(shared.mono, styles.zeroEyebrow)}>POOL EMPTY</div>
      <div className={cx(shared.hero, styles.zeroNum)}>0</div>
      <div className={cx(shared.mono, styles.zeroNote)}>no specimens match. loosen a filter.</div>
      <button className={cx(shared.generate, styles.zeroGenerate)} disabled>
        Generate
      </button>
      <button onClick={app.clearFilters} className={cx(shared.chip, styles.zeroClear)}>
        Clear filters
      </button>
    </section>
  );
}
