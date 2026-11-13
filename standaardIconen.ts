export interface StandaardIcoon {
  id: string;
  naam: string;
  symbool: string;
  achtergrond: string;
}

export const STANDAARD_LEERLING_ICONEN: StandaardIcoon[] = [
  { id: 'icoon-beer', naam: 'Beertje', symbool: '🐻', achtergrond: '#FEF3C7' },
  { id: 'icoon-uil', naam: 'Uiltje', symbool: '🦉', achtergrond: '#E0E7FF' },
  { id: 'icoon-vos', naam: 'Vosje', symbool: '🦊', achtergrond: '#FFEDD5' },
  { id: 'icoon-konijn', naam: 'Konijntje', symbool: '🐰', achtergrond: '#FCE7F3' },
  { id: 'icoon-egel', naam: 'Egeltje', symbool: '🦔', achtergrond: '#F3E8FF' },
  { id: 'icoon-leeuw', naam: 'Leeuwtje', symbool: '🦁', achtergrond: '#FEF9C3' },
  { id: 'icoon-kikker', naam: 'Kikkertje', symbool: '🐸', achtergrond: '#DCFCE7' },
  { id: 'icoon-walvis', naam: 'Walvisje', symbool: '🐳', achtergrond: '#E0F2FE' },
  { id: 'icoon-vlinder', naam: 'Vlinder', symbool: '🦋', achtergrond: '#CCFBF1' },
  { id: 'icoon-zon', naam: 'Zonnetje', symbool: '☀️', achtergrond: '#FEF08A' },
  { id: 'icoon-ster', naam: 'Sterretje', symbool: '⭐', achtergrond: '#FEF3C7' },
  { id: 'icoon-raket', naam: 'Raket', symbool: '🚀', achtergrond: '#DBEAFE' },
];

export function vindStandaardIcoon(iconId?: string): StandaardIcoon | undefined {
  if (!iconId) return undefined;
  return STANDAARD_LEERLING_ICONEN.find((i) => i.id === iconId);
}
