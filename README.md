# KlasKompas — Fase 2: App-shell en beheerschermen

Webapplicatie voor kleuter- en lager onderwijs in Vlaanderen (React 19 + TypeScript + Vite + Tailwind CSS v4 + Firebase).

## Wat zit in Fase 2?

1. **Volledige App-shell & Layout**
   - Inklapbare lichtgrijze zijbalk met logo bovenaan, **Lesplanbibliotheek**, sectie **SCHOOL** (`Gebruikers`, `Klassen`, `Leerlingen`, `Iconen bibliotheek`, `Jaardoelen`, `Instellingen`), sectie **KLAS** met actieve **klas-selector** (`Leerlingen`, `Keuze-activiteiten`, `Agenda`, `Doelen & evaluaties`, `Observaties`, `Inzichten`, `Iconen bibliotheek`, `Keuze- & Reflectiebord`) en versienummer onderaan.
   - Topbalk met dynamische paginatitel, help-popover, meldingenbelletje met rode badge, gebruikersmenu (`Mijn profiel`, `Uitloggen`) en voor de **superbeheerder** een **schoolkiezer** (inclusief mogelijkheid om een nieuwe school aan te maken).
   - Thema-kleuren via CSS-variabelen (`--kleur-primair`, `--kleur-accent`, `--kleur-zijbalk`, ...) in `src/index.css`, gele ronde `+`-FAB rechtsonder, groene status-badges en potlood-in-grijze-cirkel bewerkknoppen.
2. **Gebruikersbeheer (`/school/gebruikers`)**
   - Realtime tabel met initialen-avatar, naam, e-mail, rol, klassen en status-badge.
   - Nieuwe gebruiker aanmaken via een **tweede, tijdelijke Firebase-app-instantie** met cryptografisch willekeurig wachtwoord + automatische wachtwoord-resetmail, zonder dat de beheerder uitgelogd raakt.
   - Bewerken van naam, rol, toegewezen klassen, status (`actief`/`inactief`), opnieuw reset-mail versturen en "verwijderen" door op `inactief` te zetten.
3. **Klassenbeheer (`/school/klassen`)**
   - Realtime overzicht met klasnaam, gekoppelde leerkracht(en), groene badge met aantal leerlingen en bewerken/aanmaken/verwijderen (inclusief bidirectionele synchronisatie tussen `klassen.leerkrachtIds` en `gebruikers.klasIds`).
4. **Leerlingenbeheer (`/school/leerlingen` & `/klas/leerlingen`)**
   - Filters op voornaam, familienaam, geboortedatum en klas + sorteerbare tabel.
   - Acties per rij: observaties (`Eye`), doelen (`Pin`) en bewerken.
   - Keuze uit ingebouwde kleuter/lager-iconen of eigen profielfoto upload (automatisch verkleind en opgeslagen in `scholen/{schoolId}/media`).
   - CSV-import (`voornaam,familienaam,geboortedatum,klas`, ondersteunt `,` en `;`, met live voorvertoning).
   - Elke mutatie houdt `scholen/{schoolId}/leerlingBord/{id}` atomisch synchroon zonder gevoelige persoonsgegevens.
5. **Firestore Security Rules & Emulator Tests**
   - Bijgewerkte `firestore.rules` en automatische test-suite in `tests/firestore.rules.test.mjs`.

## Lokaal starten & rules testen

```bash
npm install
npm run dev
```

Firestore Security Rules testen met de Firebase Emulator:

```bash
npm run test:rules
```
