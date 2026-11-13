import { useEffect, useState } from 'react';
import {
  abonneerOpKlasIds,
  abonneerOpSchoolKlassen,
  maakKlas,
  verwijderKlas,
  werkKlasBij,
} from '@/lib/db/klassen';
import { useAuth } from './useAuth';
import { useActieveSchool } from './useSchoolContext';
import type { Klas } from '@/types';

export function useKlassen(overrideSchoolId?: string) {
  const { gebruiker, isIngelogd } = useAuth();
  const { actieveSchoolId } = useActieveSchool();
  const [klassen, setKlassen] = useState<Klas[]>([]);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<Error | null>(null);

  const doelSchoolId = overrideSchoolId ?? actieveSchoolId;
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

  async function klasToevoegen(naam: string, leerkrachtIds: string[]) {
    if (!doelSchoolId) throw new Error('Geen school geselecteerd.');
    return maakKlas(doelSchoolId, naam, leerkrachtIds);
  }

  async function klasBijwerken(
    bestaandeKlas: Klas,
    wijzigingen: { naam: string; leerkrachtIds: string[] }
  ) {
    if (!doelSchoolId) throw new Error('Geen school geselecteerd.');
    await werkKlasBij(doelSchoolId, bestaandeKlas, wijzigingen);
  }

  async function klasVerwijderen(klas: Klas) {
    if (!doelSchoolId) throw new Error('Geen school geselecteerd.');
    await verwijderKlas(doelSchoolId, klas);
  }

  return {
    klassen,
    laden,
    fout,
    klasToevoegen,
    klasBijwerken,
    klasVerwijderen,
  };
}
