import {
  collection,
  doc,
  documentId,
  getDocs,
  onSnapshot,
  query,
  where,
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
    (snap) => onData(snap.docs.map((d) => d.data())),
    onError
  );
}

/**
 * Abonneert uitsluitend op de klassen die aan de leerkracht zijn toegewezen (klasIds).
 */
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

  // Firestore 'in'-query ondersteunt tot 30 ID's per query
  const beperkteIds = uniekeIds.slice(0, 30);
  const q = query(
    klassenCollectie(schoolId),
    where(documentId(), 'in', beperkteIds)
  );

  return onSnapshot(
    q,
    (snap) => {
      const lijst = snap.docs
        .map((d) => d.data())
        .filter((k) => uniekeIds.includes(k.id));
      onData(lijst);
    },
    onError
  );
}
