import type { ReactNode } from 'react';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './sheet.module.css';

export function EmptySheet({ line }: { line: ReactNode }) {
  return <div className={cx(shared.mono, styles.emptySheet)}>{line}</div>;
}
