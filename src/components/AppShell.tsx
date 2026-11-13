import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Calendar,
  LayoutGrid,
  Eye,
  Target,
  BarChart3,
  Users,
  Settings,
  Compass,
  LogOut,
  UserCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo';
import { t } from '@/i18n';
import { useAuth, useDoelen } from '@/hooks';
import type { GebruikersRol } from '@/types';

interface NavigatieItem {
  to: string;
  label: string;
  icon: typeof Compass;
  end?: boolean;
  rollen?: GebruikersRol[];
}

const hoofdNavigatie: NavigatieItem[] = [
  { to: '/', label: t.navigatie.overzicht, icon: Compass, end: true },
  { to: '/agenda', label: t.navigatie.agenda, icon: Calendar },
  { to: '/keuzebord', label: t.navigatie.keuzebord, icon: LayoutGrid },
  { to: '/observaties', label: t.navigatie.observaties, icon: Eye },
  { to: '/doelen', label: t.navigatie.doelen, icon: Target },
  { to: '/inzichten', label: t.navigatie.inzichten, icon: BarChart3 },
  { to: '/leerlingen', label: t.navigatie.leerlingen, icon: Users },
  {
    to: '/beheer',
    label: t.navigatie.beheer,
    icon: Settings,
    rollen: ['schoolbeheerder', 'superbeheerder'],
  },
  {
    to: '/platform',
    label: t.navigatie.platform,
    icon: ShieldCheck,
    rollen: ['superbeheerder'],
  },
];

export function AppShell() {
  const { gebruiker, uitloggen } = useAuth();
  const { doelen, laden: doelenLaden } = useDoelen();
  const navigate = useNavigate();

  const zichtbareNavigatie = hoofdNavigatie.filter(
    (item) => !item.rollen || (gebruiker && item.rollen.includes(gebruiker.rol))
  );

  async function handleUitloggen() {
    await uitloggen();
    navigate('/aanmelden', { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Logo />
          <div>
            <div className="font-bold text-slate-900 leading-tight">{t.app.naam}</div>
            <div className="text-xs text-kompas-700 font-medium">{t.app.faseBadge}</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-x-auto flex md:block">
          {zichtbareNavigatie.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-kompas-50 text-kompas-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-2 text-xs">
          {gebruiker && (
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="font-semibold text-slate-900 truncate">
                {gebruiker.voornaam} {gebruiker.familienaam}
              </div>
              <div className="text-kompas-700 font-medium">
                {t.rollen[gebruiker.rol]}
              </div>
            </div>
          )}

          <NavLink
            to="/profiel"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-kompas-50 text-kompas-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <UserCircle2 className="h-4 w-4" />
            <span>{t.navigatie.profiel}</span>
          </NavLink>

          <button
            type="button"
            onClick={handleUitloggen}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-700 font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>{t.navigatie.afmelden}</span>
          </button>

          <div className="px-3 pt-1 text-slate-400">
            {doelenLaden
              ? 'Doelen laden in IndexedDB…'
              : t.status.doelenGeladen(doelen.length)}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
