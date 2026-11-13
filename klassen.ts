import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dbPaths } from '@/lib/paths';
import { klasConverter } from './converters';
import type { Klas } from '@/types';

export function klassenCollectie(schoolId: string) {
  return collection(db, dbPaths.klassen(schoolId)).withConverter(klasConverter);
}

export function klasDoc(schoolId: string, klasId: string) {
  return doc(db, dbPaths.klas(schoolId, klasId)).withConverter(klasConverter);
}

export async function haalKlassenVoorLeerkracht(
  schoolId: string,
  leerkrachtUid: string
): Promise<Klas[]> {
  const q = query(
    klassenCollectie(schoolId),
    where('leerkrachtIds', 'array-contains', leerkrachtUid)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export function abonneerOpSchoolKlassen(
  schoolId: string,
  onData: (klassen: Klas[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    klassenCollectie(schoolId),
    (snap) => {
      const lijst = snap.docs
        .map((d) => ({
          ...d.data(),
          leerkrachtIds: Array.isArray(d.data().leerkrachtIds)
            ? d.data().leerkrachtIds
            : [],
        }))
        .sort((a, b) => a.naam.localeCompare(b.naam, 'nl-BE'));
      onData(lijst);
    },
    onError
  );
}

export function abonneerOpKlasIds(
  schoolId: string,
  klasIds: string[],
  onData: (klassen: Klas[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const uniekeIds = Array.from(new Set(klasIds)).filter(Boolean);
  if (uniekeIds.length === 0) {
    onData([]);
    return () => {};
  }

  const beperkteIds = uniekeIds.slice(0, 30);
  const q = query(
    klassenCollectie(schoolId),
    where(documentId(), 'in', beperkteIds)
  );

  return onSnapshot(
    q,
    (snap) => {
      const lijst = snap.docs
        .map((d) => ({
          ...d.data(),
          leerkrachtIds: Array.isArray(d.data().leerkrachtIds)
            ? d.data().leerkrachtIds
            : [],
        }))
        .filter((k) => uniekeIds.includes(k.id))
        .sort((a, b) => a.naam.localeCompare(b.naam, 'nl-BE'));
      onData(lijst);
    },
    onError
  );
}

export async function maakKlas(
  schoolId: string,
  naam: string,
  leerkrachtIds: string[]
): Promise<string> {
  const schoneNaam = naam.trim();
  if (!schoneNaam) {
    throw new Error('Vul een klasnaam in.');
  }

  const nieuweKlasRef = doc(collection(db, dbPaths.klassen(schoolId)));
  const nu = serverTimestamp();

  const batch = writeBatch(db);
  batch.set(nieuweKlasRef, {
    naam: schoneNaam,
    leerkrachtIds,
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  });

  for (const uid of leerkrachtIds) {
    batch.update(doc(db, dbPaths.gebruiker(uid)), {
      klasIds: arrayUnion(nieuweKlasRef.id),
    });
  }

  await batch.commit();
  return nieuweKlasRef.id;
}

export async function werkKlasBij(
  schoolId: string,
  bestaandeKlas: Klas,
  wijzigingen: { naam: string; leerkrachtIds: string[] }
): Promise<void> {
  const schoneNaam = wijzigingen.naam.trim();
  if (!schoneNaam) {
    throw new Error('Vul een klasnaam in.');
  }

  const oud = new Set(bestaandeKlas.leerkrachtIds ?? []);
  const nieuw = new Set(wijzigingen.leerkrachtIds);

  const batch = writeBatch(db);
  batch.update(doc(db, dbPaths.klas(schoolId, bestaandeKlas.id)), {
    naam: schoneNaam,
    leerkrachtIds: wijzigingen.leerkrachtIds,
    gewijzigdOp: serverTimestamp(),
  });

  for (const uid of nieuw) {
    if (!oud.has(uid)) {
      batch.update(doc(db, dbPaths.gebruiker(uid)), {
        klasIds: arrayUnion(bestaandeKlas.id),
      });
    }
  }
  for (const uid of oud) {
    if (!nieuw.has(uid)) {
      batch.update(doc(db, dbPaths.gebruiker(uid)), {
        klasIds: arrayRemove(bestaandeKlas.id),
      });
    }
  }

  await batch.commit();
}

export async function verwijderKlas(
  schoolId: string,
  klas: Klas
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, dbPaths.klas(schoolId, klas.id)));

  for (const uid of klas.leerkrachtIds ?? []) {
    batch.update(doc(db, dbPaths.gebruiker(uid)), {
      klasIds: arrayRemove(klas.id),
    });
  }

  await batch.commit();
}

export async function verwijderKlasAlleenDoc(
  schoolId: string,
  klasId: string
): Promise<void> {
  await deleteDoc(doc(db, dbPaths.klas(schoolId, klasId)));
}
