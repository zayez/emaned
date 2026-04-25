import type { EmanedApp } from '../../hooks/use-emaned';
import { Icon } from '../../components/icon/icon';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './sticky-generate.module.css';

interface Props {
  app: EmanedApp;
  copied: boolean;
  onCopy: () => void;
}

export function StickyGenerate({ app, copied, onCopy }: Props) {
  return (
    <div className={styles.stickyBar}>
      <button className={shared.iconBtn} onClick={onCopy}>
        <Icon name={copied ? 'check' : 'copy'} size={14} />
      </button>
      <button
        className={cx(shared.iconBtn, app.isFav(app.current) && shared.on)}
        onClick={() => app.toggleFav(app.current)}
      >
        <Icon name="star" size={14} />
      </button>
      <button
        className={cx(shared.generate, styles.stickyGenerate)}
        onClick={app.generate}
        disabled={!app.pool.length}
      >
        Generate <span className={cx(shared.mono, styles.stickyHint)}>SPC</span>
      </button>
    </div>
  );
}
