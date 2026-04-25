import type { EmanedApp } from '../../hooks/use-emaned';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './history-strip.module.css';

export function HistoryStrip({ app }: { app: EmanedApp }) {
  return (
    <footer className={styles.history}>
      <span className={cx(shared.mono, styles.historyLabel)}>HISTORY</span>
      {app.history.length === 0 ? (
        <span className={cx(shared.mono, styles.historyEmpty)}>— the strip fills as you draw.</span>
      ) : (
        app.history.map((h, i) => (
          <button
            key={h.word + i}
            onClick={() => app.setCurrent(h)}
            className={cx(shared.mono, styles.historyItem)}
          >
            {h.word}
          </button>
        ))
      )}
    </footer>
  );
}
