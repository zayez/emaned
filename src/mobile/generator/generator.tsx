import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { EmanedApp } from '../../hooks/use-emaned';
import { useAutoFit } from '../../hooks/use-auto-fit';
import { specimenRows } from '../../components/specimen-meta/specimen-meta';
import { formatCase } from '../../domain/casing';
import type { Specimen } from '../../domain/types';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './generator.module.css';

interface Props {
  app: EmanedApp;
  w: Specimen;
  onCopy: () => void;
}

export function Generator({ app, w, onCopy }: Props) {
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
    <section className={styles.generatorStage}>
      <div className={styles.generatorHeader}>
        <span className={cx(shared.mono, styles.specimenLabel)}>SPECIMEN · {w._cat.toUpperCase()}</span>
        <span
          className={cx(shared.mono, styles.poolStat)}
          data-zero={app.pool.length === 0 ? 'true' : 'false'}
        >
          POOL <span className={styles.fg}>{app.pool.length}</span>/{app.total}
        </span>
      </div>
      <div ref={stageRef} className={styles.heroBox}>
        <button
          onClick={onCopy}
          ref={heroRef}
          key={w.word + app.casing}
          className={cx(shared.reveal, styles.specimenHero)}
          style={{ '--hero-size': `${heroSize}px` } as CSSProperties}
        >
          {displayed}
        </button>
        <div className={cx(shared.mono, styles.origin)}>{w.origin}</div>
      </div>
      <div className={styles.specimenGrid}>
        {rows.map(([k, v]) => (
          <div key={k} className={styles.specimenCell}>
            <div className={cx(shared.mono, styles.rowKey)}>{k}</div>
            <div className={styles.rowValue}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
