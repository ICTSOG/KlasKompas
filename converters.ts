import {
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type DocumentData,
} from 'firebase/firestore';
import type {
  Gebruiker,
  School,
  Koppelcode,
  Toestel,
  Klas,
  Leerling,
  LeerlingBord,
  IconBibliotheek,
  IcoonItem,
  Keuzeactiviteit,
  AgendaItem,
  Weekthema,
  Keuzebord,
  KeuzeSessie,
  Observatie,
  Evaluatie,
  Doelencollectie,
  EigenDoel,
  Lesplan,
  LesplanCollectie,
  MediaItem,
  AuditLog,
} from '@/types';

function maakConverter<T extends object>(
  idVeld: keyof T = 'id' as keyof T
): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T): DocumentData {
      const kopie: Record<string, unknown> = { ...(model as Record<string, unknown>) };
      delete kopie[idVeld as string];
      return kopie;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): T {
      const data = snapshot.data(options);
      return {
        ...data,
        [idVeld]: snapshot.id,
      } as T;
    },
  };
}

export const gebruikerConverter = maakConverter<Gebruiker>('uid');
export const schoolConverter = maakConverter<School>('id');
export const koppelcodeConverter = maakConverter<Koppelcode>('code');
export const toestelConverter = maakConverter<Toestel>('uid');

export const klasConverter = maakConverter<Klas>('id');
export const leerlingConverter = maakConverter<Leerling>('id');
export const leerlingBordConverter = maakConverter<LeerlingBord>('id');
export const iconBibliotheekConverter = maakConverter<IconBibliotheek>('id');
export const icoonConverter = maakConverter<IcoonItem>('id');
export const keuzeactiviteitConverter = maakConverter<Keuzeactiviteit>('id');
export const agendaConverter = maakConverter<AgendaItem>('id');
export const weekthemaConverter = maakConverter<Weekthema>('id');
export const bordConverter = maakConverter<Keuzebord>('agendaId');
export const sessieConverter = maakConverter<KeuzeSessie>('id');
export const observatieConverter = maakConverter<Observatie>('id');
export const evaluatieConverter = maakConverter<Evaluatie>('id');
export const doelencollectieConverter = maakConverter<Doelencollectie>('id');
export const eigenDoelConverter = maakConverter<EigenDoel>('id');
export const lesplanConverter = maakConverter<Lesplan>('id');
export const lesplanCollectieConverter = maakConverter<LesplanCollectie>('id');
export const mediaConverter = maakConverter<MediaItem>('id');
export const auditConverter = maakConverter<AuditLog>('id');
