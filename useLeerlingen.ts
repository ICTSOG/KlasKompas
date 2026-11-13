import { useEffect, useState } from 'react';
import {
  abonneerOpKlasIdsLeerlingen,
  abonneerOpSchoolLeerlingen,
  importeerLeerlingenBatch,
  maakLeerling,
  verwijderLeerling,
  werkLeerlingBij,
  type LeerlingInvoer,
} from '@/lib/db/leerlingen';
import {
  abonneerOpKlasProfielfotos,
  abonneerOpSchoolProfielfotos,
  uploadProfielfoto,
} from '@/lib/db/media';
import { useAuth } from './useAuth';
import { useActieveSchool } from './useSchoolContext';
import type { Leerling, MediaItem } from '@/types';

export function useLeerlingen() {
  const { gebruiker, isIngelogd } = useAuth();
  const { actieveSchoolId } = useActieveSchool();
  const [leerlingen, setLeerlingen] = useState<Leerling[]>([]);
  const [profielfotos, setProfielfotos] = useState<Record<string, MediaItem>>({});
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<Error | null>(null);

  const leerkrachtKlasIdsSleutel =
    gebruiker?.rol === 'leerkracht' ? gebruiker.klasIds.join(',') : '';

  useEffect(() => {
    if (!isIngelogd || !gebruiker || !actieveSchoolId) {
      setLeerlingen([]);
      setProfielfotos({});
      setLaden(false);
      return;
    }

    setLaden(true);
    setFout(null);

    if (gebruiker.rol === 'leerkracht') {
      const unsubLeerlingen = abonneerOpKlasIdsLeerlingen(
        actieveSchoolId,
        gebruiker.klasIds,
        (lijst) => {
          setLeerlingen(lijst);
          setLaden(false);
        },
        (err) => {
          setFout(err);
          setLaden(false);
        }
      );

      const unsubMedia = abonneerOpKlasProfielfotos(
        actieveSchoolId,
        gebruiker.klasIds,
        (map) => setProfielfotos(map)
      );

      return () => {
        unsubLeerlingen();
        unsubMedia();
      };
    }

    const unsubLeerlingen = abonneerOpSchoolLeerlingen(
      actieveSchoolId,
      (lijst) => {
        setLeerlingen(lijst);
        setLaden(false);
      },
      (err) => {
        setFout(err);
        setLaden(false);
      }
    );

    const unsubMedia = abonneerOpSchoolProfielfotos(
      actieveSchoolId,
      (map) => setProfielfotos(map)
    );

    return () => {
      unsubLeerlingen();
      unsubMedia();
    };
  }, [isIngelogd, gebruiker, actieveSchoolId, leerkrachtKlasIdsSleutel]);

  async function leerlingToevoegen(invoer: LeerlingInvoer, fotoBestand?: File | null) {
    if (!actieveSchoolId) throw new Error('Geen school geselecteerd.');
    let fotoId = invoer.fotoId;
    if (fotoBestand) {
      fotoId = await uploadProfielfoto(actieveSchoolId, invoer.klasId, fotoBestand);
    }
    return maakLeerling(actieveSchoolId, {
      ...invoer,
      fotoId,
      iconId: fotoId ? undefined : invoer.iconId,
    });
  }

  async function leerlingBijwerken(
    leerlingId: string,
    invoer: LeerlingInvoer,
    fotoBestand?: File | null
  ) {
    if (!actieveSchoolId) throw new Error('Geen school geselecteerd.');
    let fotoId = invoer.fotoId;
    if (fotoBestand) {
      fotoId = await uploadProfielfoto(actieveSchoolId, invoer.klasId, fotoBestand);
    }
    await werkLeerlingBij(actieveSchoolId, leerlingId, {
      ...invoer,
      fotoId,
      iconId: fotoId ? undefined : invoer.iconId,
    });
  }

  async function leerlingVerwijderen(leerlingId: string) {
    if (!actieveSchoolId) throw new Error('Geen school geselecteerd.');
    await verwijderLeerling(actieveSchoolId, leerlingId);
  }

  async function leerlingenImporteren(rijen: LeerlingInvoer[]) {
    if (!actieveSchoolId) throw new Error('Geen school geselecteerd.');
    return importeerLeerlingenBatch(actieveSchoolId, rijen);
  }

  return {
    leerlingen,
    profielfotos,
    laden,
    fout,
    leerlingToevoegen,
    leerlingBijwerken,
    leerlingVerwijderen,
    leerlingenImporteren,
  };
}
