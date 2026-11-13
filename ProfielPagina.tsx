import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks';
import { t } from '@/i18n';

export function ProfielPagina() {
  const { gebruiker, naamBijwerken, emailBijwerken, wachtwoordWijzigen } = useAuth();

  const [voornaam, setVoornaam] = useState('');
  const [familienaam, setFamilienaam] = useState('');
  const [naamBezig, setNaamBezig] = useState(false);
  const [naamMelding, setNaamMelding] = useState<{
    soort: 'succes' | 'fout';
    tekst: string;
  } | null>(null);

  const [nieuwEmail, setNieuwEmail] = useState('');
  const [emailWachtwoord, setEmailWachtwoord] = useState('');
  const [emailBezig, setEmailBezig] = useState(false);
  const [emailMelding, setEmailMelding] = useState<{
    soort: 'succes' | 'fout';
    tekst: string;
  } | null>(null);

  const [huidigWachtwoord, setHuidigWachtwoord] = useState('');
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('');
  const [bevestigWachtwoord, setBevestigWachtwoord] = useState('');
  const [wwBezig, setWwBezig] = useState(false);
  const [wwMelding, setWwMelding] = useState<{
    soort: 'succes' | 'fout';
    tekst: string;
  } | null>(null);

  useEffect(() => {
    if (gebruiker) {
      setVoornaam(gebruiker.voornaam);
      setFamilienaam(gebruiker.familienaam);
      setNieuwEmail(gebruiker.email);
    }
  }, [gebruiker]);

  if (!gebruiker) return null;

  async function handleNaamOpslaan(e: FormEvent) {
    e.preventDefault();
    setNaamMelding(null);
    setNaamBezig(true);
    try {
      await naamBijwerken({ voornaam, familienaam });
      setNaamMelding({
        soort: 'succes',
        tekst: 'Je naam is succesvol bijgewerkt.',
      });
    } catch (err) {
      setNaamMelding({
        soort: 'fout',
        tekst: err instanceof Error ? err.message : 'Opslaan mislukt.',
      });
    } finally {
      setNaamBezig(false);
    }
  }

  async function handleEmailOpslaan(e: FormEvent) {
    e.preventDefault();
    setEmailMelding(null);

    if (nieuwEmail.trim() === gebruiker?.email) {
      setEmailMelding({
        soort: 'fout',
        tekst: 'Dit is al je huidige e-mailadres.',
      });
      return;
    }

    setEmailBezig(true);
    try {
      const res = await emailBijwerken(nieuwEmail, emailWachtwoord);
      setEmailWachtwoord('');
      setEmailMelding({
        soort: 'succes',
        tekst: res.verificatieVerzonden
          ? 'We hebben een bevestigingslink naar je nieuwe e-mailadres gestuurd.'
          : 'Je e-mailadres is bijgewerkt.',
      });
    } catch (err) {
      setEmailMelding({
        soort: 'fout',
        tekst: err instanceof Error ? err.message : 'Wijzigen van e-mailadres mislukt.',
      });
    } finally {
      setEmailBezig(false);
    }
  }

  async function handleWachtwoordOpslaan(e: FormEvent) {
    e.preventDefault();
    setWwMelding(null);

    if (nieuwWachtwoord !== bevestigWachtwoord) {
      setWwMelding({
        soort: 'fout',
        tekst: 'De twee nieuwe wachtwoorden komen niet overeen.',
      });
      return;
    }

    setWwBezig(true);
    try {
      await wachtwoordWijzigen(huidigWachtwoord, nieuwWachtwoord);
      setHuidigWachtwoord('');
      setNieuwWachtwoord('');
      setBevestigWachtwoord('');
      setWwMelding({
        soort: 'succes',
        tekst: 'Je wachtwoord is gewijzigd.',
      });
    } catch (err) {
      setWwMelding({
        soort: 'fout',
        tekst: err instanceof Error ? err.message : 'Wijzigen van wachtwoord mislukt.',
      });
    } finally {
      setWwBezig(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mijn profiel</h2>
          <p className="text-sm text-slate-500">
            Beheer je persoonlijke gegevens en aanmeldgegevens.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-kompas-50 text-kompas-800 border border-kompas-100 text-xs font-semibold">
          {t.rollen[gebruiker.rol]}
        </span>
      </div>

      <form onSubmit={handleNaamOpslaan} className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <User className="h-4 w-4 text-kompas-700" />
          <h3>Naam</h3>
        </div>
        {naamMelding && <MeldingBalk melding={naamMelding} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Voornaam</label>
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
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={naamBezig}
            style={{
              backgroundColor: 'var(--kleur-primair)',
              color: 'var(--kleur-primair-tekst)',
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-60"
          >
            {naamBezig ? 'Opslaan…' : 'Naam opslaan'}
          </button>
        </div>
      </form>

      <form
        onSubmit={handleEmailOpslaan}
        className="space-y-4 pt-6 border-t border-slate-100"
      >
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Mail className="h-4 w-4 text-kompas-700" />
          <h3>E-mailadres</h3>
        </div>
        {emailMelding && <MeldingBalk melding={emailMelding} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              E-mailadres
            </label>
            <input
              type="email"
              required
              value={nieuwEmail}
              onChange={(e) => setNieuwEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Bevestig met huidig wachtwoord
            </label>
            <input
              type="password"
              required
              value={emailWachtwoord}
              onChange={(e) => setEmailWachtwoord(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={emailBezig}
            style={{
              backgroundColor: 'var(--kleur-primair)',
              color: 'var(--kleur-primair-tekst)',
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-60"
          >
            {emailBezig ? 'Bezig…' : 'E-mailadres wijzigen'}
          </button>
        </div>
      </form>

      <form
        onSubmit={handleWachtwoordOpslaan}
        className="space-y-4 pt-6 border-t border-slate-100"
      >
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Lock className="h-4 w-4 text-kompas-700" />
          <h3>Wachtwoord wijzigen</h3>
        </div>
        {wwMelding && <MeldingBalk melding={wwMelding} />}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Huidig wachtwoord
          </label>
          <input
            type="password"
            required
            value={huidigWachtwoord}
            onChange={(e) => setHuidigWachtwoord(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Nieuw wachtwoord (min. 8 tekens)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={nieuwWachtwoord}
              onChange={(e) => setNieuwWachtwoord(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Herhaal nieuw wachtwoord
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={bevestigWachtwoord}
              onChange={(e) => setBevestigWachtwoord(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={wwBezig}
            style={{
              backgroundColor: 'var(--kleur-primair)',
              color: 'var(--kleur-primair-tekst)',
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-60"
          >
            {wwBezig ? 'Wijzigen…' : 'Wachtwoord wijzigen'}
          </button>
        </div>
      </form>
    </div>
  );
}

function MeldingBalk({
  melding,
}: {
  melding: { soort: 'succes' | 'fout'; tekst: string };
}) {
  const isSucces = melding.soort === 'succes';
  return (
    <div
      role={isSucces ? 'status' : 'alert'}
      className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${
        isSucces
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-800'
      }`}
    >
      {isSucces ? (
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
      )}
      <span>{melding.tekst}</span>
    </div>
  );
}
