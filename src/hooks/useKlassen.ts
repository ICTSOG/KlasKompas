import { useEffect, useState } from 'react';
import { abonneerOpKlasIds, abonneerOpSchoolKlassen } from '@/lib/db/klassen';
import { useAuth } from './useAuth';
import type { Klas } from '@/types';

/**
 * Laadt klassen rekening houdend met de rol uit gebruikers/{uid}:
 * - leerkracht: uitsluitend klassen uit gebruiker.klasIds
 * - schoolbeheerder: alle klassen binnen gebruiker.schoolId
 * - superbeheerder: klassen van geselecteerde schoolId (of eigen schoolId)
 */
export function useKlassen(overrideSchoolId?: string) {
  const { gebruiker, isIngelogd } = useAuth();
  const [klassen, setKlassen] = useState<Klas[]>([]);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<Error | null>(null);

  const doelSchoolId =
    gebruiker?.rol === 'superbeheerder'
      ? overrideSchoolId || gebruiker.schoolId
      : gebruiker?.schoolId;

  const leerkrachtKlasIdsSleutel =
    gebruiker?.rol === 'leerkracht' ? gebruiker.klasIds.join(',') : '';

  useEffect(() => {
    if (!isIngelogd || !gebruiker || !doelSchoolId) {
      setKlassen([]);
      setLaden(false);
      return;
    }

    setLaden(true);
    setFout(null);

    if (gebruiker.rol === 'leerkracht') {
      const unsubscribe = abonneerOpKlasIds(
        doelSchoolId,
        gebruiker.klasIds,
        (lijst) => {
          setKlassen(lijst);
          setLaden(false);
        },
        (err) => {
          setFout(err);
          setKlassen([]);
          setLaden(false);
        }
      );
      return unsubscribe;
    }

    const unsubscribe = abonneerOpSchoolKlassen(
      doelSchoolId,
      (lijst) => {
        setKlassen(lijst);
        setLaden(false);
      },
      (err) => {
        setFout(err);
        setKlassen([]);
        setLaden(false);
      }
    );

    return unsubscribe;
  }, [isIngelogd, gebruiker, doelSchoolId, leerkrachtKlasIdsSleutel]);

  return { klassen, laden, fout };
}
