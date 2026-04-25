import type { ReactNode } from 'react';
import { Icon } from '../../components/icon/icon';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './sheet.module.css';

interface Props {
  children: ReactNode;
  title: string;
  onClose: () => void;
}

export function Sheet({ children, title, onClose }: Props) {
  return (
    <>
      <div onClick={onClose} className={cx(shared.fadeIn, styles.scrim)} />
      <div className={cx(shared.sheetEnter, styles.sheet)}>
        <div className={styles.sheetHandleSlot}>
          <div className={styles.sheetHandle} />
        </div>
        <div className={styles.sheetHeader}>
          <div className={styles.sheetTitle}>{title}</div>
          <button className={shared.iconBtn} onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
        <div className={styles.sheetBody}>{children}</div>
      </div>
    </>
  );
}
