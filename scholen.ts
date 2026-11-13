import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dbPaths } from '@/lib/paths';
import { schoolConverter } from './converters';
import type { School } from '@/types';

export function scholenCollectie() {
  return collection(db, dbPaths.scholen()).withConverter(schoolConverter);
}

export function schoolDoc(schoolId: string) {
  return doc(db, dbPaths.school(schoolId)).withConverter(schoolConverter);
}

export function abonneerOpAlleScholen(
  onData: (scholen: School[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(scholenCollectie(), orderBy('naam', 'asc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data())),
    onError
  );
}

export function abonneerOpSchool(
  schoolId: string,
  onData: (school: School | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    schoolDoc(schoolId),
    (snap) => onData(snap.exists() ? snap.data() : null),
    onError
  );
}

export async function maakSchool(naam: string): Promise<string> {
  const schoneNaam = naam.trim();
  if (!schoneNaam) {
    throw new Error('Vul een geldige schoolnaam in.');
  }

  const ref = await addDoc(collection(db, dbPaths.scholen()), {
    naam: schoneNaam,
    instellingen: {
      schooljaar: '2026-2027',
    },
    actief: true,
  });
  return ref.id;
}
