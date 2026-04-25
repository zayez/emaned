import { useEffect, useState } from 'react';
import { useEmaned } from './hooks/use-emaned';
import { Desktop } from './desktop/desktop';
import { Mobile } from './mobile/mobile';
import { MOBILE_BREAKPOINT } from './constants';

export function App() {
  const app = useEmaned();
  const [narrow, setNarrow] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return narrow ? <Mobile app={app} /> : <Desktop app={app} />;
}
