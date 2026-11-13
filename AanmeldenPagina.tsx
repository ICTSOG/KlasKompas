import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks';
import { t } from '@/i18n';

export function AanmeldenPagina() {
  const {
    isIngelogd,
    laden,
    authFout,
    inloggen,
    wachtwoordVergeten,
    wisAuthFout,
  } = useAuth();
  const location = useLocation();

  const [modus, setModus] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [bezig, setBezig] = useState(false);
  const [lokaleFout, setLokaleFout] = useState<string | null>(null);
  const [resetVerzonden, setResetVerzonden] = useState(false);

  const bestemming =
    (location.state as { van?: string } | null)?.van || '/klas/agenda';

  if (!laden && isIngelogd) {
    return <Navigate to={bestemming} replace />;
  }

  const zichtbareFout = lokaleFout || authFout;

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setLokaleFout(null);
    wisAuthFout();
    setBezig(true);

    try {
      await inloggen(email, wachtwoord);
    } catch (err) {
      setLokaleFout(err instanceof Error ? err.message : 'Aanmelden mislukt.');
    } finally {
      setBezig(false);
    }
  }

  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    setLokaleFout(null);
    setResetVerzonden(false);
    setBezig(true);

    try {
      await wachtwoordVergeten(email);
      setResetVerzonden(true);
    } catch (err) {
      setLokaleFout(
        err instanceof Error ? err.message : 'Kon geen herstelmail versturen.'
      );
    } finally {
      setBezig(false);
    }
  }

  function wisselModus(nieuweModus: 'login' | 'reset') {
    setModus(nieuweModus);
    setLokaleFout(null);
    setResetVerzonden(false);
    wisAuthFout();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Logo className="h-11 w-11 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t.app.naam}</h1>
            <p className="text-xs text-slate-500">{t.app.slagzin}</p>
          </div>
        </div>

        {zichtbareFout && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            <span>{zichtbareFout}</span>
          </div>
        )}

        {modus === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Aanmelden</h2>
              <p className="text-sm text-slate-500">
                Meld je aan met je schoolaccount om verder te gaan.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700"
              >
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@school.be"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-wachtwoord"
                  className="block text-sm font-medium text-slate-700"
                >
                  Wachtwoord
                </label>
                <button
                  type="button"
                  onClick={() => wisselModus('reset')}
                  className="text-xs font-medium text-kompas-700 hover:underline"
                >
                  Wachtwoord vergeten?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-wachtwoord"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={wachtwoord}
                  onChange={(e) => setWachtwoord(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={bezig}
              style={{
                backgroundColor: 'var(--kleur-primair)',
                color: 'var(--kleur-primair-tekst)',
              }}
              className="w-full py-2.5 px-4 rounded-lg hover:opacity-95 disabled:opacity-60 font-medium text-sm transition-opacity"
            >
              {bezig ? 'Bezig met aanmelden…' : 'Aanmelden'}
            </button>

            <p className="text-xs text-center text-slate-400 pt-1">
              Nog geen account? Vraag je schoolbeheerder om je uit te nodigen.
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Wachtwoord opnieuw instellen
              </h2>
              <p className="text-sm text-slate-500">
                Vul je e-mailadres in. We sturen je een link om een nieuw wachtwoord te
                kiezen.
              </p>
            </div>

            {resetVerzonden && (
              <div
                role="status"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                <span>
                  Als dit e-mailadres gekend is, ontvang je binnen enkele minuten een
                  e-mail om je wachtwoord opnieuw in te stellen.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium text-slate-700"
              >
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@school.be"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={bezig}
              style={{
                backgroundColor: 'var(--kleur-primair)',
                color: 'var(--kleur-primair-tekst)',
              }}
              className="w-full py-2.5 px-4 rounded-lg hover:opacity-95 disabled:opacity-60 font-medium text-sm transition-opacity"
            >
              {bezig ? 'Herstelmail versturen…' : 'Herstelmail versturen'}
            </button>

            <button
              type="button"
              onClick={() => wisselModus('login')}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 pt-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Terug naar aanmelden</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
