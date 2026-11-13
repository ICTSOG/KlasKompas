import { NavLink, Outlet } from 'react-router-dom';
import {
  Calendar,
  LayoutGrid,
  Eye,
  Target,
  BarChart3,
  Users,
  Settings,
  Compass,
  Tablet,
  LogIn,
} from 'lucide-react';
import { Logo } from './Logo';
import { t } from '@/i18n';
import { useDoelen } from '@/hooks';

const hoofdNavigatie = [
  { to: '/', label: t.navigatie.overzicht, icon: Compass, end: true },
  { to: '/agenda', label: t.navigatie.agenda, icon: Calendar },
  { to: '/keuzebord', label: t.navigatie.keuzebord, icon: LayoutGrid },
  { to: '/observaties', label: t.navigatie.observaties, icon: Eye },
  { to: '/doelen', label: t.navigatie.doelen, icon: Target },
  { to: '/inzichten', label: t.navigatie.inzichten, icon: BarChart3 },
  { to: '/leerlingen', label: t.navigatie.leerlingen, icon: Users },
  { to: '/beheer', label: t.navigatie.beheer, icon: Settings },
];

export function AppShell() {
  const { doelen, laden: doelenLaden } = useDoelen();

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
          {hoofdNavigatie.map((item) => {
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

        <div className="p-3 border-t border-slate-100 space-y-1 text-xs">
          <NavLink
            to="/aanmelden"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <LogIn className="h-4 w-4" />
            <span>{t.navigatie.aanmelden}</span>
          </NavLink>
          <NavLink
            to="/toestel"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Tablet className="h-4 w-4" />
            <span>{t.navigatie.toestelKoppelen}</span>
          </NavLink>
          <div className="px-3 pt-2 text-slate-400">
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
