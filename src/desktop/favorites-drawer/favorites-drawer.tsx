import type { EmanedApp } from '../../hooks/use-emaned';
import { Icon } from '../../components/icon/icon';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './favorites-drawer.module.css';

export function FavoritesDrawer({ app, onClose }: { app: EmanedApp; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} className={cx(shared.fadeIn, styles.scrim)} />
      <aside aria-label="Favorites" className={cx(shared.drawerEnter, styles.favsDrawer)}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={cx(shared.mono, styles.drawerEyebrow)}>FAVORITES</div>
            <div className={styles.drawerCount}>{app.favs.length} saved</div>
          </div>
          <button className={shared.iconBtn} onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
        <div className={styles.favsList}>
          {app.favs.length === 0 ? (
            <div className={cx(shared.mono, styles.favsEmpty)}>
              <div className={styles.favsEmptyText}>
                nothing saved yet.
                <br />
                press <span className={styles.favsEmptyKey}>F</span> when you land on one you like.
              </div>
            </div>
          ) : (
            app.favs.map((f) => (
              <div key={f.word} className={styles.favItem}>
                <div className={styles.favItemMain}>
                  <div className={styles.favWord}>{f.word.toUpperCase()}</div>
                  <div className={cx(shared.mono, styles.favCat)}>{f._cat?.toUpperCase()}</div>
                </div>
                <button
                  className={cx(shared.iconBtn, shared.on, styles.favStarBtn)}
                  onClick={() => app.toggleFav(f)}
                >
                  <Icon name="star" size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className={cx(shared.mono, styles.drawerFooter)}>ESC TO CLOSE · STORED LOCALLY</div>
      </aside>
    </>
  );
}
