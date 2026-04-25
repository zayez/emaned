import type { ReactNode } from 'react';
import { Icon } from '../../components/icon/icon';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './modal.module.css';

interface Props {
  children: ReactNode;
  title: string;
  onClose: () => void;
}

export function Modal({ children, title, onClose }: Props) {
  return (
    <div className={cx(shared.fadeIn, styles.modalScrim)} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <div className={cx(shared.mono, styles.modalTitle)}>{title.toUpperCase()}</div>
          <button className={shared.iconBtn} onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
