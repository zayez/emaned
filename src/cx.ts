/**
 * Tiny className combiner. Filters out falsy values so callers can write
 *
 *   cx(styles.chip, active && styles.on)
 *
 * without manually guarding the conditional branch.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
