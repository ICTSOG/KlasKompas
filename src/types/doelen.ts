export type DoelType = 'leerlijndoel' | 'minimumdoel';

export interface Doel {
  id: string;
  code: string;
  type: DoelType;
  leergebied: string;
  thema?: string | null;
  leerlijn: string;
  ookInLeerlijnen: string[];
  fase: string;
  leeftijd: string;
  tekst: string;
  samenhang?: string | null;
  ondersteuning?: string | null;
  verdieping?: string | null;
  oudeCode?: string | null;
  isNieuw: boolean;
  concordantieMD: string[];
  leerjaarMD?: string | null;
  bron: string;
}
