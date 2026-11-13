import {
  collection,
  deleteField,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dbPaths } from '@/lib/paths';
import { leerlingConverter } from './converters';
import type { Leerling } from '@/types';

export function leerlingenCollectie(schoolId: string) {
  return collection(db, dbPaths.leerlingen(schoolId)).withConverter(
    leerlingConverter
  );
}

export function abonneerOpSchoolLeerlingen(
  schoolId: string,
  onData: (leerlingen: Leerling[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    leerlingenCollectie(schoolId),
    (snap) => {
      const lijst = snap.docs
        .map((d) => d.data())
        .sort((a, b) =>
          `${a.familienaam} ${a.voornaam}`.localeCompare(
            `${b.familienaam} ${b.voornaam}`,
            'nl-BE'
          )
        );
      onData(lijst);
    },
    onError
  );
}

export function abonneerOpKlasIdsLeerlingen(
  schoolId: string,
  klasIds: string[],
  onData: (leerlingen: Leerling[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const uniekeIds = Array.from(new Set(klasIds)).filter(Boolean);
  if (uniekeIds.length === 0) {
    onData([]);
    return () => {};
  }

  const beperkteIds = uniekeIds.slice(0, 30);
  const q = query(
    leerlingenCollectie(schoolId),
    where('klasId', 'in', beperkteIds)
  );

  return onSnapshot(
    q,
    (snap) => {
      const lijst = snap.docs
        .map((d) => d.data())
        .sort((a, b) =>
          `${a.familienaam} ${a.voornaam}`.localeCompare(
            `${b.familienaam} ${b.voornaam}`,
            'nl-BE'
          )
        );
      onData(lijst);
    },
    onError
  );
}

export interface LeerlingInvoer {
  voornaam: string;
  familienaam: string;
  geboortedatum: string; // YYYY-MM-DD
  klasId: string;
  fotoId?: string;
  iconId?: string;
}

/**
 * Maakt een leerling aan in leerlingen/{id} en houdt leerlingBord/{id} atomisch synchroon.
 */
export async function maakLeerling(
  schoolId: string,
  invoer: LeerlingInvoer
): Promise<string> {
  const voornaam = invoer.voornaam.trim();
  const familienaam = invoer.familienaam.trim();

  if (!voornaam || !familienaam || !invoer.geboortedatum || !invoer.klasId) {
    throw new Error('Vul voornaam, familienaam, geboortedatum en klas in.');
  }

  const leerlingRef = doc(collection(db, dbPaths.leerlingen(schoolId)));
  const bordRef = doc(db, dbPaths.leerlingBord(schoolId, leerlingRef.id));
  const nu = serverTimestamp();

  const leerlingDocData: Record<string, unknown> = {
    voornaam,
    familienaam,
    geboortedatum: invoer.geboortedatum,
    klasId: invoer.klasId,
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  };
  if (invoer.fotoId) leerlingDocData.fotoId = invoer.fotoId;
  if (invoer.iconId) leerlingDocData.iconId = invoer.iconId;

  const bordDocData: Record<string, unknown> = {
    klasId: invoer.klasId,
    voornaam,
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  };
  if (invoer.fotoId) bordDocData.fotoId = invoer.fotoId;
  if (invoer.iconId) bordDocData.iconId = invoer.iconId;

  const batch = writeBatch(db);
  batch.set(leerlingRef, leerlingDocData);
  batch.set(bordRef, bordDocData);
  await batch.commit();

  return leerlingRef.id;
}

/**
 * Werkt leerlinggegevens bij en houdt leerlingBord/{id} automatisch synchroon.
 */
export async function werkLeerlingBij(
  schoolId: string,
  leerlingId: string,
  invoer: LeerlingInvoer
): Promise<void> {
  const voornaam = invoer.voornaam.trim();
  const familienaam = invoer.familienaam.trim();

  if (!voornaam || !familienaam || !invoer.geboortedatum || !invoer.klasId) {
    throw new Error('Vul voornaam, familienaam, geboortedatum en klas in.');
  }

  const leerlingRef = doc(db, dbPaths.leerling(schoolId, leerlingId));
  const bordRef = doc(db, dbPaths.leerlingBord(schoolId, leerlingId));
  const nu = serverTimestamp();

  const batch = writeBatch(db);
  batch.update(leerlingRef, {
    voornaam,
    familienaam,
    geboortedatum: invoer.geboortedatum,
    klasId: invoer.klasId,
    fotoId: invoer.fotoId ? invoer.fotoId : deleteField(),
    iconId: invoer.iconId ? invoer.iconId : deleteField(),
    gewijzigdOp: nu,
  });

  // Set met merge zodat leerlingBord/{id} ook hersteld wordt als het ontbrak
  batch.set(
    bordRef,
    {
      klasId: invoer.klasId,
      voornaam,
      fotoId: invoer.fotoId ? invoer.fotoId : deleteField(),
      iconId: invoer.iconId ? invoer.iconId : deleteField(),
      aangemaaktOp: nu,
      gewijzigdOp: nu,
    },
    { merge: true }
  );

  await batch.commit();
}

export async function verwijderLeerling(
  schoolId: string,
  leerlingId: string
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, dbPaths.leerling(schoolId, leerlingId)));
  batch.delete(doc(db, dbPaths.leerlingBord(schoolId, leerlingId)));
  await batch.commit();
}

export async function importeerLeerlingenBatch(
  schoolId: string,
  rijen: LeerlingInvoer[]
): Promise<number> {
  if (rijen.length === 0) return 0;

  // Max 200 leerlingen per batch (= 400 writes, ruim onder Firestore-limiet van 500)
  const chunkGrootte = 200;
  let geimporteerd = 0;

  for (let i = 0; i < rijen.length; i += chunkGrootte) {
    const deel = rijen.slice(i, i + chunkGrootte);
    const batch = writeBatch(db);
    const nu = serverTimestamp();

    for (const rij of deel) {
      const leerlingRef = doc(collection(db, dbPaths.leerlingen(schoolId)));
      const bordRef = doc(db, dbPaths.leerlingBord(schoolId, leerlingRef.id));

      batch.set(leerlingRef, {
        voornaam: rij.voornaam.trim(),
        familienaam: rij.familienaam.trim(),
        geboortedatum: rij.geboortedatum,
        klasId: rij.klasId,
        aangemaaktOp: nu,
        gewijzigdOp: nu,
      });

      batch.set(bordRef, {
        klasId: rij.klasId,
        voornaam: rij.voornaam.trim(),
        aangemaaktOp: nu,
        gewijzigdOp: nu,
      });

      geimporteerd += 1;
    }

    await batch.commit();
  }

  return geimporteerd;
}
