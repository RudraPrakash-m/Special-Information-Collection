import React from 'react';
import { Pencil, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';
import type { ValidationRule } from '../types/validationRules.types';
import RuleFailureBadge from './RuleFailureBadge';

interface QuestionRuleCardProps {
  rule: ValidationRule;
  onEdit: (rule: ValidationRule) => void;
  onDelete: (ruleId: string) => void;
}

export const QuestionRuleCard: React.FC<QuestionRuleCardProps> = ({ rule, onEdit, onDelete }) => {
  const getRuleDescription = () => {
    switch (rule.ruleCategory) {
      case 'cross_question':
        return (
          <span>
            Relational comparison:{' '}
            <strong className="text-foreground font-semibold">
              {rule.questionCode} {rule.crossQuestion?.operator} {rule.crossQuestion?.targetQuestionCode} ({rule.crossQuestion?.targetQuestionText})
            </strong>
          </span>
        );
      case 'hims_match':
        return (
          <span>
            HIMS Master Verification:{' '}
            <strong className="text-foreground font-semibold">
              Must match {rule.himsCheck?.himsFieldName}
              {rule.himsCheck?.checkType === 'figure_match'
                ? ` (within ${rule.himsCheck?.tolerancePercent}% tolerance)`
                : ' (Master Existence)'}
            </strong>
          </span>
        );
      case 'format':
        return (
          <span>
            Format constraint:{' '}
            <strong className="text-foreground font-semibold uppercase">
              {rule.dataFormat}
            </strong>
          </span>
        );
      case 'range':
        return (
          <span>
            Value range:{' '}
            <strong className="text-foreground font-semibold">
              {rule.minValue ?? '0'} to {rule.maxValue ?? '∞'}
            </strong>
          </span>
        );
      case 'uniqueness':
        return (
          <span>
            Uniqueness:{' '}
            <strong className="text-foreground font-semibold">
              Value must be globally unique across all submitting institutions in this cycle.
            </strong>
          </span>
        );
      default:
        return 'Custom rule definition';
    }
  };

  const getCategoryLabel = () => {
    switch (rule.ruleCategory) {
      case 'cross_question':
        return 'Cross-Question';
      case 'hims_match':
        return 'HIMS Master Match';
      case 'format':
        return 'Data Format';
      case 'range':
        return 'Value Range';
      case 'uniqueness':
        return 'Unique Across Institutions';
      default:
        return 'Validation Rule';
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-amber-300/80 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-border/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            {rule.questionCode}
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground">
            {getCategoryLabel()}
          </span>
          <span className="text-xs text-muted-foreground font-mono">{rule.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <RuleFailureBadge action={rule.onFailure} size="sm" />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(rule)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Edit Rule"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(rule.id)}
              className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Delete Rule"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-3 space-y-2 text-xs">
        <div className="flex items-start gap-2 text-muted-foreground">
          <CheckCircle size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{getRuleDescription()}</p>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 text-foreground">
          <ShieldAlert size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900 dark:text-amber-200">Failure Message: </span>
            <span className="text-muted-foreground">{rule.errorMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionRuleCard;

