import { Fragment } from 'react';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './modal.module.css';

export function ShortcutsContent() {
  const keys: Array<[string, string]> = [
    ['Space', 'Generate'],
    ['C', 'Copy to clipboard'],
    ['F', 'Toggle favorite'],
    ['?', 'This panel'],
    ['Esc', 'Close overlays'],
  ];
  return (
    <div>
      <div className={styles.shortcutsGrid}>
        {keys.map(([k, v]) => (
          <Fragment key={k}>
            <kbd className={cx(shared.mono, styles.kbd)}>{k}</kbd>
            <span className={styles.kbdLabel}>{v}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
