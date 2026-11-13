import { useEffect, useState } from 'react';
import {
  abonneerOpSchoolGebruikers,
  maakSchoolGebruiker,
  werkSchoolGebruikerBij,
  zetGebruikerInactief,
  type BewerkGebruikerInvoer,
  type NieuweGebruikerInvoer,
} from '@/lib/db/gebruikers';
import { vertaalAuthFout, verstuurWachtwoordReset } from '@/lib/auth';
import { useAuth } from './useAuth';
import { useActieveSchool } from './useSchoolContext';
import type { Gebruiker } from '@/types';

export function useGebruikers() {
  const { gebruiker, isIngelogd } = useAuth();
  const { actieveSchoolId } = useActieveSchool();
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([]);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<Error | null>(null);

  const magGebruikersLezen =
    gebruiker?.rol === 'schoolbeheerder' || gebruiker?.rol === 'superbeheerder';

  useEffect(() => {
    if (!isIngelogd || !magGebruikersLezen || !actieveSchoolId) {
      setGebruikers([]);
      setLaden(false);
      return;
    }

    setLaden(true);
    setFout(null);

    const unsubscribe = abonneerOpSchoolGebruikers(
      actieveSchoolId,
      (lijst) => {
        setGebruikers(lijst);
        setLaden(false);
      },
      (err) => {
        setFout(err);
        setLaden(false);
      }
    );

    return unsubscribe;
  }, [isIngelogd, magGebruikersLezen, actieveSchoolId]);

  async function gebruikerToevoegen(invoer: NieuweGebruikerInvoer) {
    if (!actieveSchoolId) throw new Error('Geen school geselecteerd.');
    try {
      return await maakSchoolGebruiker(actieveSchoolId, invoer);
    } catch (err) {
      throw new Error(vertaalAuthFout(err));
    }
  }

  async function gebruikerBijwerken(
    doelGebruiker: Gebruiker,
    wijzigingen: BewerkGebruikerInvoer
  ) {
    if (!actieveSchoolId) throw new Error('Geen school geselecteerd.');
    try {
      await werkSchoolGebruikerBij(actieveSchoolId, doelGebruiker, wijzigingen);
    } catch (err) {
      throw new Error(vertaalAuthFout(err));
    }
  }

  async function gebruikerInactiefZetten(uid: string) {
    try {
      await zetGebruikerInactief(uid);
    } catch (err) {
      throw new Error(vertaalAuthFout(err));
    }
  }

  async function resetMailOpnieuwSturen(email: string) {
    try {
      await verstuurWachtwoordReset(email);
    } catch (err) {
      throw new Error(vertaalAuthFout(err));
    }
  }

  return {
    gebruikers,
    laden,
    fout,
    gebruikerToevoegen,
    gebruikerBijwerken,
    gebruikerInactiefZetten,
    resetMailOpnieuwSturen,
  };
}
