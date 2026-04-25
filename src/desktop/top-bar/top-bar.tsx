import type { EmanedApp } from '../../hooks/use-emaned';
import { Icon } from '../../components/icon/icon';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './top-bar.module.css';

interface Props {
  app: EmanedApp;
  onFavs: () => void;
  onAbout: () => void;
  onHelp: () => void;
}

export function TopBar({ app, onFavs, onAbout, onHelp }: Props) {
  return (
    <header className={styles.topBar}>
      <div className={styles.brandGroup}>
        <button onClick={() => app.setPage('home')} className={styles.brandBtn}>
          <span className={styles.brand}>
            emaned<span className={styles.accentDot}>.</span>
          </span>
        </button>
        <span className={cx(shared.mono, styles.subtitle)}>A CODENAME GENERATOR</span>
      </div>
      <nav className={cx(shared.mono, styles.topNav)}>
        <button onClick={onFavs} className={styles.navBtn}>
          FAVORITES <span className={styles.navCount}>{app.favs.length.toString().padStart(2, '0')}</span>
        </button>
        <button onClick={onAbout} className={styles.navBtn}>
          ABOUT
        </button>
      </nav>
      <div className={styles.topActions}>
        <button className={shared.iconBtn} title="Shortcuts (?)" onClick={onHelp}>
          <Icon name="help" size={14} />
        </button>
        <button
          className={shared.iconBtn}
          title="Theme"
          onClick={() => app.setTheme(app.theme === 'dark' ? 'light' : 'dark')}
        >
          <Icon name={app.theme === 'dark' ? 'sun' : 'moon'} size={14} />
        </button>
      </div>
    </header>
  );
}
