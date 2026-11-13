import { useEffect, useState } from 'react';
import { abonneerOpKeuzebord } from '@/lib/db/borden';
import type { Keuzebord } from '@/types';

export function useKeuzebord(
  schoolId: string | undefined,
  agendaId: string | undefined
) {
  const [bord, setBord] = useState<Keuzebord | null>(null);
  const [laden, setLaden] = useState(Boolean(schoolId && agendaId));
  const [fout, setFout] = useState<Error | null>(null);

  useEffect(() => {
    if (!schoolId || !agendaId) {
      setBord(null);
      setLaden(false);
      return;
    }

    setLaden(true);
    const unsubscribe = abonneerOpKeuzebord(
      schoolId,
      agendaId,
      (data) => {
        setBord(data);
        setLaden(false);
      },
      (err) => {
        setFout(err);
        setLaden(false);
      }
    );

    return unsubscribe;
  }, [schoolId, agendaId]);

  return { bord, laden, fout };
}
