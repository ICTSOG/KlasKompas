import { useEffect, useState } from 'react';
import { abonneerOpWeekAgenda } from '@/lib/db/agenda';
import type { AgendaItem } from '@/types';

export function useAgenda(
  schoolId: string | undefined,
  klasId: string | undefined,
  weekStart: string,
  weekEinde: string
) {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [laden, setLaden] = useState(Boolean(schoolId && klasId));
  const [fout, setFout] = useState<Error | null>(null);

  useEffect(() => {
    if (!schoolId || !klasId) {
      setItems([]);
      setLaden(false);
      return;
    }

    setLaden(true);
    const unsubscribe = abonneerOpWeekAgenda(
      schoolId,
      klasId,
      weekStart,
      weekEinde,
      (data) => {
        setItems(data);
        setLaden(false);
      },
      (err) => {
        setFout(err);
        setLaden(false);
      }
    );

    return unsubscribe;
  }, [schoolId, klasId, weekStart, weekEinde]);

  return { items, laden, fout };
}
