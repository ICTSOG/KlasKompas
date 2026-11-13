export const dbPaths = {
  // Top-level
  gebruikers: () => 'gebruikers',
  gebruiker: (uid: string) => `gebruikers/${uid}`,
  scholen: () => 'scholen',
  school: (schoolId: string) => `scholen/${schoolId}`,
  platformInstellingen: () => 'platform/instellingen',
  koppelcodes: () => 'koppelcodes',
  koppelcode: (code: string) => `koppelcodes/${code}`,
  toestellen: () => 'toestellen',
  toestel: (uid: string) => `toestellen/${uid}`,

  // Onder scholen/{schoolId}
  klassen: (schoolId: string) => `scholen/${schoolId}/klassen`,
  klas: (schoolId: string, klasId: string) => `scholen/${schoolId}/klassen/${klasId}`,

  leerlingen: (schoolId: string) => `scholen/${schoolId}/leerlingen`,
  leerling: (schoolId: string, leerlingId: string) =>
    `scholen/${schoolId}/leerlingen/${leerlingId}`,

  leerlingBorden: (schoolId: string) => `scholen/${schoolId}/leerlingBord`,
  leerlingBord: (schoolId: string, leerlingId: string) =>
    `scholen/${schoolId}/leerlingBord/${leerlingId}`,

  iconBibliotheken: (schoolId: string) => `scholen/${schoolId}/iconBibliotheken`,
  iconBibliotheek: (schoolId: string, bibId: string) =>
    `scholen/${schoolId}/iconBibliotheken/${bibId}`,
  iconen: (schoolId: string, bibId: string) =>
    `scholen/${schoolId}/iconBibliotheken/${bibId}/iconen`,
  icoon: (schoolId: string, bibId: string, iconId: string) =>
    `scholen/${schoolId}/iconBibliotheken/${bibId}/iconen/${iconId}`,

  keuzeactiviteiten: (schoolId: string) => `scholen/${schoolId}/keuzeactiviteiten`,
  keuzeactiviteit: (schoolId: string, activiteitId: string) =>
    `scholen/${schoolId}/keuzeactiviteiten/${activiteitId}`,

  agenda: (schoolId: string) => `scholen/${schoolId}/agenda`,
  agendaItem: (schoolId: string, agendaId: string) =>
    `scholen/${schoolId}/agenda/${agendaId}`,

  weekthemas: (schoolId: string) => `scholen/${schoolId}/weekthemas`,
  weekthema: (schoolId: string, themaId: string) =>
    `scholen/${schoolId}/weekthemas/${themaId}`,

  borden: (schoolId: string) => `scholen/${schoolId}/borden`,
  bord: (schoolId: string, agendaId: string) => `scholen/${schoolId}/borden/${agendaId}`,

  sessies: (schoolId: string) => `scholen/${schoolId}/sessies`,
  sessie: (schoolId: string, sessieId: string) =>
    `scholen/${schoolId}/sessies/${sessieId}`,

  observaties: (schoolId: string) => `scholen/${schoolId}/observaties`,
  observatie: (schoolId: string, observatieId: string) =>
    `scholen/${schoolId}/observaties/${observatieId}`,

  evaluaties: (schoolId: string) => `scholen/${schoolId}/evaluaties`,
  evaluatie: (schoolId: string, evaluatieId: string) =>
    `scholen/${schoolId}/evaluaties/${evaluatieId}`,

  doelencollecties: (schoolId: string) => `scholen/${schoolId}/doelencollecties`,
  doelencollectie: (schoolId: string, collectieId: string) =>
    `scholen/${schoolId}/doelencollecties/${collectieId}`,

  eigenDoelen: (schoolId: string) => `scholen/${schoolId}/eigenDoelen`,
  eigenDoel: (schoolId: string, doelId: string) =>
    `scholen/${schoolId}/eigenDoelen/${doelId}`,

  lesplannen: (schoolId: string) => `scholen/${schoolId}/lesplannen`,
  lesplan: (schoolId: string, lesplanId: string) =>
    `scholen/${schoolId}/lesplannen/${lesplanId}`,

  lesplanCollecties: (schoolId: string) => `scholen/${schoolId}/lesplanCollecties`,
  lesplanCollectie: (schoolId: string, collectieId: string) =>
    `scholen/${schoolId}/lesplanCollecties/${collectieId}`,

  media: (schoolId: string) => `scholen/${schoolId}/media`,
  mediaItem: (schoolId: string, mediaId: string) =>
    `scholen/${schoolId}/media/${mediaId}`,

  audit: (schoolId: string) => `scholen/${schoolId}/audit`,
  auditItem: (schoolId: string, auditId: string) =>
    `scholen/${schoolId}/audit/${auditId}`,
} as const;
