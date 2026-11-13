import { t } from '@/i18n';

interface LegePaginaProps {
  titel: string;
  routePad: string;
  collecties: string[];
}

function LegePagina({ titel, routePad, collecties }: LegePaginaProps) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">{titel}</h1>
        <code className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
          #{routePad}
        </code>
      </div>
      <p className="text-sm text-slate-600">{t.status.skeletMelding}</p>
      <div className="pt-2 border-t border-slate-100">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Gekoppelde databronnen
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {collecties.map((col) => (
            <span
              key={col}
              className="text-xs bg-kompas-50 text-kompas-800 border border-kompas-100 px-2.5 py-1 rounded-md font-mono"
            >
              {col}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export const OverzichtPagina = () => (
  <LegePagina
    titel="Overzicht"
    routePad="/"
    collecties={['gebruikers/{uid}', 'scholen/{schoolId}/klassen', 'platform/instellingen']}
  />
);

export const AgendaPagina = () => (
  <LegePagina
    titel="Weekplanning & Agenda"
    routePad="/agenda"
    collecties={['scholen/{schoolId}/agenda', 'scholen/{schoolId}/weekthemas', 'scholen/{schoolId}/lesplannen']}
  />
);

export const KeuzebordPagina = () => (
  <LegePagina
    titel="Digitaal Keuzebord"
    routePad="/keuzebord"
    collecties={[
      'scholen/{schoolId}/borden/{agendaId}',
      'scholen/{schoolId}/keuzeactiviteiten',
      'scholen/{schoolId}/leerlingBord',
      'scholen/{schoolId}/sessies',
    ]}
  />
);

export const ObservatiesPagina = () => (
  <LegePagina
    titel="Observaties"
    routePad="/observaties"
    collecties={['scholen/{schoolId}/observaties', 'scholen/{schoolId}/media']}
  />
);

export const DoelenPagina = () => (
  <LegePagina
    titel="Leerlijn- en Minimumdoelen"
    routePad="/doelen"
    collecties={[
      'IndexedDB (/public/data/doelen.json)',
      'scholen/{schoolId}/doelencollecties',
      'scholen/{schoolId}/eigenDoelen',
      'scholen/{schoolId}/evaluaties',
    ]}
  />
);

export const InzichtenPagina = () => (
  <LegePagina
    titel="Inzichten & Opvolging"
    routePad="/inzichten"
    collecties={['scholen/{schoolId}/sessies', 'scholen/{schoolId}/evaluaties', 'scholen/{schoolId}/observaties']}
  />
);

export const LeerlingenPagina = () => (
  <LegePagina
    titel="Leerlingen & Klasbeheer"
    routePad="/leerlingen"
    collecties={['scholen/{schoolId}/leerlingen', 'scholen/{schoolId}/leerlingBord']}
  />
);

export const BeheerPagina = () => (
  <LegePagina
    titel="School- & Platformbeheer"
    routePad="/beheer"
    collecties={['scholen/{schoolId}', 'gebruikers', 'koppelcodes', 'toestellen', 'audit']}
  />
);

export const AanmeldenPagina = () => (
  <LegePagina
    titel="Aanmelden als leerkracht of beheerder"
    routePad="/aanmelden"
    collecties={['Firebase Auth (e-mail/wachtwoord)', 'gebruikers/{uid}']}
  />
);

export const ToestelPagina = () => (
  <LegePagina
    titel="Klastoestel koppelen met code"
    routePad="/toestel"
    collecties={['koppelcodes/{code}', 'toestellen/{uid}']}
  />
);
