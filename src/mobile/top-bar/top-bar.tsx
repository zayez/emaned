import type { EmanedApp } from '../../hooks/use-emaned';
import { Icon } from '../../components/icon/icon';
import shared from '../../shared.module.css';
import styles from './top-bar.module.css';

interface Props {
  app: EmanedApp;
  onOpenFavs: () => void;
}

export function TopBar({ app, onOpenFavs }: Props) {
  return (
    <header className={styles.topBar}>
      <button onClick={() => app.setPage('home')} className={styles.brandBtn}>
        <span className={styles.brand}>
          emaned<span className={styles.accentDot}>.</span>
        </span>
      </button>
      <div className={styles.topActions}>
        <button className={shared.iconBtn} onClick={onOpenFavs} title="Favorites">
          <Icon name="star" size={13} />
        </button>
        <button
          className={shared.iconBtn}
          onClick={() => app.setTheme(app.theme === 'dark' ? 'light' : 'dark')}
          title="Theme"
        >
          <Icon name={app.theme === 'dark' ? 'sun' : 'moon'} size={13} />
        </button>
      </div>
    </header>
  );
}
