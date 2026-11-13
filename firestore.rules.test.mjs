import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'klaskompas-test';
const rules = readFileSync('firestore.rules', 'utf8');

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, 'scholen/school-1'), {
      naam: 'VBS De Kompasnaald',
      instellingen: {},
      actief: true,
    });

    await setDoc(doc(adminDb, 'gebruikers/admin-1'), {
      email: 'admin@school1.be',
      voornaam: 'Sofie',
      familienaam: 'Peeters',
      rol: 'schoolbeheerder',
      schoolId: 'school-1',
      klasIds: [],
      status: 'actief',
    });

    await setDoc(doc(adminDb, 'gebruikers/lk-1'), {
      email: 'jan@school1.be',
      voornaam: 'Jan',
      familienaam: 'Janssens',
      rol: 'leerkracht',
      schoolId: 'school-1',
      klasIds: ['klas-a'],
      status: 'actief',
    });

    await setDoc(doc(adminDb, 'gebruikers/lk-andere-school'), {
      email: 'else@school2.be',
      voornaam: 'Else',
      familienaam: 'Maes',
      rol: 'leerkracht',
      schoolId: 'school-2',
      klasIds: ['klas-x'],
      status: 'actief',
    });

    await setDoc(doc(adminDb, 'scholen/school-1/klassen/klas-a'), {
      naam: '1e kleuterklas',
      leerkrachtIds: ['lk-1'],
      aangemaaktOp: new Date(),
      gewijzigdOp: new Date(),
    });

    await setDoc(doc(adminDb, 'scholen/school-1/klassen/klas-b'), {
      naam: '2e kleuterklas',
      leerkrachtIds: [],
      aangemaaktOp: new Date(),
      gewijzigdOp: new Date(),
    });

    await setDoc(doc(adminDb, 'scholen/school-1/leerlingen/ll-a1'), {
      voornaam: 'Noor',
      familienaam: 'De Smet',
      geboortedatum: '2020-05-12',
      klasId: 'klas-a',
      aangemaaktOp: new Date(),
      gewijzigdOp: new Date(),
    });

    await setDoc(doc(adminDb, 'scholen/school-1/leerlingen/ll-b1'), {
      voornaam: 'Liam',
      familienaam: 'Vermeulen',
      geboortedatum: '2019-03-08',
      klasId: 'klas-b',
      aangemaaktOp: new Date(),
      gewijzigdOp: new Date(),
    });

    await setDoc(doc(adminDb, 'scholen/school-1/leerlingBord/ll-a1'), {
      voornaam: 'Noor',
      klasId: 'klas-a',
      aangemaaktOp: new Date(),
      gewijzigdOp: new Date(),
    });
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules — Fase 2 (klassen, leerlingen, leerlingBord)', () => {
  it('schoolbeheerder mag klassen lezen en aanmaken in eigen school', async () => {
    const db = testEnv.authenticatedContext('admin-1').firestore();

    await assertSucceeds(getDoc(doc(db, 'scholen/school-1/klassen/klas-b')));
    await assertSucceeds(
      setDoc(doc(db, 'scholen/school-1/klassen/klas-c'), {
        naam: '3e kleuterklas',
        leerkrachtIds: [],
        aangemaaktOp: serverTimestamp(),
        gewijzigdOp: serverTimestamp(),
      })
    );
  });

  it('leerkracht mag enkel zijn eigen klas lezen en geen klassen aanmaken', async () => {
    const db = testEnv.authenticatedContext('lk-1').firestore();

    await assertSucceeds(getDoc(doc(db, 'scholen/school-1/klassen/klas-a')));
    await assertFails(getDoc(doc(db, 'scholen/school-1/klassen/klas-b')));
    await assertFails(
      setDoc(doc(db, 'scholen/school-1/klassen/klas-nieuw'), {
        naam: 'Onbevoegde klas',
        leerkrachtIds: ['lk-1'],
        aangemaaktOp: serverTimestamp(),
        gewijzigdOp: serverTimestamp(),
      })
    );
  });

  it('leerkracht ziet en bewerkt enkel leerlingen van zijn eigen klas', async () => {
    const db = testEnv.authenticatedContext('lk-1').firestore();

    await assertSucceeds(getDoc(doc(db, 'scholen/school-1/leerlingen/ll-a1')));
    await assertFails(getDoc(doc(db, 'scholen/school-1/leerlingen/ll-b1')));

    await assertSucceeds(
      updateDoc(doc(db, 'scholen/school-1/leerlingen/ll-a1'), {
        voornaam: 'Noor-Marie',
        gewijzigdOp: serverTimestamp(),
      })
    );

    // Mag leerling niet naar een andere klas verplaatsen waar hij geen leerkracht van is
    await assertFails(
      updateDoc(doc(db, 'scholen/school-1/leerlingen/ll-a1'), {
        klasId: 'klas-b',
        gewijzigdOp: serverTimestamp(),
      })
    );
  });

  it('leerlingBord weigert gevoelige velden zoals familienaam of geboortedatum', async () => {
    const db = testEnv.authenticatedContext('admin-1').firestore();

    await assertSucceeds(
      setDoc(doc(db, 'scholen/school-1/leerlingBord/ll-nieuw'), {
        voornaam: 'Mila',
        klasId: 'klas-a',
        aangemaaktOp: serverTimestamp(),
        gewijzigdOp: serverTimestamp(),
      })
    );

    await assertFails(
      setDoc(doc(db, 'scholen/school-1/leerlingBord/ll-fout'), {
        voornaam: 'Mila',
        familienaam: 'Verboden',
        klasId: 'klas-a',
        aangemaaktOp: serverTimestamp(),
        gewijzigdOp: serverTimestamp(),
      })
    );
  });

  it('gebruiker uit een andere school heeft geen toegang tot school-1', async () => {
    const db = testEnv.authenticatedContext('lk-andere-school').firestore();

    await assertFails(getDoc(doc(db, 'scholen/school-1/klassen/klas-a')));
    await assertFails(getDoc(doc(db, 'scholen/school-1/leerlingen/ll-a1')));
    await assertFails(getDoc(doc(db, 'scholen/school-1/leerlingBord/ll-a1')));
    await assertFails(deleteDoc(doc(db, 'scholen/school-1/leerlingen/ll-a1')));
  });
});
