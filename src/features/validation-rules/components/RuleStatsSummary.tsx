import React from 'react';
import { HelpCircle, ShieldCheck, RotateCcw, Flag } from 'lucide-react';
import type { RuleStats } from '../types/validationRules.types';

interface RuleStatsSummaryProps {
  stats: RuleStats;
}

export const RuleStatsSummary: React.FC<RuleStatsSummaryProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Survey Questions',
      value: stats.totalQuestions,
      note: 'Available in linked survey',
      icon: HelpCircle,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Configured Rules',
      value: stats.totalRules,
      note: 'Active validation checks',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Return for Correction',
      value: stats.returnForCorrectionRules,
      note: 'Auto-rejection on failure',
      icon: RotateCcw,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Flag for Verifier',
      value: stats.flagForVerifierRules,
      note: 'Review queue alerts',
      icon: Flag,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {c.label}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
                {c.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.note}</p>
            </div>
            <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${c.iconColor}`}>
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RuleStatsSummary;

