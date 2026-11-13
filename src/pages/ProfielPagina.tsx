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
          ? 'We hebben een bevestigingslink naar je nieuwe e-mailadres gestuurd. Klik op die link om de wijziging af te ronden.'
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
      <header className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mijn profiel</h1>
          <p className="text-sm text-slate-500">
            Beheer je persoonlijke gegevens en aanmeldgegevens voor KlasKompas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-kompas-50 text-kompas-800 border border-kompas-100 font-semibold">
            {t.rollen[gebruiker.rol]}
          </span>
          {gebruiker.schoolId && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
              School: {gebruiker.schoolId}
            </span>
          )}
        </div>
      </header>

      {/* Naam wijzigen */}
      <form
        onSubmit={handleNaamOpslaan}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <User className="h-4 w-4 text-kompas-700" />
          <h2>Naam</h2>
        </div>

        {naamMelding && <MeldingBalk melding={naamMelding} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="profiel-voornaam" className="block text-sm font-medium text-slate-700">
              Voornaam
            </label>
            <input
              id="profiel-voornaam"
              type="text"
              required
              value={voornaam}
              onChange={(e) => setVoornaam(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="profiel-familienaam"
              className="block text-sm font-medium text-slate-700"
            >
              Familienaam
            </label>
            <input
              id="profiel-familienaam"
              type="text"
              required
              value={familienaam}
              onChange={(e) => setFamilienaam(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={naamBezig}
            className="px-4 py-2 rounded-lg bg-kompas-700 hover:bg-kompas-800 disabled:opacity-60 text-white text-sm font-medium"
          >
            {naamBezig ? 'Opslaan…' : 'Naam opslaan'}
          </button>
        </div>
      </form>

      {/* E-mailadres wijzigen */}
      <form
        onSubmit={handleEmailOpslaan}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Mail className="h-4 w-4 text-kompas-700" />
          <h2>E-mailadres</h2>
        </div>

        {emailMelding && <MeldingBalk melding={emailMelding} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="profiel-email" className="block text-sm font-medium text-slate-700">
              E-mailadres
            </label>
            <input
              id="profiel-email"
              type="email"
              required
              value={nieuwEmail}
              onChange={(e) => setNieuwEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="profiel-email-ww"
              className="block text-sm font-medium text-slate-700"
            >
              Bevestig met huidig wachtwoord
            </label>
            <input
              id="profiel-email-ww"
              type="password"
              required
              autoComplete="current-password"
              value={emailWachtwoord}
              onChange={(e) => setEmailWachtwoord(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={emailBezig}
            className="px-4 py-2 rounded-lg bg-kompas-700 hover:bg-kompas-800 disabled:opacity-60 text-white text-sm font-medium"
          >
            {emailBezig ? 'Bezig…' : 'E-mailadres wijzigen'}
          </button>
        </div>
      </form>

      {/* Wachtwoord wijzigen */}
      <form
        onSubmit={handleWachtwoordOpslaan}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Lock className="h-4 w-4 text-kompas-700" />
          <h2>Wachtwoord wijzigen</h2>
        </div>

        {wwMelding && <MeldingBalk melding={wwMelding} />}

        <div className="space-y-1">
          <label htmlFor="ww-huidig" className="block text-sm font-medium text-slate-700">
            Huidig wachtwoord
          </label>
          <input
            id="ww-huidig"
            type="password"
            required
            autoComplete="current-password"
            value={huidigWachtwoord}
            onChange={(e) => setHuidigWachtwoord(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="ww-nieuw" className="block text-sm font-medium text-slate-700">
              Nieuw wachtwoord (min. 8 tekens)
            </label>
            <input
              id="ww-nieuw"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={nieuwWachtwoord}
              onChange={(e) => setNieuwWachtwoord(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="ww-bevestig" className="block text-sm font-medium text-slate-700">
              Herhaal nieuw wachtwoord
            </label>
            <input
              id="ww-bevestig"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={bevestigWachtwoord}
              onChange={(e) => setBevestigWachtwoord(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={wwBezig}
            className="px-4 py-2 rounded-lg bg-kompas-700 hover:bg-kompas-800 disabled:opacity-60 text-white text-sm font-medium"
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
      className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
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
