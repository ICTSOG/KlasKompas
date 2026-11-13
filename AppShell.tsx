import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  School as SchoolIcon,
  GraduationCap,
  Shapes,
  Target,
  Settings,
  Sparkles,
  Calendar,
  CheckSquare,
  Eye,
  BarChart3,
  LayoutGrid,
  HelpCircle,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  UserCircle2,
  LogOut,
  Plus,
} from 'lucide-react';
import { Logo } from './Logo';
import { t } from '@/i18n';
import { useActieveSchool, useAuth, useDoelen, useKlassen } from '@/hooks';

interface MenuItem {
  to: string;
  label: string;
  icon: typeof BookOpen;
  enkelBeheerder?: boolean;
}

const schoolMenuItems: MenuItem[] = [
  { to: '/school/gebruikers', label: t.navigatie.gebruikers, icon: Users, enkelBeheerder: true },
  { to: '/school/klassen', label: t.navigatie.klassen, icon: SchoolIcon },
  { to: '/school/leerlingen', label: t.navigatie.leerlingen, icon: GraduationCap },
  { to: '/school/iconen', label: t.navigatie.iconen, icon: Shapes },
  { to: '/school/jaardoelen', label: t.navigatie.jaardoelen, icon: Target },
  {
    to: '/school/instellingen',
    label: t.navigatie.instellingen,
    icon: Settings,
    enkelBeheerder: true,
  },
];

const klasMenuItems: MenuItem[] = [
  { to: '/klas/leerlingen', label: t.navigatie.leerlingen, icon: GraduationCap },
  { to: '/klas/keuze-activiteiten', label: t.navigatie.keuzeactiviteiten, icon: Sparkles },
  { to: '/klas/agenda', label: t.navigatie.agenda, icon: Calendar },
  { to: '/klas/doelen', label: t.navigatie.doelenEvaluaties, icon: CheckSquare },
  { to: '/klas/observaties', label: t.navigatie.observaties, icon: Eye },
  { to: '/klas/inzichten', label: t.navigatie.inzichten, icon: BarChart3 },
  { to: '/klas/iconen', label: t.navigatie.iconen, icon: Shapes },
  { to: '/klas/keuzebord', label: t.navigatie.keuzebord, icon: LayoutGrid },
];

const ROUTE_TITELS: Record<string, { titel: string; help: string }> = {
  '/lesplanbibliotheek': {
    titel: 'Lesplanbibliotheek',
    help: 'Beheer en hergebruik lesplannen over verschillende klassen en weken heen.',
  },
  '/school/gebruikers': {
    titel: 'Gebruikersbeheer',
    help: 'Voeg leerkrachten en schoolbeheerders toe. Nieuwe gebruikers ontvangen automatisch een e-mail om hun wachtwoord in te stellen.',
  },
  '/school/klassen': {
    titel: 'Klassen',
    help: 'Overzicht van alle klassen van de school, gekoppelde leerkrachten en het aantal ingeschreven leerlingen.',
  },
  '/school/leerlingen': {
    titel: 'Leerlingen (School)',
    help: 'Zoek, filter, bewerk of importeer leerlingen via CSV. Wijzigingen worden automatisch gesynchroniseerd met het keuzebord.',
  },
  '/school/iconen': {
    titel: 'Iconen bibliotheek (School)',
    help: 'Beheer pictogrammen en iconen voor leerlingen en keuzeactiviteiten binnen de school.',
  },
  '/school/jaardoelen': {
    titel: 'Jaardoelen',
    help: 'Stel doelencollecties samen uit de leerlijn- en minimumdoelen.',
  },
  '/school/instellingen': {
    titel: 'Schoolinstellingen',
    help: 'Beheer de gegevens en voorkeuren van deze school.',
  },
  '/klas/leerlingen': {
    titel: 'Leerlingen (Klas)',
    help: 'Bekijk en beheer de leerlingen van de geselecteerde klas.',
  },
  '/klas/keuze-activiteiten': {
    titel: 'Keuze-activiteiten',
    help: 'Richt hoeken en keuzeactiviteiten in voor het digitale keuzebord van deze klas.',
  },
  '/klas/agenda': {
    titel: 'Weekagenda',
    help: 'Plan lesmomenten, hoekenwerk en keuzebordmomenten per week.',
  },
  '/klas/doelen': {
    titel: 'Doelen & evaluaties',
    help: 'Volg de groei van leerlingen op leerlijn- en minimumdoelen.',
  },
  '/klas/observaties': {
    titel: 'Observaties',
    help: 'Leg observaties met foto of doelkoppeling vast per leerling.',
  },
  '/klas/inzichten': {
    titel: 'Inzichten',
    help: 'Analyseer keuzegedrag, doeldekking en observaties van de klas.',
  },
  '/klas/iconen': {
    titel: 'Iconen bibliotheek (Klas)',
    help: 'Kies of beheer pictogrammen voor deze klas.',
  },
  '/klas/keuzebord': {
    titel: 'Keuze- & Reflectiebord',
    help: 'Start of volg het digitale keuzebord voor de geselecteerde klas.',
  },
  '/profiel': {
    titel: 'Mijn profiel',
    help: 'Pas je naam, e-mailadres of wachtwoord aan.',
  },
};

