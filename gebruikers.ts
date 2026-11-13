import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, firebaseConfig } from '@/lib/firebase';
import { dbPaths } from '@/lib/paths';
import { gebruikerConverter } from './converters';
import type { Gebruiker, GebruikersRol, GebruikersStatus } from '@/types';

export function gebruikersCollectie() {
  return collection(db, dbPaths.gebruikers()).withConverter(gebruikerConverter);
}

export function abonneerOpSchoolGebruikers(
  schoolId: string,
  onData: (gebruikers: Gebruiker[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(gebruikersCollectie(), where('schoolId', '==', schoolId));
  return onSnapshot(
    q,
    (snap) => {
      const lijst = snap.docs
        .map((d) => ({
          ...d.data(),
          klasIds: Array.isArray(d.data().klasIds) ? d.data().klasIds : [],
        }))
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

function genereerTijdelijkWachtwoord(): string {
  const tekens =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  const waarden = new Uint32Array(24);
  crypto.getRandomValues(waarden);
  return Array.from(waarden, (v) => tekens[v % tekens.length]).join('');
}

export interface NieuweGebruikerInvoer {
  email: string;
  voornaam: string;
  familienaam: string;
  rol: Extract<GebruikersRol, 'schoolbeheerder' | 'leerkracht'>;
  klasIds: string[];
}

/**
 * Maakt een gebruiker aan via een tweede, tijdelijke Firebase-app-instantie
 * zodat de aangemelde beheerder ingelogd blijft, zet een willekeurig wachtwoord,
 * maakt gebruikers/{uid} aan en verstuurt automatisch een wachtwoord-resetmail.
 */
export async function maakSchoolGebruiker(
  schoolId: string,
  invoer: NieuweGebruikerInvoer
): Promise<string> {
  const schoonEmail = invoer.email.trim().toLowerCase();
  const voornaam = invoer.voornaam.trim();
  const familienaam = invoer.familienaam.trim();

  if (!schoonEmail || !voornaam || !familienaam) {
    throw new Error('Vul e-mailadres, voornaam en familienaam in.');
  }

  const tijdelijkeAppNaam = `klasKompas-aanmaak-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  const secundaireApp = initializeApp(firebaseConfig, tijdelijkeAppNaam);
  const secundaireAuth = getAuth(secundaireApp);
  secundaireAuth.languageCode = 'nl';

  try {
    const tijdelijkWachtwoord = genereerTijdelijkWachtwoord();
    const credential = await createUserWithEmailAndPassword(
      secundaireAuth,
      schoonEmail,
      tijdelijkWachtwoord
    );
    const nieuweUid = credential.user.uid;

    const batch = writeBatch(db);
    batch.set(doc(db, dbPaths.gebruiker(nieuweUid)), {
      email: schoonEmail,
      voornaam,
      familienaam,
      rol: invoer.rol,
      schoolId,
      klasIds: invoer.klasIds,
      status: 'actief' as GebruikersStatus,
    });

    for (const klasId of invoer.klasIds) {
      batch.update(doc(db, dbPaths.klas(schoolId, klasId)), {
        leerkrachtIds: arrayUnion(nieuweUid),
        gewijzigdOp: serverTimestamp(),
      });
    }

    await batch.commit();

    // Stuur reset-mail zodat de gebruiker zelf een wachtwoord kiest
    await sendPasswordResetEmail(secundaireAuth, schoonEmail);
    await signOut(secundaireAuth);

    return nieuweUid;
  } finally {
    await deleteApp(secundaireApp).catch(() => {});
  }
}

export interface BewerkGebruikerInvoer {
  voornaam: string;
  familienaam: string;
  rol: Extract<GebruikersRol, 'schoolbeheerder' | 'leerkracht'>;
  klasIds: string[];
  status: GebruikersStatus;
}

export async function werkSchoolGebruikerBij(
  schoolId: string,
  gebruiker: Gebruiker,
  wijzigingen: BewerkGebruikerInvoer
): Promise<void> {
  const voornaam = wijzigingen.voornaam.trim();
  const familienaam = wijzigingen.familienaam.trim();

  if (!voornaam || !familienaam) {
    throw new Error('Voornaam en familienaam zijn verplicht.');
  }

  const oudeKlassen = new Set(gebruiker.klasIds ?? []);
  const nieuweKlassen = new Set(wijzigingen.klasIds);

  const batch = writeBatch(db);
  batch.update(doc(db, dbPaths.gebruiker(gebruiker.uid)), {
    voornaam,
    familienaam,
    rol: wijzigingen.rol,
    klasIds: wijzigingen.klasIds,
    status: wijzigingen.status,
  });

  // Synchroniseer leerkrachtIds op klassen
  for (const klasId of nieuweKlassen) {
    if (!oudeKlassen.has(klasId)) {
      batch.update(doc(db, dbPaths.klas(schoolId, klasId)), {
        leerkrachtIds: arrayUnion(gebruiker.uid),
        gewijzigdOp: serverTimestamp(),
      });
    }
  }
  for (const klasId of oudeKlassen) {
    if (!nieuweKlassen.has(klasId)) {
      batch.update(doc(db, dbPaths.klas(schoolId, klasId)), {
        leerkrachtIds: arrayRemove(gebruiker.uid),
        gewijzigdOp: serverTimestamp(),
      });
    }
  }

  await batch.commit();
}

export async function zetGebruikerInactief(uid: string): Promise<void> {
  await updateDoc(doc(db, dbPaths.gebruiker(uid)), {
    status: 'inactief' as GebruikersStatus,
  });
}

export async function herstelGebruikerProfiel(
  uid: string,
  data: Omit<Gebruiker, 'uid'>
): Promise<void> {
  await setDoc(doc(db, dbPaths.gebruiker(uid)), data);
}
