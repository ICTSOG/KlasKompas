import {
  collection,
  doc,
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
