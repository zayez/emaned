export type IconName =
  | 'star'
  | 'copy'
  | 'check'
  | 'moon'
  | 'sun'
  | 'help'
  | 'x'
  | 'filter'
  | 'clock'
  | 'aa'
  | 'info'
  | 'menu'
  | 'arrow';

const PATHS: Record<IconName, string> = {
  star: 'M10 2l2.4 5.2 5.6.5-4.3 3.9 1.3 5.6L10 14.3 4.9 17.2l1.3-5.6L2 7.7l5.6-.5z',
  copy: 'M7 7V4A2 2 0 019 2h7a2 2 0 012 2v7a2 2 0 01-2 2h-3M4 7h7a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z',
  check: 'M4 10l4 4 8-8',
  moon: 'M15.5 11.5A5.5 5.5 0 019 5a5.5 5.5 0 00-.5 10.9 5.5 5.5 0 007-4.4z',
  sun: 'M10 3V1M10 19v-2M3 10H1M19 10h-2M5.3 5.3L3.9 3.9M16.1 16.1l-1.4-1.4M5.3 14.7l-1.4 1.4M16.1 3.9l-1.4 1.4M10 14.5A4.5 4.5 0 1014.5 10 4.5 4.5 0 0010 14.5z',
  help: 'M10 14v.01M10 11.5c0-2 2.5-2 2.5-4a2.5 2.5 0 10-5 0',
  x: 'M4 4l12 12M16 4L4 16',
  filter: 'M3 5h14M6 10h8M8.5 15h3',
  clock: 'M10 6v4l3 2M10 18a8 8 0 110-16 8 8 0 010 16z',
  aa: 'M3 17L7.5 5h1L13 17M5 13h6M16 10v6h-1.5M17 11l-1.5-1M13.5 14a2 2 0 104 0v-3',
  info: 'M10 14V9M10 7v.01M10 18a8 8 0 110-16 8 8 0 010 16z',
  menu: 'M3 6h14M3 10h14M3 14h14',
  arrow: 'M4 10h12M10 4l6 6-6 6',
};

interface Props {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
