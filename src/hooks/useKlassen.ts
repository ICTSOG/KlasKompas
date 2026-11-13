import { useEffect, useState } from 'react';
import { abonneerOpSchoolKlassen } from '@/lib/db/klassen';
import type { Klas } from '@/types';

export function useKlassen(schoolId?: string) {
  const [klassen, setKlassen] = useState<Klas[]>([]);
  const [laden, setLaden] = useState(Boolean(schoolId));
  const [fout, setFout] = useState<Error | null>(null);

  useEffect(() => {
    if (!schoolId) {
      setKlassen([]);
      setLaden(false);
      return;
    }

    setLaden(true);
    const unsubscribe = abonneerOpSchoolKlassen(
      schoolId,
      (lijst) => {
        setKlassen(lijst);
        setLaden(false);
      },
      (err) => {
        setFout(err);
        setLaden(false);
      }
    );

    return unsubscribe;
  }, [schoolId]);

  return { klassen, laden, fout };
}
