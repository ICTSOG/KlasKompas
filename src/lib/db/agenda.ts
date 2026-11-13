import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dbPaths } from '@/lib/paths';
import { agendaConverter } from './converters';
import type { AgendaItem, NieuwSchoolDocument } from '@/types';

export function agendaCollectie(schoolId: string) {
  return collection(db, dbPaths.agenda(schoolId)).withConverter(agendaConverter);
}

export function agendaItemDoc(schoolId: string, agendaId: string) {
  return doc(db, dbPaths.agendaItem(schoolId, agendaId)).withConverter(agendaConverter);
}

export function abonneerOpWeekAgenda(
  schoolId: string,
  klasId: string,
  weekStart: string,
  weekEinde: string,
  onData: (items: AgendaItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    agendaCollectie(schoolId),
    where('klasId', '==', klasId),
    where('datum', '>=', weekStart),
    where('datum', '<=', weekEinde),
    orderBy('datum', 'asc'),
    orderBy('start', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data())),
    onError
  );
}

export async function maakAgendaItem(
  schoolId: string,
  data: NieuwSchoolDocument<AgendaItem>
): Promise<string> {
  const nu = serverTimestamp();
  const ref = await addDoc(collection(db, dbPaths.agenda(schoolId)), {
    ...data,
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  });
  return ref.id;
}

export async function werkAgendaItemBij(
  schoolId: string,
  agendaId: string,
  wijzigingen: Partial<NieuwSchoolDocument<AgendaItem>>
): Promise<void> {
  await updateDoc(doc(db, dbPaths.agendaItem(schoolId, agendaId)), {
    ...wijzigingen,
    gewijzigdOp: serverTimestamp(),
  });
}
