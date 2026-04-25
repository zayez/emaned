import type { EmanedApp } from '../../hooks/use-emaned';
import { Icon, type IconName } from '../../components/icon/icon';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './bottom-nav.module.css';

export type SheetId = 'filter' | 'history' | 'case' | 'about' | 'favs' | 'shortcuts' | null;

interface NavItem {
  id: Exclude<SheetId, null>;
  label: string;
  icon: IconName;
  badge?: number;
}

interface Props {
  app: EmanedApp;
  onOpen: (s: SheetId) => void;
}

export function BottomNav({ app, onOpen }: Props) {
  const items: NavItem[] = [
    {
      id: 'filter',
      label: 'Filter',
      icon: 'filter',
      badge: (app.era ? 1 : 0) + app.vibes.length + (app.maxSyl ? 1 : 0),
    },
    { id: 'history', label: 'History', icon: 'clock', badge: app.history.length },
    { id: 'case', label: 'Case', icon: 'aa' },
    { id: 'about', label: 'About', icon: 'info' },
  ];
  return (
    <nav aria-label="Primary" className={styles.bottomNav}>
      {items.map((item) => (
        <button key={item.id} onClick={() => onOpen(item.id)} className={styles.navBtn}>
          <Icon name={item.icon} size={20} />
          <span className={cx(shared.mono, styles.navLabel)}>{item.label}</span>
          {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
        </button>
      ))}
    </nav>
  );
}
