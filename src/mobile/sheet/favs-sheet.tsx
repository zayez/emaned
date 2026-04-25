import type { EmanedApp } from '../../hooks/use-emaned';
import { Icon } from '../../components/icon/icon';
import type { Specimen } from '../../domain/types';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import { EmptySheet } from './empty-sheet';
import styles from './sheet.module.css';

interface Props {
  app: EmanedApp;
  onPick: (f: Specimen) => void;
}

export function FavsSheet({ app, onPick }: Props) {
  if (app.favs.length === 0)
    return (
      <EmptySheet
        line={
          <>
            nothing saved yet. tap the <Icon name="star" size={11} /> to keep one.
          </>
        }
      />
    );
  return (
    <div className={styles.list}>
      {app.favs.map((f) => (
        <div key={f.word} className={styles.favItem}>
          <button onClick={() => onPick(f)} className={styles.favPickBtn}>
            <div className={styles.favWord}>{f.word.toUpperCase()}</div>
            <div className={cx(shared.mono, styles.favCat)}>{f._cat?.toUpperCase()}</div>
          </button>
          <button className={cx(shared.iconBtn, shared.on)} onClick={() => app.toggleFav(f)}>
            <Icon name="star" size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
