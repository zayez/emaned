import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { EmanedApp } from '../../hooks/use-emaned';
import { useAutoFit } from '../../hooks/use-auto-fit';
import { Icon } from '../../components/icon/icon';
import { getTotal } from '../../domain/corpus';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './home-stage.module.css';

const TOTAL = getTotal();

export function HomeStage({ app }: { app: EmanedApp }) {
  const stageRef = useRef<HTMLElement>(null);
  const [avail, setAvail] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(220, window.innerWidth - 44) : 320,
  );
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(Math.max(220, el.clientWidth - 44)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [heroRef, heroSize] = useAutoFit<HTMLHeadingElement>([avail], avail, 140, 56);

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
        Generate <Icon name="arrow" size={14} />
      </button>
    </section>
  );
}
