import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { EmanedApp } from '../../hooks/use-emaned';
import { useAutoFit } from '../../hooks/use-auto-fit';
import { PoolBlock } from '../../components/pool-block/pool-block';
import { formatCase } from '../../domain/casing';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import { ZeroStage } from '../zero-stage/zero-stage';
import { SpecimenCard } from './specimen-card';
import styles from './generator-stage.module.css';

interface Props {
  app: EmanedApp;
  copied: boolean;
  onCopy: () => void;
}

export function GeneratorStage({ app, copied, onCopy }: Props) {
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
      <section className={styles.poolReadyStage}>
        <div className={cx(shared.mono, styles.poolReadyEyebrow)}>
          POOL <span className={styles.poolReadyCount}>{app.pool.length}</span> ready
        </div>
        <button className={cx(shared.generate, styles.bigGenerate)} onClick={app.generate}>
          Generate <span className={cx(shared.mono, shared.spaceHint)}>SPACE</span>
        </button>
      </section>
    );
  }
  if (zero) return <ZeroStage app={app} />;

  const displayed = formatCase(w!.word, app.casing);
  return (
    <section className={styles.generatorStage}>
      <div className={styles.poolBlockSlot}>
        <PoolBlock app={app} big />
      </div>
      <div className={cx(shared.mono, styles.specimenLabel)}>SPECIMEN · {w!._cat.toUpperCase()}</div>

      <div ref={heroBoxRef} className={styles.heroBox}>
        <button
          onClick={onCopy}
          title="Click to copy"
          ref={heroRef}
          key={w!.word + app.casing}
          className={cx(shared.reveal, styles.specimenHero)}
          style={{ '--hero-size': `${heroSize}px` } as CSSProperties}
        >
          {displayed}
        </button>
        <div className={cx(shared.mono, styles.origin)}>{w!.origin}</div>
      </div>

      <SpecimenCard w={w!} app={app} copied={copied} onCopy={onCopy} />
    </section>
  );
}
