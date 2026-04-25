import { getTotal } from '../../domain/corpus';
import shared from '../../shared.module.css';
import { cx } from '../../cx';
import styles from './sheet.module.css';

const TOTAL = getTotal();

export function AboutSheet() {
  return (
    <div className={styles.about}>
      <p className={styles.aboutPara}>
        emaned is a static tool for drawing a single evocative word from curated taxonomies. {TOTAL} specimens across
        five categories, cross-filterable by vibe, era, and length.
      </p>
      <p className={styles.aboutMuted}>
        No accounts. No sync. Favorites and history live on this device only.
      </p>
      <div className={cx(shared.mono, styles.aboutLinks)}>
        <a
          href="https://github.com/zayez/emaned"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.aboutLink}
        >
          GitHub ↗
        </a>
        <a
          href="https://github.com/zayez/emaned/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.aboutLink}
        >
          MIT License ↗
        </a>
      </div>
      <p className={cx(shared.mono, styles.aboutVersion)}>v1 · mmxxvi</p>
    </div>
  );
}
