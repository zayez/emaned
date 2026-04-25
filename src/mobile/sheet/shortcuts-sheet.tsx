import { Fragment } from 'react';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './sheet.module.css';

export function ShortcutsSheet() {
  const keys: Array<[string, string]> = [
    ['Space', 'Generate'],
    ['C', 'Copy'],
    ['F', 'Favorite'],
    ['Esc', 'Close'],
  ];
  return (
    <div className={styles.shortcutsGrid}>
      {keys.map(([k, v]) => (
        <Fragment key={k}>
          <kbd className={cx(shared.mono, styles.kbd)}>{k}</kbd>
          <span className={styles.kbdLabel}>{v}</span>
        </Fragment>
      ))}
    </div>
  );
}
