import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks';
import { t } from '@/i18n';
import type { GebruikersRol } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  toegestaneRollen?: GebruikersRol[];
}

export function ProtectedRoute({ children, toegestaneRollen }: ProtectedRouteProps) {
  const { isIngelogd, gebruiker, laden } = useAuth();
  const location = useLocation();

  if (laden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <div className="h-8 w-8 rounded-full border-2 border-kompas-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Sessie en rechten controleren…</p>
        </div>
      </div>
    );
  }

  if (!isIngelogd || !gebruiker || gebruiker.status !== 'actief') {
    return <Navigate to="/aanmelden" state={{ van: location.pathname }} replace />;
  }

  if (toegestaneRollen && !toegestaneRollen.includes(gebruiker.rol)) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm max-w-lg space-y-3">
        <div className="flex items-center gap-2.5 text-rose-700 font-semibold">
          <ShieldAlert className="h-5 w-5" />
          <span>Geen toegang tot dit onderdeel</span>
        </div>
        <p className="text-sm text-slate-600">
          Je bent aangemeld als{' '}
          <strong className="text-slate-800">{t.rollen[gebruiker.rol]}</strong>. Deze
          pagina is enkel beschikbaar voor beheerders.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
