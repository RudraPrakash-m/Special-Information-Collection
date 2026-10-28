import React from 'react';
import { RotateCcw, Flag } from 'lucide-react';
import type { FailureAction } from '../types/validationRules.types';

interface RuleFailureBadgeProps {
  action: FailureAction;
  size?: 'sm' | 'md';
}

export const RuleFailureBadge: React.FC<RuleFailureBadgeProps> = ({ action }) => {
  if (action === 'return_for_correction') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
        <RotateCcw size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
        Return for Correction
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 whitespace-nowrap">
      <Flag size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
      Flag for Verifier
    </span>
  );
};

export default RuleFailureBadge;
