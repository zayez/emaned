import type { EmanedApp } from '../../hooks/use-emaned';
import { Icon } from '../../components/icon/icon';
import type { Specimen } from '../../domain/types';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import { EmptySheet } from './empty-sheet';
import styles from './sheet.module.css';

interface Props {
  app: EmanedApp;
  onPick: (h: Specimen) => void;
}

export function HistorySheet({ app, onPick }: Props) {
  if (app.history.length === 0) return <EmptySheet line="no history yet. draw something." />;
  return (
    <div className={styles.list}>
      {app.history.map((h, i) => (
        <button key={h.word + i} onClick={() => onPick(h)} className={styles.historyItem}>
          <div>
            <div className={styles.historyWord}>{h.word.toUpperCase()}</div>
            <div className={cx(shared.mono, styles.historyCat)}>{h._cat?.toUpperCase()}</div>
          </div>
          <Icon name="arrow" size={14} />
        </button>
      ))}
    </div>
  );
}
