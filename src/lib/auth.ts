import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { dbPaths } from './paths';
import {
  gebruikerConverter,
  koppelcodeConverter,
  toestelConverter,
} from './db/converters';
import type { Gebruiker, Toestel } from '@/types';

export interface SessieContext {
  user: User | null;
  gebruiker: Gebruiker | null;
  toestel: Toestel | null;
}

export async function meldAanMetEmail(email: string, wachtwoord: string) {
  return signInWithEmailAndPassword(auth, email, wachtwoord);
}

export async function meldAf() {
  return signOut(auth);
}

export async function koppelKlasToestel(
  code: string,
  toestelNaam: string
): Promise<Toestel> {
  const genormaliseerdeCode = code.trim().toUpperCase();
  const credential = await signInAnonymously(auth);
  const uid = credential.user.uid;

  const codeSnap = await getDoc(
    doc(db, dbPaths.koppelcode(genormaliseerdeCode)).withConverter(koppelcodeConverter)
  );

  if (!codeSnap.exists()) {
    throw new Error('Ongeldige of verlopen koppelcode.');
  }

  const koppelData = codeSnap.data();
  await setDoc(doc(db, dbPaths.toestel(uid)), {
    schoolId: koppelData.schoolId,
    klasId: koppelData.klasId,
    naam: toestelNaam.trim() || 'Klastoestel',
    code: genormaliseerdeCode,
    gekoppeldOp: serverTimestamp(),
  });

  const toestelSnap = await getDoc(
    doc(db, dbPaths.toestel(uid)).withConverter(toestelConverter)
  );
  return toestelSnap.data()!;
}

export function luisterNaarSessie(callback: (ctx: SessieContext) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, gebruiker: null, toestel: null });
      return;
    }

    if (user.isAnonymous) {
      const toestelSnap = await getDoc(
        doc(db, dbPaths.toestel(user.uid)).withConverter(toestelConverter)
      );
      callback({
        user,
        gebruiker: null,
        toestel: toestelSnap.exists() ? toestelSnap.data() : null,
      });
      return;
    }

    const gebruikerSnap = await getDoc(
      doc(db, dbPaths.gebruiker(user.uid)).withConverter(gebruikerConverter)
    );
    callback({
      user,
      gebruiker: gebruikerSnap.exists() ? gebruikerSnap.data() : null,
      toestel: null,
    });
  });
}
