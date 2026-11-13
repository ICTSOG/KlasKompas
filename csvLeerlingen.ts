import type { Klas } from '@/types';
import type { LeerlingInvoer } from './db/leerlingen';

export interface CsvRijResultaat {
  lijnNummer: number;
  voornaam: string;
  familienaam: string;
  geboortedatum: string;
  klasNaam: string;
  klasId: string | null;
  fout?: string;
}

function normaliseerDatum(invoer: string): string | null {
  const schoon = invoer.trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(schoon)) {
    return schoon;
  }
  // DD-MM-YYYY of DD/MM/YYYY (veelgebruikt in Vlaamse schooladministraties)
  const euMatch = schoon.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (euMatch) {
    const dag = euMatch[1].padStart(2, '0');
    const maand = euMatch[2].padStart(2, '0');
    const jaar = euMatch[3];
    return `${jaar}-${maand}-${dag}`;
  }
  return null;
}

function splitsCsvLijn(lijn: string, scheidingsteken: string): string[] {
  const cellen: string[] = [];
  let huidig = '';
  let binnenQuotes = false;

  for (let i = 0; i < lijn.length; i += 1) {
    const teken = lijn[i];
    if (teken === '"') {
      binnenQuotes = !binnenQuotes;
    } else if (teken === scheidingsteken && !binnenQuotes) {
      cellen.push(huidig.trim());
      huidig = '';
    } else {
      huidig += teken;
    }
  }
  cellen.push(huidig.trim());
  return cellen.map((c) => c.replace(/^"|"$/g, '').trim());
}

/**
 * Parseert CSV-tekst met kolommen: voornaam, familienaam, geboortedatum, klas.
 * Ondersteunt zowel ',' als ';' als scheidingsteken.
 */
export function parseerLeerlingenCsv(
  csvTekst: string,
  klassen: Klas[]
): CsvRijResultaat[] {
  const ruweLijnen = csvTekst
    .replace(/^﻿/, '')
    .split(/?
/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (ruweLijnen.length === 0) return [];

  const scheidingsteken = ruweLijnen[0].includes(';') ? ';' : ',';
  const resultaten: CsvRijResultaat[] = [];

  const klasMap = new Map<string, Klas>();
  for (const k of klassen) {
    klasMap.set(k.naam.trim().toLowerCase(), k);
    klasMap.set(k.id.trim().toLowerCase(), k);
  }

  ruweLijnen.forEach((lijn, index) => {
    const cellen = splitsCsvLijn(lijn, scheidingsteken);

    // Sla kopregel over indien aanwezig
    if (
      index === 0 &&
      cellen[0]?.toLowerCase() === 'voornaam' &&
      cellen[1]?.toLowerCase() === 'familienaam'
    ) {
      return;
    }

    const [
      voornaam = '',
      familienaam = '',
      ruweDatum = '',
      klasNaam = '',
    ] = cellen;

    const geboortedatum = normaliseerDatum(ruweDatum) ?? '';
    const gevondenKlas = klasMap.get(klasNaam.trim().toLowerCase()) ?? null;

    let fout: string | undefined;
    if (!voornaam || !familienaam) {
      fout = 'Voornaam of familienaam ontbreekt';
    } else if (!geboortedatum) {
      fout = `Ongeldige geboortedatum "${ruweDatum}" (gebruik JJJJ-MM-DD of DD/MM/JJJJ)`;
    } else if (!gevondenKlas) {
      fout = `Onbekende klas "${klasNaam}"`;
    }

    resultaten.push({
      lijnNummer: index + 1,
      voornaam,
      familienaam,
      geboortedatum,
      klasNaam,
      klasId: gevondenKlas ? gevondenKlas.id : null,
      fout,
    });
  });

  return resultaten;
}

export function naarGeldigeLeerlingInvoer(
  rijen: CsvRijResultaat[]
): LeerlingInvoer[] {
  return rijen
    .filter((r): r is CsvRijResultaat & { klasId: string } => !r.fout && Boolean(r.klasId))
    .map((r) => ({
      voornaam: r.voornaam,
      familienaam: r.familienaam,
      geboortedatum: r.geboortedatum,
      klasId: r.klasId,
    }));
}

export const VOORBEELD_LEERLINGEN_CSV = [
  'voornaam;familienaam;geboortedatum;klas',
  'Noor;Peeters;2019-04-12;1e kleuterklas',
  'Lars;Janssens;2019-09-23;1e kleuterklas',
  'Mila;De Smet;2018-02-05;2e kleuterklas',
].join('
');
