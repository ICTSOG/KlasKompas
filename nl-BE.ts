import type { GebruikersRol } from '@/types';

export const nlBE = {
  app: {
    naam: 'KlasKompas',
    slagzin: 'Richting voor elke klasdag in het kleuter- en lager onderwijs',
    versie: 'v0.2.0 · Fase 2',
  },
  rollen: {
    superbeheerder: 'Superbeheerder',
    schoolbeheerder: 'Schoolbeheerder',
    leerkracht: 'Leerkracht',
  } satisfies Record<GebruikersRol, string>,
  navigatie: {
    lesplanbibliotheek: 'Lesplanbibliotheek',
    sectieSchool: 'SCHOOL',
    sectieKlas: 'KLAS',
    gebruikers: 'Gebruikers',
    klassen: 'Klassen',
    leerlingen: 'Leerlingen',
    iconen: 'Iconen bibliotheek',
    jaardoelen: 'Jaardoelen',
    instellingen: 'Instellingen',
    keuzeactiviteiten: 'Keuze-activiteiten',
    agenda: 'Agenda',
    doelenEvaluaties: 'Doelen & evaluaties',
    observaties: 'Observaties',
    inzichten: 'Inzichten',
    keuzebord: 'Keuze- & Reflectiebord',
    profiel: 'Mijn profiel',
    afmelden: 'Uitloggen',
  },
  status: {
    doelenGeladen: (aantal: number) => `${aantal.toLocaleString('nl-BE')} doelen lokaal`,
    placeholderMelding:
      'Dit onderdeel wordt in de volgende bouwfase inhoudelijk uitgewerkt. De navigatie, schoolcontext en beveiliging zijn al klaar.',
  },
} as const;
