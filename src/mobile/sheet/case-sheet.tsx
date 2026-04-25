import type { EmanedApp } from '../../hooks/use-emaned';
import { CASE_CHOICES } from '../../constants';
import { formatCase } from '../../domain/casing';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './sheet.module.css';

export function CaseSheet({ app }: { app: EmanedApp }) {
  return (
    <div className={styles.caseList}>
      {CASE_CHOICES.map((c) => (
        <button
          key={c.id}
          onClick={() => app.setCasing(c.id)}
          className={cx(styles.caseBtn, app.casing === c.id && styles.on)}
        >
          <span className={styles.caseLabel}>{c.label}</span>
          <span className={cx(shared.mono, styles.casePreview)}>
            {app.current ? formatCase(app.current.word, c.id) : formatCase('Annapurna', c.id)}
          </span>
        </button>
      ))}
    </div>
  );
}
