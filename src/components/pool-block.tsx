import type { EmanedApp } from '../hooks/use-emaned';

interface Props {
  app: EmanedApp;
  big?: boolean;
}

export function PoolBlock({ app, big = false }: Props) {
  const n = app.pool.length;
  const zero = n === 0;
  return (
    <div
      className="pool-block"
      data-zero={zero}
      style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}
    >
      <span
        className="mono"
        style={{ fontSize: 11, letterSpacing: '.2em', color: 'var(--muted)' }}
      >
        POOL
      </span>
      <span
        className="hero"
        style={{
          fontSize: big ? 96 : 64,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-.04em',
          fontStretch: '125%',
          color: zero ? 'var(--accent)' : 'var(--fg)',
        }}
      >
        {n}
      </span>
      <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
        of {app.total}
      </span>
    </div>
  );
}
