import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Send,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import {
  BewerkCirkelKnop,
  FabToevoegKnop,
  GroeneBadge,
  LegeToestand,
} from '@/components/UiElementen';
import { useActieveSchool, useAuth, useGebruikers, useKlassen } from '@/hooks';
import { t } from '@/i18n';
import type { Gebruiker, GebruikersStatus } from '@/types';

type SchoolBeheerbareRol = 'schoolbeheerder' | 'leerkracht';

export function GebruikersPagina() {
  const { gebruiker: huidigeGebruiker } = useAuth();
  const { actieveSchoolId } = useActieveSchool();
  const {
    gebruikers,
    laden,
    fout,
    gebruikerToevoegen,
    gebruikerBijwerken,
    gebruikerInactiefZetten,
    resetMailOpnieuwSturen,
  } = useGebruikers();
  const { klassen } = useKlassen();

  const [melding, setMelding] = useState<{
    soort: 'succes' | 'fout';
    tekst: string;
  } | null>(null);

  // Toevoegen modal state
  const [nieuwOpen, setNieuwOpen] = useState(false);
  const [nieuwEmail, setNieuwEmail] = useState('');
  const [nieuwVoornaam, setNieuwVoornaam] = useState('');
  const [nieuwFamilienaam, setNieuwFamilienaam] = useState('');
  const [nieuwRol, setNieuwRol] = useState<SchoolBeheerbareRol>('leerkracht');
  const [nieuwKlasIds, setNieuwKlasIds] = useState<string[]>([]);
  const [opslaanBezig, setOpslaanBezig] = useState(false);
  const [modalFout, setModalFout] = useState<string | null>(null);

  // Bewerken modal state
  const [bewerkGebruiker, setBewerkGebruiker] = useState<Gebruiker | null>(null);
  const [bewerkVoornaam, setBewerkVoornaam] = useState('');
  const [bewerkFamilienaam, setBewerkFamilienaam] = useState('');
  const [bewerkRol, setBewerkRol] = useState<SchoolBeheerbareRol>('leerkracht');
  const [bewerkKlasIds, setBewerkKlasIds] = useState<string[]>([]);
  const [bewerkStatus, setBewerkStatus] = useState<GebruikersStatus>('actief');
  const [resetBezig, setResetBezig] = useState(false);

  if (!actieveSchoolId) {
    return (
      <LegeToestand
        icon={Users}
        titel="Geen school geselecteerd"
        beschrijving="Kies eerst een school in de topbalk om gebruikers te beheren."
      />
    );
  }

  function openNieuwModal() {
    setNieuwEmail('');
    setNieuwVoornaam('');
    setNieuwFamilienaam('');
    setNieuwRol('leerkracht');
    setNieuwKlasIds([]);
    setModalFout(null);
    setNieuwOpen(true);
  }

  function openBewerkModal(g: Gebruiker) {
    setBewerkGebruiker(g);
    setBewerkVoornaam(g.voornaam);
    setBewerkFamilienaam(g.familienaam);
    setBewerkRol(g.rol === 'schoolbeheerder' ? 'schoolbeheerder' : 'leerkracht');
    setBewerkKlasIds(g.klasIds ?? []);
    setBewerkStatus(g.status);
    setModalFout(null);
  }

  function toggleKlas(lijst: string[], klasId: string): string[] {
    return lijst.includes(klasId)
      ? lijst.filter((id) => id !== klasId)
      : [...lijst, klasId];
  }

  async function handleToevoegen(e: FormEvent) {
    e.preventDefault();
    setModalFout(null);
    setOpslaanBezig(true);
    try {
      await gebruikerToevoegen({
        email: nieuwEmail,
        voornaam: nieuwVoornaam,
        familienaam: nieuwFamilienaam,
        rol: nieuwRol,
        klasIds: nieuwKlasIds,
      });
      setNieuwOpen(false);
      setMelding({
        soort: 'succes',
        tekst: `Account voor ${nieuwVoornaam} ${nieuwFamilienaam} is aangemaakt. Er is automatisch een wachtwoord-resetmail verstuurd naar ${nieuwEmail.trim()}.`,
      });
    } catch (err) {
      setModalFout(err instanceof Error ? err.message : 'Aanmaken mislukt.');
    } finally {
      setOpslaanBezig(false);
    }
  }

  async function handleBewerken(e: FormEvent) {
    e.preventDefault();
    if (!bewerkGebruiker) return;
    setModalFout(null);
    setOpslaanBezig(true);
    try {
      await gebruikerBijwerken(bewerkGebruiker, {
        voornaam: bewerkVoornaam,
        familienaam: bewerkFamilienaam,
        rol: bewerkRol,
        klasIds: bewerkKlasIds,
        status: bewerkStatus,
      });
      setBewerkGebruiker(null);
      setMelding({
        soort: 'succes',
        tekst: `Gegevens van ${bewerkVoornaam} ${bewerkFamilienaam} zijn bijgewerkt.`,
      });
    } catch (err) {
      setModalFout(err instanceof Error ? err.message : 'Opslaan mislukt.');
    } finally {
      setOpslaanBezig(false);
    }
  }

  async function handleResetMail(email: string) {
    setModalFout(null);
    setResetBezig(true);
    try {
      await resetMailOpnieuwSturen(email);
      setMelding({
        soort: 'succes',
        tekst: `Nieuwe wachtwoord-resetmail verstuurd naar ${email}.`,
      });
    } catch (err) {
      setModalFout(err instanceof Error ? err.message : 'Versturen mislukt.');
    } finally {
      setResetBezig(false);
    }
  }

  async function handleInactiefZetten(g: Gebruiker) {
    if (g.uid === huidigeGebruiker?.uid) return;
    if (
      !window.confirm(
        `Wil je ${g.voornaam} ${g.familienaam} op inactief zetten? Deze persoon kan dan niet meer aanmelden.`
      )
    ) {
      return;
    }
    try {
      await gebruikerInactiefZetten(g.uid);
      setMelding({
        soort: 'succes',
        tekst: `${g.voornaam} ${g.familienaam} is op inactief gezet.`,
      });
    } catch (err) {
      setMelding({
        soort: 'fout',
        tekst: err instanceof Error ? err.message : 'Actie mislukt.',
      });
    }
  }

  return (
    <div className="space-y-6 pb-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gebruikers van de school</h2>
          <p className="text-sm text-slate-500">
            Beheer leerkrachten en schoolbeheerders en wijs klassen toe.
          </p>
        </div>
        <GroeneBadge>
          {gebruikers.filter((g) => g.status === 'actief').length} actief
        </GroeneBadge>
      </div>

      {melding && (
        <div
          role={melding.soort === 'succes' ? 'status' : 'alert'}
          className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border text-sm ${
            melding.soort === 'succes'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {melding.soort === 'succes' ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            )}
            <span>{melding.tekst}</span>
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
          Kon gebruikers niet laden: {fout.message}
        </div>
      )}

      {laden ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Gebruikers laden…
        </div>
      ) : gebruikers.length === 0 ? (
        <LegeToestand
          icon={Users}
          titel="Nog geen gebruikers in deze school"
          beschrijving="Klik op de gele plusknop rechtsonder om een eerste leerkracht of schoolbeheerder toe te voegen."
        />
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Gebruiker</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Klassen</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {gebruikers.map((g) => {
                const initialen =
                  `${g.voornaam.charAt(0)}${g.familienaam.charAt(0)}`.toUpperCase();
                const isEigenAccount = g.uid === huidigeGebruiker?.uid;
                const isSuperDoel = g.rol === 'superbeheerder';

                return (
                  <tr key={g.uid} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span
                          style={{
                            backgroundColor: 'var(--kleur-primair-licht)',
                            color: 'var(--kleur-primair)',
                          }}
                          className="h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0"
                        >
                          {initialen}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {g.voornaam} {g.familienaam}
                            {isEigenAccount && (
                              <span className="ml-2 text-[11px] font-normal text-slate-400">
                                (jij)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{g.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {t.rollen[g.rol]}
                    </td>
                    <td className="py-3 px-4">
                      {g.klasIds.length === 0 ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {g.klasIds.map((kid) => {
                            const klas = klassen.find((k) => k.id === kid);
                            return (
                              <span
                                key={kid}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs"
                              >
                                {klas ? klas.naam : kid}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {g.status === 'actief' ? (
                        <GroeneBadge>Actief</GroeneBadge>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                          Inactief
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {!isEigenAccount && !isSuperDoel && (
                          <>
                            <BewerkCirkelKnop
                              label={`${g.voornaam} bewerken`}
                              onClick={() => openBewerkModal(g)}
                            />
                            {g.status === 'actief' && (
                              <button
                                type="button"
                                onClick={() => handleInactiefZetten(g)}
                                title="Op inactief zetten"
                                aria-label={`${g.voornaam} op inactief zetten`}
                                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors inline-flex items-center justify-center"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FabToevoegKnop label="Gebruiker toevoegen" onClick={openNieuwModal} />

      {/* Modal: Nieuwe gebruiker */}
      {nieuwOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleToevoegen}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Nieuwe gebruiker</h3>
              <button
                type="button"
                onClick={() => setNieuwOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Het account wordt aangemaakt zonder jouw eigen sessie te onderbreken. De
              gebruiker ontvangt meteen een e-mail om zelf een wachtwoord te kiezen.
            </p>

            {modalFout && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {modalFout}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={nieuwEmail}
                  onChange={(e) => setNieuwEmail(e.target.value)}
                  placeholder="leerkracht@school.be"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Voornaam
                </label>
                <input
                  type="text"
                  required
                  value={nieuwVoornaam}
                  onChange={(e) => setNieuwVoornaam(e.target.value)}
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
                  value={nieuwFamilienaam}
                  onChange={(e) => setNieuwFamilienaam(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Rol</label>
              <select
                value={nieuwRol}
                onChange={(e) => setNieuwRol(e.target.value as SchoolBeheerbareRol)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="leerkracht">Leerkracht</option>
                <option value="schoolbeheerder">Schoolbeheerder</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Toegewezen klassen
              </label>
              {klassen.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Maak eerst klassen aan onder School &gt; Klassen.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                  {klassen.map((k) => (
                    <label
                      key={k.id}
                      className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={nieuwKlasIds.includes(k.id)}
                        onChange={() =>
                          setNieuwKlasIds((prev) => toggleKlas(prev, k.id))
                        }
                        className="rounded border-slate-300"
                      />
                      <span className="truncate">{k.naam}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNieuwOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={opslaanBezig}
                style={{
                  backgroundColor: 'var(--kleur-primair)',
                  color: 'var(--kleur-primair-tekst)',
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-60"
              >
                {opslaanBezig ? 'Aanmaken & mailen…' : 'Toevoegen & reset-mail sturen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Gebruiker bewerken */}
      {bewerkGebruiker && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleBewerken}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Gebruiker bewerken</h3>
                <p className="text-xs text-slate-500">{bewerkGebruiker.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setBewerkGebruiker(null)}
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
                  value={bewerkVoornaam}
                  onChange={(e) => setBewerkVoornaam(e.target.value)}
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
                  value={bewerkFamilienaam}
                  onChange={(e) => setBewerkFamilienaam(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Rol</label>
                <select
                  value={bewerkRol}
                  onChange={(e) => setBewerkRol(e.target.value as SchoolBeheerbareRol)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="leerkracht">Leerkracht</option>
                  <option value="schoolbeheerder">Schoolbeheerder</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={bewerkStatus}
                  onChange={(e) => setBewerkStatus(e.target.value as GebruikersStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="actief">Actief</option>
                  <option value="inactief">Inactief</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Toegewezen klassen
              </label>
              {klassen.length === 0 ? (
                <p className="text-xs text-slate-400">Nog geen klassen beschikbaar.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                  {klassen.map((k) => (
                    <label
                      key={k.id}
                      className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={bewerkKlasIds.includes(k.id)}
                        onChange={() =>
                          setBewerkKlasIds((prev) => toggleKlas(prev, k.id))
                        }
                        className="rounded border-slate-300"
                      />
                      <span className="truncate">{k.naam}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={resetBezig}
                onClick={() => handleResetMail(bewerkGebruiker.email)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{resetBezig ? 'Versturen…' : 'Nieuwe reset-mail sturen'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBewerkGebruiker(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={opslaanBezig}
                  style={{
                    backgroundColor: 'var(--kleur-primair)',
                    color: 'var(--kleur-primair-tekst)',
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-60"
                >
                  {opslaanBezig ? 'Opslaan…' : 'Opslaan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
