import { useEffect, useState } from 'react';
import { laadDoelenMetCache } from '@/lib/doelenCache';
import type { Doel } from '@/types';

export function useDoelen() {
  const [doelen, setDoelen] = useState<Doel[]>([]);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<Error | null>(null);

  useEffect(() => {
    let actief = true;

    laadDoelenMetCache()
      .then((data) => {
        if (actief) {
          setDoelen(data);
          setLaden(false);
        }
      })
      .catch((err: unknown) => {
        if (actief) {
          setFout(err instanceof Error ? err : new Error('Fout bij laden doelen'));
          setLaden(false);
        }
      });

    return () => {
      actief = false;
    };
  }, []);

  return { doelen, laden, fout };
}
