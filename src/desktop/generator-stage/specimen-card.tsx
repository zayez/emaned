import { type CSSProperties } from 'react';
import type { EmanedApp } from '../../hooks/use-emaned';
import { Icon } from '../../components/icon/icon';
import { specimenRows } from '../../components/specimen-meta/specimen-meta';
import { CASE_CHOICES } from '../../constants';
import type { Specimen } from '../../domain/types';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './generator-stage.module.css';

interface Props {
  w: Specimen;
  app: EmanedApp;
  copied: boolean;
  onCopy: () => void;
}

export function SpecimenCard({ w, app, copied, onCopy }: Props) {
  const rows = specimenRows(w);
  const cols = Math.max(5, rows.length);
  return (
    <div>
      <div
        className={styles.specimenGrid}
        style={{ '--row-count': cols } as CSSProperties}
      >
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className={cx(shared.mono, styles.rowKey)}>{k}</div>
            <div className={styles.rowValue}>{v}</div>
          </div>
        ))}
      </div>
      <div className={styles.actionsRow}>
        <div className={styles.actionsLeft}>
          <button className={shared.iconBtn} title="Copy (C)" onClick={onCopy}>
            <Icon name={copied ? 'check' : 'copy'} size={14} />
          </button>
          <button
            className={cx(shared.iconBtn, app.isFav(w) && shared.on)}
            title="Favorite (F)"
            onClick={() => app.toggleFav(w)}
          >
            <Icon name="star" size={14} />
          </button>
          <span className={cx(shared.mono, styles.caseLabel)}>CASE</span>
          {CASE_CHOICES.map((c) => (
            <button
              key={c.id}
              onClick={() => app.setCasing(c.id)}
              className={cx(shared.chip, styles.caseChip, app.casing === c.id && shared.on)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button className={shared.generate} onClick={app.generate}>
          Generate <span className={cx(shared.mono, shared.spaceHint)}>SPACE</span>
        </button>
      </div>
    </div>
  );
}
