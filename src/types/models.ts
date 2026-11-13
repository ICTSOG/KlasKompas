import type { Timestamp } from 'firebase/firestore';
import type { Doel } from './doelen';

export type GebruikersRol = 'superbeheerder' | 'schoolbeheerder' | 'leerkracht';
export type GebruikersStatus = 'actief' | 'inactief';

export interface SchoolTimestamps {
  aangemaaktOp: Timestamp;
  gewijzigdOp: Timestamp;
}

export type NieuwSchoolDocument<T extends SchoolTimestamps> = Omit<
  T,
  'id' | 'aangemaaktOp' | 'gewijzigdOp'
>;

// --- Top-level documenten ---

export interface Gebruiker {
  uid: string;
  email: string;
  voornaam: string;
  familienaam: string;
  rol: GebruikersRol;
  schoolId: string;
  klasIds: string[];
  status: GebruikersStatus;
}

export interface SchoolInstellingen {
  schooljaar?: string;
  startUur?: string;
  eindUur?: string;
  standaardKleur?: string;
  [sleutel: string]: unknown;
}

export interface School {
  id: string;
  naam: string;
  logo?: string;
  instellingen: SchoolInstellingen;
  actief: boolean;
}

export interface PlatformInstellingen {
  sitenaam: string;
  logo?: string;
  kleuren: {
    primair: string;
    accent: string;
  };
  standaardTaal: string;
  modules: {
    keuzebord: boolean;
    observaties: boolean;
    doelen: boolean;
    inzichten: boolean;
  };
  mededeling?: string;
}

export interface Koppelcode {
  code: string;
  schoolId: string;
  klasId: string;
  geldigTot: Timestamp;
}

export interface Toestel {
  uid: string;
  schoolId: string;
  klasId: string;
  naam: string;
  code: string;
  gekoppeldOp: Timestamp;
}

// --- Subcollecties onder scholen/{schoolId} ---

export interface Klas extends SchoolTimestamps {
  id: string;
  naam: string;
  leerkrachtIds: string[];
}

export interface Leerling extends SchoolTimestamps {
  id: string;
  voornaam: string;
  familienaam: string;
  geboortedatum: string; // YYYY-MM-DD
  klasId: string;
  fotoId?: string;
  iconId?: string;
}

export interface LeerlingBord extends SchoolTimestamps {
  id: string;
  klasId: string;
  voornaam: string;
  iconId?: string;
  fotoId?: string;
}

export type IconDoelgroep = 'leerlingen' | 'activiteiten';

export interface IconBibliotheek extends SchoolTimestamps {
  id: string;
  naam: string;
  doelgroep: IconDoelgroep;
}

export interface IcoonItem extends SchoolTimestamps {
  id: string;
  naam: string;
  dataUrl: string;
}

export interface Keuzeactiviteit extends SchoolTimestamps {
  id: string;
  klasId: string;
  naam: string;
  iconId: string;
  plaatsen: number;
}

export interface AgendaAanbodItem {
  keuzeactiviteitId: string;
  plaatsen: number;
  lesplanId?: string;
  voor: 'iedereen' | string[]; // "iedereen" of leerlingIds[]
}

export interface AgendaItem extends SchoolTimestamps {
  id: string;
  klasId: string;
  datum: string; // YYYY-MM-DD
  start: string; // HH:mm
  einde: string; // HH:mm
  kleur: string;
  metKeuzebord: boolean;
  omschrijving: string;
  aanbod: AgendaAanbodItem[];
  doelIds: string[];
}

export interface Weekthema extends SchoolTimestamps {
  id: string;
  klasId: string;
  start: string; // YYYY-MM-DD
  einde: string; // YYYY-MM-DD
  naam: string; // max 80 tekens
  beschrijving: string;
  doelIds: string[];
}

export type BordStatus = 'klaar' | 'open' | 'afgesloten';

export interface Keuzebord extends SchoolTimestamps {
  agendaId: string;
  klasId: string;
  bezetting: Record<string, string[]>; // [keuzeactiviteitId]: leerlingIds[]
  status: BordStatus;
}

export type SessieFeedback = 1 | 2 | 3;

export interface KeuzeSessie extends SchoolTimestamps {
  id: string;
  klasId: string;
  leerlingId: string;
  keuzeactiviteitId: string;
  agendaId: string;
  start: Timestamp;
  einde?: Timestamp;
  feedback?: SessieFeedback;
  gezienDoor: string[];
}

export interface Observatie extends SchoolTimestamps {
  id: string;
  klasId: string;
  leerlingId: string;
  activiteitId?: string;
  datum: string; // YYYY-MM-DD
  tekst: string;
  mediaIds: string[];
  doelIds: string[];
  auteurId: string;
}

export type EvaluatieNiveau = 'niet' | 'bezig' | 'bereikt';

export interface Evaluatie extends SchoolTimestamps {
  id: string;
  klasId: string;
  leerlingId: string;
  doelId: string;
  niveau: EvaluatieNiveau;
  datum: string; // YYYY-MM-DD
  opmerking?: string;
}

export interface Doelencollectie extends SchoolTimestamps {
  id: string;
  naam: string;
  doelIds: string[];
  klasIds: string[];
  gearchiveerd: boolean;
}

export interface EigenDoel extends Doel, SchoolTimestamps {}

export interface Lesplan extends SchoolTimestamps {
  id: string;
  titel: string;
  inhoud: string;
  collectieIds: string[];
  kleur: string;
  gedeeld: boolean;
  auteurId: string;
}

export interface LesplanCollectie extends SchoolTimestamps {
  id: string;
  naam: string;
  kleur: string;
  eigenaarId: string;
}

export type MediaSoort = 'profiel' | 'observatie';

export interface MediaItem extends SchoolTimestamps {
  id: string;
  dataUrl: string;
  breedte: number;
  hoogte: number;
  soort: MediaSoort;
  klasId: string;
}

export interface AuditLog extends SchoolTimestamps {
  id: string;
  wie: string;
  wat: string;
  wanneer: Timestamp;
}
