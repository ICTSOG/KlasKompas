import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  GraduationCap,
  ImagePlus,
  Pin,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  BewerkCirkelKnop,
  FabToevoegKnop,
  GroeneBadge,
  LegeToestand,
} from '@/components/UiElementen';
import {
  useActieveSchool,
  useKlassen,
  useLeerlingen,
} from '@/hooks';
import {
  naarGeldigeLeerlingInvoer,
  parseerLeerlingenCsv,
  VOORBEELD_LEERLINGEN_CSV,
  type CsvRijResultaat,
} from '@/lib/csvLeerlingen';
import {
  STANDAARD_LEERLING_ICONEN,
  vindStandaardIcoon,
} from '@/lib/standaardIconen';
import type { Leerling } from '@/types';

type SorteerKolom = 'voornaam' | 'familienaam' | 'geboortedatum' | 'klas';
type SorteerRichting = 'asc' | 'desc';

interface LeerlingenPaginaProps {
  modus: 'school' | 'klas';
}

export function LeerlingenPagina({ modus }: LeerlingenPaginaProps) {
  const { actieveSchoolId, actieveKlasId } = useActieveSchool();
  const { klassen } = useKlassen();
  const {
    leerlingen,
    profielfotos,
    laden,
    fout,
    leerlingToevoegen,
    leerlingBijwerken,
    leerlingVerwijderen,
    leerlingenImporteren,
  } = useLeerlingen();

  const navigate = useNavigate();

  // Filters
  const [filterVoornaam, setFilterVoornaam] = useState('');
  const [filterFamilienaam, setFilterFamilienaam] = useState('');
  const [filterGeboortedatum, setFilterGeboortedatum] = useState('');
  const [filterKlasId, setFilterKlasId] = useState('');

  useEffect(() => {
    if (modus === 'klas') {
      setFilterKlasId(actieveKlasId || '');
    } else {
      setFilterKlasId('');
    }
  }, [modus, actieveKlasId]);

  // Sortering
  const [sorteerKolom, setSorteerKolom] = useState<SorteerKolom>('familienaam');
  const [sorteerRichting, setSorteerRichting] = useState<SorteerRichting>('asc');

  // Melding
  const [melding, setMelding] = useState<string | null>(null);

  // Toevoegen / bewerken modal
  const [modalOpen, setModalOpen] = useState(false);
  const [bewerkItem, setBewerkItem] = useState<Leerling | null>(null);
  const [voornaam, setVoornaam] = useState('');
  const [familienaam, setFamilienaam] = useState('');
  const [geboortedatum, setGeboortedatum] = useState('');
  const [klasId, setKlasId] = useState('');
  const [avatarType, setAvatarType] = useState<'icoon' | 'foto'>('icoon');
  const [gekozenIconId, setGekozenIconId] = useState<string>('icoon-beer');
  const [fotoBestand, setFotoBestand] = useState<File | null>(null);
  const [fotoVoorvertoning, setFotoVoorvertoning] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [modalFout, setModalFout] = useState<string | null>(null);

  // CSV Import modal
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvTekst, setCsvTekst] = useState('');
  const [csvRijen, setCsvRijen] = useState<CsvRijResultaat[]>([]);
  const [csvBezig, setCsvBezig] = useState(false);

  const klasNaamMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const k of klassen) {
      map.set(k.id, k.naam);
    }
    return map;
  }, [klassen]);

  const gefilterdeEnGesorteerdeLeerlingen = useMemo(() => {
    const vn = filterVoornaam.trim().toLowerCase();
    const fn = filterFamilienaam.trim().toLowerCase();
    const gd = filterGeboortedatum.trim().toLowerCase();

    const gefilterd = leerlingen.filter((l) => {
      if (filterKlasId && l.klasId !== filterKlasId) return false;
      if (vn && !l.voornaam.toLowerCase().includes(vn)) return false;
      if (fn && !l.familienaam.toLowerCase().includes(fn)) return false;
      if (gd && !l.geboortedatum.toLowerCase().includes(gd)) return false;
      return true;
    });

    return [...gefilterd].sort((a, b) => {
      let waardeA = '';
      let waardeB = '';

      switch (sorteerKolom) {
        case 'voornaam':
          waardeA = a.voornaam;
          waardeB = b.voornaam;
          break;
        case 'familienaam':
          waardeA = a.familienaam;
          waardeB = b.familienaam;
          break;
        case 'geboortedatum':
          waardeA = a.geboortedatum;
          waardeB = b.geboortedatum;
          break;
        case 'klas':
          waardeA = klasNaamMap.get(a.klasId) ?? a.klasId;
          waardeB = klasNaamMap.get(b.klasId) ?? b.klasId;
          break;
      }

      const vergelijking = waardeA.localeCompare(waardeB, 'nl-BE');
      return sorteerRichting === 'asc' ? vergelijking : -vergelijking;
    });
  }, [
    leerlingen,
    filterVoornaam,
    filterFamilienaam,
    filterGeboortedatum,
    filterKlasId,
    sorteerKolom,
    sorteerRichting,
    klasNaamMap,
  ]);

  if (!actieveSchoolId) {
    return (
      <LegeToestand
        icon={GraduationCap}
        titel="Geen school geselecteerd"
        beschrijving="Kies eerst een school in de topbalk om leerlingen te beheren."
      />
    );
  }

  function wisselSortering(kolom: SorteerKolom) {
    if (sorteerKolom === kolom) {
      setSorteerRichting((r) => (r === 'asc' ? 'desc' : 'asc'));
    } else {
      setSorteerKolom(kolom);
      setSorteerRichting('asc');
    }
  }

  function filtersWissen() {
    setFilterVoornaam('');
    setFilterFamilienaam('');
    setFilterGeboortedatum('');
    if (modus === 'school') {
      setFilterKlasId('');
    }
  }

  function openNieuwModal() {
    setBewerkItem(null);
    setVoornaam('');
    setFamilienaam('');
    setGeboortedatum('');
    setKlasId(filterKlasId || actieveKlasId || klassen[0]?.id || '');
    setAvatarType('icoon');
    setGekozenIconId('icoon-beer');
    setFotoBestand(null);
    setFotoVoorvertoning(null);
    setModalFout(null);
    setModalOpen(true);
  }

  function openBewerkModal(l: Leerling) {
    setBewerkItem(l);
    setVoornaam(l.voornaam);
    setFamilienaam(l.familienaam);
    setGeboortedatum(l.geboortedatum);
    setKlasId(l.klasId);
    setFotoBestand(null);

    if (l.fotoId && profielfotos[l.fotoId]) {
      setAvatarType('foto');
      setFotoVoorvertoning(profielfotos[l.fotoId].dataUrl);
      setGekozenIconId('icoon-beer');
    } else {
      setAvatarType('icoon');
      setFotoVoorvertoning(null);
      setGekozenIconId(l.iconId || 'icoon-beer');
    }

    setModalFout(null);
    setModalOpen(true);
  }

  function handleBestandKeuze(e: ChangeEvent<HTMLInputElement>) {
    const bestand = e.target.files?.[0];
    if (!bestand) return;
    setFotoBestand(bestand);
    setAvatarType('foto');
    setFotoVoorvertoning(URL.createObjectURL(bestand));
  }

  async function handleOpslaan(e: FormEvent) {
    e.preventDefault();
    setModalFout(null);
    setBezig(true);
    try {
      const invoer = {
        voornaam,
        familienaam,
        geboortedatum,
        klasId,
        fotoId: avatarType === 'foto' ? bewerkItem?.fotoId : undefined,
        iconId: avatarType === 'icoon' ? gekozenIconId : undefined,
      };

      if (bewerkItem) {
        await leerlingBijwerken(
          bewerkItem.id,
          invoer,
          avatarType === 'foto' ? fotoBestand : null
        );
        setMelding(`Leerling ${voornaam} ${familienaam} is bijgewerkt (inclusief keuzebord).`);
      } else {
        await leerlingToevoegen(invoer, avatarType === 'foto' ? fotoBestand : null);
        setMelding(`Leerling ${voornaam} ${familienaam} is toegevoegd (inclusief keuzebord).`);
      }
      setModalOpen(false);
    } catch (err) {
      setModalFout(err instanceof Error ? err.message : 'Opslaan mislukt.');
    } finally {
      setBezig(false);
    }
  }

  async function handleVerwijderen(l: Leerling) {
    if (
      !window.confirm(
        `Wil je ${l.voornaam} ${l.familienaam} verwijderen? Dit verwijdert de leerling ook van het keuzebord.`
      )
    ) {
      return;
    }
    await leerlingVerwijderen(l.id);
    setMelding(`${l.voornaam} ${l.familienaam} is verwijderd.`);
  }

  function openCsvModal() {
    setCsvTekst('');
    setCsvRijen([]);
    setCsvOpen(true);
  }

  function verwerkCsvInvoer(tekst: string) {
    setCsvTekst(tekst);
    setCsvRijen(parseerLeerlingenCsv(tekst, klassen));
  }

  function handleCsvBestand(e: ChangeEvent<HTMLInputElement>) {
    const bestand = e.target.files?.[0];
    if (!bestand) return;
    const lezer = new FileReader();
    lezer.onload = () => {
      verwerkCsvInvoer(String(lezer.result ?? ''));
    };
    lezer.readAsText(bestand, 'UTF-8');
  }

  function downloadVoorbeeldCsv() {
    const blob = new Blob([VOORBEELD_LEERLINGEN_CSV], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'klaskompas-leerlingen-voorbeeld.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCsvImporteren() {
    const geldige = naarGeldigeLeerlingInvoer(csvRijen);
    if (geldige.length === 0) return;
    setCsvBezig(true);
    try {
      const aantal = await leerlingenImporteren(geldige);
      setCsvOpen(false);
      setMelding(`${aantal} leerling(en) succesvol geïmporteerd en gekoppeld aan het keuzebord.`);
    } finally {
      setCsvBezig(false);
    }
  }

  return (
    <div className="space-y-5 pb-14">
      {/* Bovenbalk met teller & CSV-knop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {modus === 'klas' ? 'Leerlingen van de klas' : 'Alle leerlingen'}
          </h2>
          <p className="text-sm text-slate-500">
            Elke wijziging wordt automatisch gesynchroniseerd met het keuzebord.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GroeneBadge>
            {gefilterdeEnGesorteerdeLeerlingen.length}{' '}
            {gefilterdeEnGesorteerdeLeerlingen.length === 1 ? 'leerling' : 'leerlingen'}
          </GroeneBadge>

          <button
            type="button"
            onClick={openCsvModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 text-kompas-700" />
            <span>CSV-import</span>
          </button>
        </div>
      </div>

      {melding && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{melding}</span>
          </div>
          <button
            type="button"
            onClick={() => setMelding(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {fout && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          Kon leerlingen niet laden: {fout.message}
        </div>
      )}

      {/* Filterbalk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <input
          type="text"
          value={filterVoornaam}
          onChange={(e) => setFilterVoornaam(e.target.value)}
          placeholder="Filter voornaam…"
          aria-label="Filter op voornaam"
          className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm"
        />
        <input
          type="text"
          value={filterFamilienaam}
          onChange={(e) => setFilterFamilienaam(e.target.value)}
          placeholder="Filter familienaam…"
          aria-label="Filter op familienaam"
          className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm"
        />
        <input
          type="text"
          value={filterGeboortedatum}
          onChange={(e) => setFilterGeboortedatum(e.target.value)}
          placeholder="Geboortedatum (bv. 2019)"
          aria-label="Filter op geboortedatum"
          className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm"
        />
        <select
          value={filterKlasId}
          onChange={(e) => setFilterKlasId(e.target.value)}
          aria-label="Filter op klas"
          className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm"
        >
          <option value="">Alle klassen</option>
          {klassen.map((k) => (
            <option key={k.id} value={k.id}>
              {k.naam}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={filtersWissen}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-sm text-slate-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Filters wissen</span>
        </button>
      </div>

      {/* Tabel */}
      {laden ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Leerlingen laden…
        </div>
      ) : gefilterdeEnGesorteerdeLeerlingen.length === 0 ? (
        <LegeToestand
          icon={GraduationCap}
          titel="Geen leerlingen gevonden"
          beschrijving="Pas je filters aan, importeer een CSV-bestand of voeg een leerling toe met de gele plusknop rechtsonder."
        />
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">
                  <SorteerKop
                    label="Voornaam"
                    kolom="voornaam"
                    actieveKolom={sorteerKolom}
                    richting={sorteerRichting}
                    onKlik={wisselSortering}
                  />
                </th>
                <th className="py-3 px-4">
                  <SorteerKop
                    label="Familienaam"
                    kolom="familienaam"
                    actieveKolom={sorteerKolom}
                    richting={sorteerRichting}
                    onKlik={wisselSortering}
                  />
                </th>
                <th className="py-3 px-4">
                  <SorteerKop
                    label="Geboortedatum"
                    kolom="geboortedatum"
                    actieveKolom={sorteerKolom}
                    richting={sorteerRichting}
                    onKlik={wisselSortering}
                  />
                </th>
                <th className="py-3 px-4">
                  <SorteerKop
                    label="Klas"
                    kolom="klas"
                    actieveKolom={sorteerKolom}
                    richting={sorteerRichting}
                    onKlik={wisselSortering}
                  />
                </th>
                <th className="py-3 px-4 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {gefilterdeEnGesorteerdeLeerlingen.map((l) => {
                const foto = l.fotoId ? profielfotos[l.fotoId] : undefined;
                const icoon = vindStandaardIcoon(l.iconId);

                return (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {foto ? (
                          <img
                            src={foto.dataUrl}
                            alt={l.voornaam}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : icoon ? (
                          <span
                            style={{ backgroundColor: icoon.achtergrond }}
                            className="h-9 w-9 rounded-full flex items-center justify-center text-lg shrink-0"
                            title={icoon.naam}
                          >
                            {icoon.symbool}
                          </span>
                        ) : (
                          <span className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {`${l.voornaam.charAt(0)}${l.familienaam.charAt(0)}`.toUpperCase()}
                          </span>
                        )}
                        <span className="font-semibold text-slate-900">
                          {l.voornaam}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800">{l.familienaam}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {l.geboortedatum}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {klasNaamMap.get(l.klasId) ?? l.klasId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/klas/observaties?leerlingId=${l.id}`)
                          }
                          title="Observaties bekijken"
                          aria-label={`Observaties van ${l.voornaam}`}
                          className="h-8 w-8 rounded-full bg-slate-100 hover:bg-kompas-50 text-slate-600 hover:text-kompas-800 transition-colors inline-flex items-center justify-center"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/klas/doelen?leerlingId=${l.id}`)}
                          title="Doelen & evaluaties"
                          aria-label={`Doelen van ${l.voornaam}`}
                          className="h-8 w-8 rounded-full bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors inline-flex items-center justify-center"
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <BewerkCirkelKnop
                          label={`${l.voornaam} bewerken`}
                          onClick={() => openBewerkModal(l)}
                        />
                        <button
                          type="button"
                          onClick={() => handleVerwijderen(l)}
                          title="Leerling verwijderen"
                          aria-label={`${l.voornaam} verwijderen`}
                          className="h-8 w-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors inline-flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FabToevoegKnop label="Leerling toevoegen" onClick={openNieuwModal} />

      {/* Modal: Leerling toevoegen / bewerken */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleOpslaan}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {bewerkItem ? 'Leerling bewerken' : 'Nieuwe leerling'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalFout && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {modalFout}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Voornaam
                </label>
                <input
                  type="text"
                  required
                  value={voornaam}
                  onChange={(e) => setVoornaam(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Familienaam
                </label>
                <input
                  type="text"
                  required
                  value={familienaam}
                  onChange={(e) => setFamilienaam(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Geboortedatum
                </label>
                <input
                  type="date"
                  required
                  value={geboortedatum}
                  onChange={(e) => setGeboortedatum(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Klas</label>
                <select
                  required
                  value={klasId}
                  onChange={(e) => setKlasId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="">Kies een klas…</option>
                  {klassen.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.naam}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keuzebord-weergave: icoon of profielfoto */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700">
                Weergave op het keuzebord
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAvatarType('icoon')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    avatarType === 'icoon'
                      ? 'bg-kompas-50 border-kompas-600 text-kompas-800'
                      : 'border-slate-300 text-slate-600'
                  }`}
                >
                  Icoon kiezen
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarType('foto')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    avatarType === 'foto'
                      ? 'bg-kompas-50 border-kompas-600 text-kompas-800'
                      : 'border-slate-300 text-slate-600'
                  }`}
                >
                  Profielfoto uploaden
                </button>
              </div>

              {avatarType === 'icoon' ? (
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {STANDAARD_LEERLING_ICONEN.map((icoon) => {
                    const geselecteerd = gekozenIconId === icoon.id;
                    return (
                      <button
                        key={icoon.id}
                        type="button"
                        onClick={() => setGekozenIconId(icoon.id)}
                        title={icoon.naam}
                        style={{ backgroundColor: icoon.achtergrond }}
                        className={`h-11 rounded-xl flex items-center justify-center text-xl transition-transform ${
                          geselecteerd
                            ? 'ring-2 ring-kompas-700 scale-105'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {icoon.symbool}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-4 pt-1">
                  {fotoVoorvertoning ? (
                    <img
                      src={fotoVoorvertoning}
                      alt="Voorvertoning"
                      className="h-14 w-14 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Kies foto (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBestandKeuze}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={bezig}
                style={{
                  backgroundColor: 'var(--kleur-primair)',
                  color: 'var(--kleur-primair-tekst)',
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-60"
              >
                {bezig ? 'Opslaan…' : 'Opslaan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: CSV-import */}
      {csvOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Leerlingen importeren via CSV
              </h3>
              <button
                type="button"
                onClick={() => setCsvOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span>
                Verwachte kolommen:{' '}
                <code className="font-mono text-slate-900">
                  voornaam,familienaam,geboortedatum,klas
                </code>
              </span>
              <button
                type="button"
                onClick={downloadVoorbeeldCsv}
                className="inline-flex items-center gap-1 text-kompas-700 font-semibold hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Voorbeeld-CSV</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>CSV-bestand kiezen</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvBestand}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400">
                of plak je gegevens hieronder:
              </span>
            </div>

            <textarea
              rows={5}
              value={csvTekst}
              onChange={(e) => verwerkCsvInvoer(e.target.value)}
              placeholder={VOORBEELD_LEERLINGEN_CSV}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono"
            />

            {csvRijen.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 flex justify-between">
                  <span>Voorvertoning ({csvRijen.length} rijen)</span>
                  <span className="text-emerald-700">
                    {csvRijen.filter((r) => !r.fout).length} geldig
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {csvRijen.map((rij) => (
                    <div
                      key={rij.lijnNummer}
                      className={`px-3 py-2 flex items-center justify-between gap-2 ${
                        rij.fout ? 'bg-rose-50 text-rose-800' : 'text-slate-700'
                      }`}
                    >
                      <span>
                        <strong>
                          {rij.voornaam} {rij.familienaam}
                        </strong>{' '}
                        · {rij.geboortedatum || '—'} · {rij.klasNaam || '—'}
                      </span>
                      {rij.fout ? (
                        <span className="font-medium">{rij.fout}</span>
                      ) : (
                        <GroeneBadge>Klaar</GroeneBadge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCsvOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Annuleren
              </button>
              <button
                type="button"
                disabled={
                  csvBezig || naarGeldigeLeerlingInvoer(csvRijen).length === 0
                }
                onClick={handleCsvImporteren}
                style={{
                  backgroundColor: 'var(--kleur-primair)',
                  color: 'var(--kleur-primair-tekst)',
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-50"
              >
                {csvBezig
                  ? 'Importeren…'
                  : `${naarGeldigeLeerlingInvoer(csvRijen).length} leerling(en) importeren`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SorteerKop({
  label,
  kolom,
  actieveKolom,
  richting,
  onKlik,
}: {
  label: string;
  kolom: SorteerKolom;
  actieveKolom: SorteerKolom;
  richting: SorteerRichting;
  onKlik: (kolom: SorteerKolom) => void;
}) {
  const isActief = actieveKolom === kolom;
  return (
    <button
      type="button"
      onClick={() => onKlik(kolom)}
      className="inline-flex items-center gap-1 hover:text-slate-900"
    >
      <span>{label}</span>
      {!isActief ? (
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
      ) : richting === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5 text-slate-800" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 text-slate-800" />
      )}
    </button>
  );
}
