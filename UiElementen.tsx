import type { ReactNode } from 'react';
import { Pencil, Plus, type LucideIcon } from 'lucide-react';

interface FabToevoegKnopProps {
  label: string;
  onClick: () => void;
}

/**
 * Gele ronde "+"-knop (FAB) rechtsonder op het scherm.
 */
export function FabToevoegKnop({ label, onClick }: FabToevoegKnopProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        backgroundColor: 'var(--kleur-accent)',
        color: 'var(--kleur-accent-tekst)',
      }}
      className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full shadow-lg hover:brightness-95 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-amber-300"
    >
      <Plus className="h-7 w-7 stroke-[2.5]" />
    </button>
  );
}

interface BewerkCirkelKnopProps {
  label: string;
  onClick: () => void;
}

/**
 * Potlood-icoon in een grijze cirkel voor bewerken.
 */
export function BewerkCirkelKnop({ label, onClick }: BewerkCirkelKnopProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center justify-center shrink-0"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

interface GroeneBadgeProps {
  children: ReactNode;
}

export function GroeneBadge({ children }: GroeneBadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
      {children}
    </span>
  );
}

interface LegeToestandProps {
  icon: LucideIcon;
  titel: string;
  beschrijving: string;
  actie?: ReactNode;
}

export function LegeToestand({
  icon: Icon,
  titel,
  beschrijving,
  actie,
}: LegeToestandProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
      <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{titel}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1">{beschrijving}</p>
      {actie && <div className="mt-4">{actie}</div>}
    </div>
  );
}
