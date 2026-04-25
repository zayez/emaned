import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { EmanedApp } from '../../hooks/use-emaned';
import { useAutoFit } from '../../hooks/use-auto-fit';
import { CATS } from '../../constants';
import { getTotal } from '../../domain/corpus';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './home-stage.module.css';

const TOTAL = getTotal();

export function HomeStage({ app }: { app: EmanedApp }) {
  const stageRef = useRef<HTMLElement>(null);
  const [avail, setAvail] = useState(820);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(Math.max(320, el.clientWidth - 48)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [heroRef, heroSize] = useAutoFit<HTMLHeadingElement>([avail], avail, 260, 80);

  return (
    <section ref={stageRef} className={styles.homeStage}>
      <div className={cx(shared.mono, styles.eyebrow)}>— A CODENAME GENERATOR —</div>

      <h1
        ref={heroRef}
        className={cx(shared.hero, styles.homeHero)}
        style={{ '--hero-size': `${heroSize}px` } as CSSProperties}
      >
        emaned<span className={styles.accentDot}>.</span>
      </h1>

      <p className={styles.intro}>
        Draw a single evocative word from <span className={styles.fg}>{TOTAL} specimens</span> across five taxonomies
        — Intel processors, mountains, celestial bodies, gemstones, and Greek mythology. Filter by{' '}
        <em className={styles.em}>vibe</em>, <em className={styles.em}>era</em>, or <em className={styles.em}>length</em>.
        Keep what you like.
      </p>

      <button className={cx(shared.generate, styles.homeGenerate)} onClick={app.generate}>
        Generate a codename
        <span className={cx(shared.mono, shared.spaceHint)}>SPACE</span>
      </button>

      <div className={styles.browseRow}>
        <span className={cx(shared.mono, styles.browseLabel)}>OR BROWSE →</span>
        <div className={styles.browseChips}>
          {CATS.slice(1).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                app.setCat(c.id);
                app.generate();
              }}
              className={cx(shared.chip, styles.browseChip)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
