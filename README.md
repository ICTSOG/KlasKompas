# KlasKompas

Webapplicatie voor leerkrachten kleuter- en basisonderwijs in Vlaanderen: weekplanning (agenda), digitaal keuzebord, observaties, leerlijn- en minimumdoelen en inzichten.

---

## Architectuur in het kort

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS en React Router (`HashRouter` voor compatibiliteit met GitHub Pages).
- **Backend:** Firebase Authentication en Cloud Firestore met persistente lokale cache (`persistentLocalCache`) en realtime listeners (`onSnapshot`). Geen eigen backendserver of Cloud Functions; alle toegangscontrole zit in `firestore.rules`.
- **Doelen:** `/public/data/doelen.json` (5.037 doelen) wordt éénmalig opgehaald en opgeslagen in IndexedDB (komt niet in Firestore).

---

## 1. Firebase-project aanmaken en instellen

1. Ga naar de [Firebase Console](https://console.firebase.google.com/) en klik op **Project toevoegen** (bijv. `klaskompas`).
2. **Firestore Database aanmaken:**
   - Ga naar **Build > Firestore Database** en klik op **Database maken**.
   - **Belangrijk:** Kies een **EU-locatie** (bijv. `europe-west1` in België of `europe-west3` in Frankfurt). **Deze regio kan achteraf nooit meer gewijzigd worden.**
   - Start in productiemodus en plak de inhoud van `firestore.rules` onder het tabblad **Rules** (klik daarna op **Publiceren**).
3. **Authentication instellen:**
   - Ga naar **Build > Authentication > Aan de slag**.
   - Schakel onder **Sign-in method** de provider **E-mailadres/wachtwoord** in.
   - Voeg onder **Authentication > Settings > Authorized domains** jouw GitHub Pages-domein toe (`<jouw-github-gebruikersnaam>.github.io`).
4. **Webapp registreren:**
   - Ga naar **Projectinstellingen (tandwiel) > Algemeen > Jouw apps** en registreer een **Webapp (`</>`)**.
   - Noteer de zes `firebaseConfig`-waarden (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).

---

## 2. Eerste superbeheerder aanmaken

Omdat KlasKompas geen zelfregistratie toelaat, maak je het eerste beheerdersaccount rechtstreeks aan in de Firebase Console:

1. **Gebruiker aanmaken in Authentication:**
   - Ga naar **Build > Authentication > Users** en klik op **Gebruiker toevoegen** (*Add user*).
   - Vul een e-mailadres en wachtwoord in en klik op **Gebruiker toevoegen**.
   - Kopieer de **Gebruikers-UID** (*User UID*) uit de tabel (bijv. `abc123XYZ...`).
2. **Gebruikersdocument toevoegen in Firestore:**
   - Ga naar **Build > Firestore Database > Gegevens** (*Data*).
   - Klik op **Collectie starten** (*Start collection*) met collectie-ID: `gebruikers`.
   - Vul als **Document-ID** exact de gekopieerde **Gebruikers-UID** in.
   - Voeg onderstaande velden toe:
     - `email` *(string)*: hetzelfde e-mailadres als in Authentication
     - `voornaam` *(string)*: jouw voornaam
     - `familienaam` *(string)*: jouw familienaam
     - `rol` *(string)*: `superbeheerder`
     - `schoolId` *(string)*: `""` (leeg tekstveld, of een eerste school-ID)
     - `klasIds` *(array)*: lege array `[]`
     - `status` *(string)*: `actief`
   - Klik op **Opslaan**.
3. Meld je nu aan in KlasKompas met dit e-mailadres en wachtwoord. Je hebt meteen toegang tot alle onderdelen en **Mijn profiel**.

---

## 3. Doelenbestand plaatsen

Kopieer het volledige bestand met de 5.037 leerlijn- en minimumdoelen naar:

```text
public/data/doelen.json
```

---

## 4. GitHub Pages & Repository Variables configureren

1. Open jouw repository op GitHub en ga naar **Settings > Pages**.
2. Zet **Source** op **GitHub Actions**.
3. Ga naar **Settings > Secrets and variables > Actions** > tabblad **Variables** en voeg deze zes variabelen toe:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
