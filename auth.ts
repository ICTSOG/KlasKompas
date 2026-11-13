import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  verifyBeforeUpdateEmail,
  type User,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { dbPaths } from './paths';
import { gebruikerConverter } from './db/converters';
import type { Gebruiker } from '@/types';

export const ACCOUNT_NIET_GEACTIVEERD_MELDING =
  'Je account is nog niet geactiveerd. Neem contact op met je beheerder.';

export function vertaalAuthFout(fout: unknown): string {
  if (!fout || typeof fout !== 'object') {
    return 'Er is een onbekende fout opgetreden. Probeer het opnieuw.';
  }

  const code = 'code' in fout ? String((fout as { code?: unknown }).code) : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Ongeldig e-mailadres of wachtwoord. Controleer je gegevens en probeer opnieuw.';
    case 'auth/invalid-email':
      return 'Dit e-mailadres is niet geldig. Controleer de schrijfwijze.';
    case 'auth/user-disabled':
      return 'Dit account is uitgeschakeld. Neem contact op met je beheerder.';
    case 'auth/too-many-requests':
      return 'Te veel mislukte pogingen na elkaar. Wacht enkele minuten en probeer opnieuw, of vraag een nieuw wachtwoord aan.';
    case 'auth/network-request-failed':
      return 'Je toestel lijkt offline of het netwerk is onbereikbaar. Controleer je internetverbinding.';
    case 'auth/weak-password':
      return 'Kies een sterker wachtwoord van minstens 8 tekens.';
    case 'auth/requires-recent-login':
      return 'Voor je veiligheid moet je eerst je huidige wachtwoord bevestigen.';
    case 'auth/email-already-in-use':
      return 'Dit e-mailadres is al in gebruik bij een ander account.';
    default:
      if (fout instanceof Error && fout.message) {
        return fout.message;
      }
      return 'Aanmelden is niet gelukt. Probeer het later opnieuw.';
  }
}

export async function haalGebruikerProfiel(uid: string): Promise<Gebruiker | null> {
  const snap = await getDoc(
    doc(db, dbPaths.gebruiker(uid)).withConverter(gebruikerConverter)
  );
  if (!snap.exists()) {
    return null;
  }
  const data = snap.data();
  return {
    ...data,
    uid: snap.id,
    klasIds: Array.isArray(data.klasIds) ? data.klasIds : [],
  };
}

export async function meldAanMetEmail(
  email: string,
  wachtwoord: string
): Promise<Gebruiker> {
  const schoonEmail = email.trim();
  const credential = await signInWithEmailAndPassword(auth, schoonEmail, wachtwoord);
  const profiel = await haalGebruikerProfiel(credential.user.uid);

  if (!profiel || profiel.status !== 'actief') {
    await signOut(auth);
    throw new Error(ACCOUNT_NIET_GEACTIVEERD_MELDING);
  }

  return profiel;
}

export async function meldAf(): Promise<void> {
  await signOut(auth);
}

export async function verstuurWachtwoordReset(email: string): Promise<void> {
  const schoonEmail = email.trim();
  if (!schoonEmail) {
    throw new Error('Vul eerst je e-mailadres in.');
  }
  await sendPasswordResetEmail(auth, schoonEmail);
}

export function luisterNaarAuthStatus(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function werkEigenNaamBij(
  uid: string,
  gegevens: { voornaam: string; familienaam: string }
): Promise<void> {
  const voornaam = gegevens.voornaam.trim();
  const familienaam = gegevens.familienaam.trim();

  if (!voornaam || !familienaam) {
    throw new Error('Voornaam en familienaam zijn verplicht.');
  }

  await updateDoc(doc(db, dbPaths.gebruiker(uid)), {
    voornaam,
    familienaam,
  });
}

export async function werkEigenEmailBij(
  nieuwEmail: string,
  huidigWachtwoord: string
): Promise<{ verificatieVerzonden: boolean }> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('Je bent niet aangemeld.');
  }

  const schoonEmail = nieuwEmail.trim();
  if (!schoonEmail) {
    throw new Error('Vul een geldig nieuw e-mailadres in.');
  }

  const cred = EmailAuthProvider.credential(user.email, huidigWachtwoord);
  await reauthenticateWithCredential(user, cred);

  try {
    await updateEmail(user, schoonEmail);
    await updateDoc(doc(db, dbPaths.gebruiker(user.uid)), {
      email: schoonEmail,
    });
    return { verificatieVerzonden: false };
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: unknown }).code)
        : '';
    if (code === 'auth/operation-not-allowed') {
      await verifyBeforeUpdateEmail(user, schoonEmail);
      return { verificatieVerzonden: true };
    }
    throw err;
  }
}

export async function wijzigEigenWachtwoord(
  huidigWachtwoord: string,
  nieuwWachtwoord: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('Je bent niet aangemeld.');
  }

  if (nieuwWachtwoord.length < 8) {
    throw new Error('Kies een nieuw wachtwoord van minstens 8 tekens.');
  }

  const cred = EmailAuthProvider.credential(user.email, huidigWachtwoord);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, nieuwWachtwoord);
}
