import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dbPaths } from '@/lib/paths';
import { bordConverter } from './converters';
import type { BordStatus, Keuzebord } from '@/types';

export function bordDoc(schoolId: string, agendaId: string) {
  return doc(db, dbPaths.bord(schoolId, agendaId)).withConverter(bordConverter);
}

export function abonneerOpKeuzebord(
  schoolId: string,
  agendaId: string,
  onData: (bord: Keuzebord | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    bordDoc(schoolId, agendaId),
    (snap) => onData(snap.exists() ? snap.data() : null),
    onError
  );
}

export async function initialiseerKeuzebord(
  schoolId: string,
  agendaId: string,
  klasId: string,
  status: BordStatus = 'klaar'
): Promise<void> {
  const nu = serverTimestamp();
  await setDoc(doc(db, dbPaths.bord(schoolId, agendaId)), {
    klasId,
    bezetting: {},
    status,
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  });
}

export async function werkBordBezettingBij(
  schoolId: string,
  agendaId: string,
  bezetting: Record<string, string[]>
): Promise<void> {
  await updateDoc(doc(db, dbPaths.bord(schoolId, agendaId)), {
    bezetting,
    gewijzigdOp: serverTimestamp(),
  });
}