export function AppShell() {
  const { gebruiker, uitloggen } = useAuth();
  const {
    actieveSchoolId,
    actieveSchool,
    alleScholen,
    selecteerSchool,
    nieuweSchoolAanmaken,
    actieveKlasId,
    selecteerKlas,
  } = useActieveSchool();
  const { klassen } = useKlassen();
  const { doelen, laden: doelenLaden } = useDoelen();

  const location = useLocation();
  const navigate = useNavigate();

  const [ingeklapt, setIngeklapt] = useState(false);
  const [mobielOpen, setMobielOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [meldingenOpen, setMeldingenOpen] = useState(false);
  const [profielMenuOpen, setProfielMenuOpen] = useState(false);
  const [nieuweSchoolModal, setNieuweSchoolModal] = useState(false);
  const [nieuweSchoolNaam, setNieuweSchoolNaam] = useState('');
  const [schoolAanmakenBezig, setSchoolAanmakenBezig] = useState(false);

  const gebruikersMenuRef = useRef<HTMLDivElement>(null);

  const isBeheerder =
    gebruiker?.rol === 'schoolbeheerder' || gebruiker?.rol === 'superbeheerder';
  const isSuper = gebruiker?.rol === 'superbeheerder';

  // Kies automatisch een geldige klas in de klas-selector zodra klassen geladen zijn
  useEffect(() => {
    if (klassen.length === 0) return;
    if (!actieveKlasId || !klassen.some((k) => k.id === actieveKlasId)) {
      selecteerKlas(klassen[0].id);
    }
  }, [klassen, actieveKlasId, selecteerKlas]);

  // Sluit mobiele zijbalk bij routewissel
  useEffect(() => {
    setMobielOpen(false);
    setHelpOpen(false);
    setMeldingenOpen(false);
    setProfielMenuOpen(false);
  }, [location.pathname]);

  // Sluit gebruikersmenu bij klik buiten
  useEffect(() => {
    function handleKlikBuiten(e: MouseEvent) {
      if (
        gebruikersMenuRef.current &&
        !gebruikersMenuRef.current.contains(e.target as Node)
      ) {
        setProfielMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleKlikBuiten);
    return () => document.removeEventListener('mousedown', handleKlikBuiten);
  }, []);

  const huidigeInfo = useMemo(() => {
    return (
      ROUTE_TITELS[location.pathname] ?? {
        titel: t.app.naam,
        help: t.app.slagzin,
      }
    );
  }, [location.pathname]);

  const zichtbareSchoolMenu = schoolMenuItems.filter(
    (item) => !item.enkelBeheerder || isBeheerder
  );

  const initialen = gebruiker
    ? `${gebruiker.voornaam.charAt(0)}${gebruiker.familienaam.charAt(0)}`.toUpperCase()
    : 'KK';

  const schoolNaamLabel =
    actieveSchool?.naam ||
    (actieveSchoolId ? `School (${actieveSchoolId})` : 'Geen school gekozen');

  async function handleNieuweSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!nieuweSchoolNaam.trim()) return;
    setSchoolAanmakenBezig(true);
    try {
      await nieuweSchoolAanmaken(nieuweSchoolNaam);
      setNieuweSchoolNaam('');
      setNieuweSchoolModal(false);
    } finally {
      setSchoolAanmakenBezig(false);
    }
  }

  async function handleUitloggen() {
    await uitloggen();
    navigate('/aanmelden', { replace: true });
  }

  const zijbalkInhoud = (
    <div
      style={{ backgroundColor: 'var(--kleur-zijbalk)' }}
      className="h-full flex flex-col border-r border-slate-200 select-none"
    >
      {/* Logo & inklapknop */}
      <div className="h-16 px-3.5 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Logo className="h-9 w-9 shrink-0" />
          {!ingeklapt && (
            <div className="min-w-0">
              <div className="font-bold text-slate-900 leading-tight truncate">
                {t.app.naam}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Kleuter &amp; Basis
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIngeklapt((v) => !v)}
          title={ingeklapt ? 'Zijbalk uitklappen' : 'Zijbalk inklappen'}
          className="hidden md:inline-flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition-colors"
        >
          {ingeklapt ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobielOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70"
          aria-label="Menu sluiten"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigatie */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
        {/* Bovenaan: Lesplanbibliotheek */}
        <div>
          <ZijbalkLink
            to="/lesplanbibliotheek"
            label={t.navigatie.lesplanbibliotheek}
            icon={BookOpen}
            ingeklapt={ingeklapt}
          />
        </div>

        {/* Sectie SCHOOL */}
        <div className="space-y-1">
          {!ingeklapt && (
            <div className="px-2.5 pb-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t.navigatie.sectieSchool}
              </div>
              <div
                className="text-xs font-semibold text-slate-700 truncate mt-0.5"
                title={schoolNaamLabel}
              >
                {schoolNaamLabel}
              </div>
            </div>
          )}
          {zichtbareSchoolMenu.map((item) => (
            <ZijbalkLink
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              ingeklapt={ingeklapt}
            />
          ))}
        </div>

        {/* Sectie KLAS met klas-selector */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
          {!ingeklapt && (
            <div className="px-2.5 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t.navigatie.sectieKlas}
              </div>
              <select
                aria-label="Selecteer actieve klas"
                value={actieveKlasId}
                onChange={(e) => selecteerKlas(e.target.value)}
                disabled={klassen.length === 0}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-kompas-500 disabled:opacity-60"
              >
                {klassen.length === 0 ? (
                  <option value="">Geen klassen beschikbaar</option>
                ) : (
                  klassen.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.naam}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="space-y-1">
            {klasMenuItems.map((item) => (
              <ZijbalkLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                ingeklapt={ingeklapt}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Versienummer onderaan */}
      <div className="px-3.5 py-3 border-t border-slate-200/80 text-[11px] text-slate-500 shrink-0">
        {ingeklapt ? (
          <div className="text-center font-mono">v0.2</div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-600">{t.app.versie}</span>
            <span className="text-slate-400">
              {doelenLaden ? '…' : t.status.doelenGeladen(doelen.length)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobiele backdrop */}
      {mobielOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={() => setMobielOpen(false)}
        />
      )}

      {/* Mobiele zijbalk */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 transform transition-transform duration-200 md:hidden ${
          mobielOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {zijbalkInhoud}
      </aside>

      {/* Desktop zijbalk */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ${
          ingeklapt ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{zijbalkInhoud}</div>
      </aside>

      {/* Rechterkolom: topbalk + wit contentvlak */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobielOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigatiemenu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">
              {huidigeInfo.titel}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Schoolkiezer voor superbeheerder */}
            {isSuper && (
              <div className="flex items-center gap-1.5">
                <select
                  aria-label="Selecteer actieve school"
                  value={actieveSchoolId ?? ''}
                  onChange={(e) => selecteerSchool(e.target.value)}
                  className="max-w-[190px] sm:max-w-[230px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-kompas-500"
                >
                  {alleScholen.length === 0 ? (
                    <option value="">Nog geen scholen</option>
                  ) : (
                    alleScholen.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.naam}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setNieuweSchoolModal(true)}
                  title="Nieuwe school aanmaken"
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Help-icoon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setHelpOpen((v) => !v);
                  setMeldingenOpen(false);
                }}
                title="Hulp bij dit scherm"
                aria-label="Hulp bij dit scherm"
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              {helpOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-xs text-slate-600 z-30">
                  <div className="font-semibold text-slate-900 mb-1">
                    {huidigeInfo.titel}
                  </div>
                  <p className="leading-relaxed">{huidigeInfo.help}</p>
                </div>
              )}
            </div>

            {/* Belletje met rode badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMeldingenOpen((v) => !v);
                  setHelpOpen(false);
                }}
                title="Meldingen"
                aria-label="Meldingen"
                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
              </button>
              {meldingenOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-xs z-30 space-y-2">
                  <div className="font-semibold text-slate-900">Meldingen</div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
                    Welkom in <strong>KlasKompas Fase 2</strong>. Gebruikers-, klassen- en
                    leerlingenbeheer zijn actief met realtime synchronisatie.
                  </div>
                </div>
              )}
            </div>

            {/* Gebruikersmenu */}
            <div className="relative" ref={gebruikersMenuRef}>
              <button
                type="button"
                onClick={() => setProfielMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <span
                  style={{
                    backgroundColor: 'var(--kleur-primair)',
                    color: 'var(--kleur-primair-tekst)',
                  }}
                  className="h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center"
                >
                  {initialen}
                </span>
                <span className="hidden sm:block text-left">
                  <span className="block text-xs font-semibold text-slate-800 leading-tight">
                    {gebruiker?.voornaam} {gebruiker?.familienaam}
                  </span>
                  <span className="block text-[11px] text-slate-500 leading-tight">
                    {gebruiker ? t.rollen[gebruiker.rol] : ''}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {profielMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 text-sm z-30">
                  <NavLink
                    to="/profiel"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    <UserCircle2 className="h-4 w-4 text-slate-500" />
                    <span>{t.navigatie.profiel}</span>
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleUitloggen}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-700 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t.navigatie.afmelden}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Wit contentvlak */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-sm p-5 md:p-7 min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modal: nieuwe school aanmaken voor superbeheerder */}
      {nieuweSchoolModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleNieuweSchool}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-slate-900">Nieuwe school aanmaken</h2>
            <p className="text-sm text-slate-500">
              Maak een nieuwe schoolomgeving aan om meteen gebruikers, klassen en
              leerlingen te beheren.
            </p>
            <div>
              <label
                htmlFor="nieuwe-school-naam"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Schoolnaam
              </label>
              <input
                id="nieuwe-school-naam"
                type="text"
                required
                value={nieuweSchoolNaam}
                onChange={(e) => setNieuweSchoolNaam(e.target.value)}
                placeholder="bv. Vrije Basisschool De Kompasnaald"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kompas-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNieuweSchoolModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={schoolAanmakenBezig}
                style={{
                  backgroundColor: 'var(--kleur-primair)',
                  color: 'var(--kleur-primair-tekst)',
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-60"
              >
                {schoolAanmakenBezig ? 'Aanmaken…' : 'School aanmaken'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ZijbalkLink({
  to,
  label,
  icon: Icon,
  ingeklapt,
}: {
  to: string;
  label: string;
  icon: typeof BookOpen;
  ingeklapt: boolean;
}) {
  return (
    <NavLink
      to={to}
      title={ingeklapt ? label : undefined}
      style={({ isActive }) =>
        isActive
          ? {
              backgroundColor: 'var(--kleur-primair-licht)',
              color: 'var(--kleur-primair)',
            }
          : undefined
      }
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
          ingeklapt ? 'justify-center' : ''
        } ${
          isActive
            ? 'font-semibold shadow-2xs'
            : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!ingeklapt && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
