import type { GebruikersRol } from '@/types';

export const nlBE = {
  app: {
    naam: 'KlasKompas',
    slagzin: 'Richting voor elke klasdag in het kleuter- en lager onderwijs',
    faseBadge: 'Fase 1 · Authenticatie & Rollen',
  },
  rollen: {
    superbeheerder: 'Superbeheerder',
    schoolbeheerder: 'Schoolbeheerder',
    leerkracht: 'Leerkracht',
  } satisfies Record<GebruikersRol, string>,
  navigatie: {
    overzicht: 'Overzicht',
    agenda: 'Weekplanning',
    keuzebord: 'Keuzebord',
    observaties: 'Observaties',
    doelen: 'Doelen',
    inzichten: 'Inzichten',
    leerlingen: 'Leerlingen',
    beheer: 'Schoolbeheer',
    platform: 'Platformbeheer',
    profiel: 'Mijn profiel',
    aanmelden: 'Aanmelden',
    afmelden: 'Uitloggen',
    toestelKoppelen: 'Toestel koppelen',
  },
  status: {
    offlineGereed: 'Offline cache actief',
    doelenGeladen: (aantal: number) => `${aantal.toLocaleString('nl-BE')} doelen in IndexedDB`,
    skeletMelding:
      'Dit scherm wordt in een volgende bouwfase inhoudelijk uitgewerkt. Je rechten en routebeveiliging zijn al actief.',
  },
} as const;
