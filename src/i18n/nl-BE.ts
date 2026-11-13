export const nlBE = {
  app: {
    naam: 'KlasKompas',
    slagzin: 'Richting voor elke klasdag in het kleuter- en lager onderwijs',
    faseBadge: 'Fase 0 · Architectuur & Skelet',
  },
  navigatie: {
    overzicht: 'Overzicht',
    agenda: 'Weekplanning',
    keuzebord: 'Keuzebord',
    observaties: 'Observaties',
    doelen: 'Doelen',
    inzichten: 'Inzichten',
    leerlingen: 'Leerlingen',
    beheer: 'Schoolbeheer',
    aanmelden: 'Aanmelden',
    toestelKoppelen: 'Toestel koppelen',
  },
  status: {
    offlineGereed: 'Offline cache actief',
    doelenGeladen: (aantal: number) => `${aantal.toLocaleString('nl-BE')} doelen in IndexedDB`,
    skeletMelding:
      'Dit scherm maakt deel uit van het applicatieskelet (Fase 0). De volledige werking volgt in de volgende fasen.',
  },
} as const;
