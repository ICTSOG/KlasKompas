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
   - Start in productiemodus (de regels uit `firestore.rules` worden in stap 4 uitgerold).
3. **Authentication instellen:**
   - Ga naar **Build > Authentication > Aan de slag**.
   - Schakel onder het tabblad **Sign-in method** de provider **E-mailadres/wachtwoord** in.
   - Schakel ook **Anoniem** in (nodig zodat klastablets via een tijdelijke koppelcode zonder leerkrachtlogin enkel `leerlingBord` en het keuzebord kunnen gebruiken).
4. **Webapp registreren & Authorized domains:**
   - Ga naar **Projectinstellingen (tandwiel) > Algemeen > Jouw apps** en registreer een nieuwe **Webapp (`</>`)**.
   - Noteer de zes `firebaseConfig`-waarden (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
   - Ga terug naar **Authentication > Settings > Authorized domains** en voeg jouw GitHub Pages-domein toe:
     ```text
     <jouw-github-gebruikersnaam>.github.io
     ```

---

## 2. Doelenbestand plaatsen

Kopieer het volledige bestand met de 5.037 leerlijn- en minimumdoelen naar:

```text
public/data/doelen.json
```

Bij het openen van de applicatie wordt dit bestand één keer opgehaald en lokaal in IndexedDB bewaard.

---

## 3. GitHub Pages & Repository Variables configureren

1. Open jouw repository op GitHub en ga naar **Settings > Pages**.
2. Zet onder **Build and deployment** de **Source** op **GitHub Actions**.
3. Ga naar **Settings > Secrets and variables > Actions** en open het tabblad **Variables** (let op: **Repository variables**, niet Secrets).
4. Voeg onderstaande zes variabelen toe met de waarden uit je Firebase-webapp:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Bij elke push naar `main` bouwt `.github/workflows/deploy.yml` de applicatie automatisch met `VITE_BASE_PATH=/<repo-naam>/` en publiceert deze naar GitHub Pages.

---

## 4. Firestore Security Rules & Indexen uitrollen

Installeer de Firebase CLI (indien nog niet aanwezig) en rol de beveiligingsregels en samengestelde indexen uit:

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # selecteer jouw Firebase-project
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 5. Lokaal ontwikkelen

```bash
cp .env.example .env
# Vul jouw VITE_FIREBASE_* waarden in .env in
npm install
npm run dev
```
