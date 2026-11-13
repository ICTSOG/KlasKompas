import { useState, type FormEvent } from 'react';
import { School as SchoolIcon, Trash2, Users, X } from 'lucide-react';
import {
  BewerkCirkelKnop,
  FabToevoegKnop,
  GroeneBadge,
  LegeToestand,
} from '@/components/UiElementen';
import {
  useActieveSchool,
  useAuth,
  useGebruikers,
  useKlassen,
  useLeerlingen,
} from '@/hooks';
import type { Klas } from '@/types';

export function KlassenPagina() {
  const { gebruiker } = useAuth();
  const { actieveSchoolId } = useActieveSchool();
  const {
    klassen,
    laden,
    fout,
    klasToevoegen,
    klasBijwerken,
    klasVerwijderen,
  } = useKlassen();
  const { gebruikers } = useGebruikers();
  const { leerlingen } = useLeerlingen();

  const isBeheerder =
    gebruiker?.rol === 'schoolbeheerder' || gebruiker?.rol === 'superbeheerder';

  const [modalOpen, setModalOpen] = useState(false);
  const [bewerkKlas, setBewerkKlas] = useState<Klas | null>(null);
  const [naam, setNaam] = useState('');
  const [leerkrachtIds, setLeerkrachtIds] = useState<string[]>([]);
  const [bezig, setBezig] = useState(false);
  const [modalFout, setModalFout] = useState<string | null>(null);

  if (!actieveSchoolId) {
    return (
      <LegeToestand
        icon={SchoolIcon}
        titel="Geen school geselecteerd"
        beschrijving="Selecteer eerst een school in de topbalk om de klassen te bekijken."
      />
    );
  }

  const schoolLeerkrachten = gebruikers.filter((g) => g.status === 'actief');

  function openNieuwModal() {
    setBewerkKlas(null);
    setNaam('');
    setLeerkrachtIds([]);
    setModalFout(null);
    setModalOpen(true);
  }

  function openBewerkModal(klas: Klas) {
    setBewerkKlas(klas);
    setNaam(klas.naam);
    setLeerkrachtIds(klas.leerkrachtIds ?? []);
    setModalFout(null);
    setModalOpen(true);
  }

  function toggleLeerkracht(uid: string) {
    setLeerkrachtIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  }

  async function handleOpslaan(e: FormEvent) {
    e.preventDefault();
    setModalFout(null);
    setBezig(true);
    try {
      if (bewerkKlas) {
        await klasBijwerken(bewerkKlas, { naam, leerkrachtIds });
      } else {
        await klasToevoegen(naam, leerkrachtIds);
      }
      setModalOpen(false);
    } catch (err) {
      setModalFout(err instanceof Error ? err.message : 'Opslaan mislukt.');
    } finally {
      setBezig(false);
    }
  }

  async function handleVerwijderen(klas: Klas) {
    const aantal = leerlingen.filter((l) => l.klasId === klas.id).length;
    if (aantal > 0) {
      window.alert(
        `Deze klas bevat nog ${aantal} leerling(en). Verplaats of verwijder eerst de leerlingen voordat je de klas verwijdert.`
      );
      return;
    }
    if (!window.confirm(`Ben je zeker dat je de klas "${klas.naam}" wilt verwijderen?`)) {
      return;
    }
    await klasVerwijderen(klas);
  }

  return (
    <div className="space-y-6 pb-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Klassen</h2>
          <p className="text-sm text-slate-500">
            Overzicht van de klassen, gekoppelde leerkrachten en het leerlingenaantal.
          </p>
        </div>
        <GroeneBadge>{klassen.length} klassen</GroeneBadge>
      </div>

      {fout && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          Kon klassen niet laden: {fout.message}
        </div>
      )}

      {laden ? (
        <div className="py-12 text-center text-sm text-slate-500">Klassen laden…</div>
      ) : klassen.length === 0 ? (
        <LegeToestand
          icon={SchoolIcon}
          titel="Nog geen klassen aangemaakt"
          beschrijving={
            isBeheerder
              ? 'Klik op de gele plusknop rechtsonder om een eerste klas toe te voegen.'
              : 'Er zijn nog geen klassen aan je account gekoppeld.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {klassen.map((klas) => {
            const aantalLeerlingen = leerlingen.filter(
              (l) => l.klasId === klas.id
            ).length;

            const gekoppeldeNamen = isBeheerder
              ? gebruikers
                  .filter(
                    (g) =>
                      klas.leerkrachtIds.includes(g.uid) ||
                      g.klasIds.includes(klas.id)
                  )
                  .map((g) => `${g.voornaam} ${g.familienaam}`)
              : gebruiker &&
                (klas.leerkrachtIds.includes(gebruiker.uid) ||
                  gebruiker.klasIds.includes(klas.id))
              ? [`${gebruiker.voornaam} ${gebruiker.familienaam}`]
              : [];

            return (
              <div
                key={klas.id}
                className="border border-slate-200 rounded-2xl p-5 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">{klas.naam}</h3>
                    {isBeheerder && (
                      <div className="flex items-center gap-1.5">
                        <BewerkCirkelKnop
                          label={`${klas.naam} bewerken`}
                          onClick={() => openBewerkModal(klas)}
                        />
                        <button
                          type="button"
                          onClick={() => handleVerwijderen(klas)}
                          title="Klas verwijderen"
                          className="h-8 w-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors inline-flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <Users className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-700">Leerkracht(en): </span>
                      {gekoppeldeNamen.length > 0 ? (
                        <span>{gekoppeldeNamen.join(', ')}</span>
                      ) : (
                        <span className="text-slate-400">Nog niet toegewezen</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <GroeneBadge>
                    {aantalLeerlingen}{' '}
                    {aantalLeerlingen === 1 ? 'leerling' : 'leerlingen'}
                  </GroeneBadge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isBeheerder && (
        <FabToevoegKnop label="Klas toevoegen" onClick={openNieuwModal} />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleOpslaan}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {bewerkKlas ? 'Klas bewerken' : 'Nieuwe klas'}
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Naam van de klas
              </label>
              <input
                type="text"
                required
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder="bv. 1e kleuterklas - Uiltjes"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Leerkracht(en) koppelen
              </label>
              {schoolLeerkrachten.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Nog geen actieve gebruikers in deze school.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                  {schoolLeerkrachten.map((g) => (
                    <label
                      key={g.uid}
                      className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={leerkrachtIds.includes(g.uid)}
                        onChange={() => toggleLeerkracht(g.uid)}
                        className="rounded border-slate-300"
                      />
                      <span>
                        {g.voornaam} {g.familienaam}
                      </span>
                    </label>
                  ))}
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
    </div>
  );
}
