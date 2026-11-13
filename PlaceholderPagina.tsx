import { useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { LegeToestand } from '@/components/UiElementen';
import { useActieveSchool, useKlassen } from '@/hooks';
import { t } from '@/i18n';

interface PlaceholderPaginaProps {
  titel: string;
  beschrijving: string;
  icon: LucideIcon;
  toonKlasContext?: boolean;
}

export function PlaceholderPagina({
  titel,
  beschrijving,
  icon,
  toonKlasContext = false,
}: PlaceholderPaginaProps) {
  const { actieveKlasId } = useActieveSchool();
  const { klassen } = useKlassen();
  const [searchParams] = useSearchParams();

  const gekozenKlas = klassen.find((k) => k.id === actieveKlasId);
  const leerlingId = searchParams.get('leerlingId');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{titel}</h2>
          <p className="text-sm text-slate-500">{beschrijving}</p>
        </div>
        {toonKlasContext && gekozenKlas && (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            Actieve klas: {gekozenKlas.naam}
          </span>
        )}
      </div>

      {leerlingId && (
        <div className="px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          Gefilterd op leerling-ID: <code className="font-mono">{leerlingId}</code>
        </div>
      )}

      <LegeToestand
        icon={icon}
        titel={`${titel} — klaar voor de volgende fase`}
        beschrijving={t.status.placeholderMelding}
      />
    </div>
  );
}
