import { Pencil, Trash2 } from 'lucide-react';
import { ActionIcon } from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { ValidationRule, SurveyQuestion } from '../types/validationRules.types';

export interface ValidationRulesColumnCallbacks {
  surveyQuestions: SurveyQuestion[];
  onEdit: (rule: ValidationRule) => void;
  onDelete: (id: string) => void;
}

export const getValidationRulesColumns = ({
  surveyQuestions,
  onEdit,
  onDelete,
}: ValidationRulesColumnCallbacks): Column<ValidationRule>[] => [
  {
    id: 'slNo',
    header: 'Sl. No',
    accessor: (r) => r.id,
    width: 'w-16',
    cell: (_r, index) => (
      <span className="tabular-nums text-xs text-muted-foreground block text-center">
        {index !== undefined ? index + 1 : 1}
      </span>
    ),
  },
  {
    id: 'question',
    header: 'Target Question',
    accessor: (r) => r.questionCode,
    cell: (r) => {
      const q = surveyQuestions.find((item) => item.id === r.questionId);
      return (
        <div className="py-0.5">
          <span className="font-mono text-xs font-semibold text-foreground">{r.questionCode}</span>
          <p className="text-xs text-muted-foreground line-clamp-1">{q?.questionText || 'Survey Question'}</p>
        </div>
      );
    },
  },
  {
    id: 'ruleCategory',
    header: 'Rule Type',
    accessor: (r) => r.ruleCategory,
    width: 'w-36',
    cell: (r) => {
      const labels: Record<string, string> = {
        format: 'Format Validation',
        range: 'Numeric Range',
        cross_question: 'Cross Question',
        hims_match: 'HIMS Master Match',
        uniqueness: 'Uniqueness',
      };
      return <span className="text-xs font-medium text-foreground">{labels[r.ruleCategory] || r.ruleCategory}</span>;
    },
  },
  {
    id: 'condition',
    header: 'Condition / Reference',
    cell: (r) => {
      if (r.ruleCategory === 'format') {
        return <span className="text-xs font-mono text-foreground">{r.dataFormat}</span>;
      }
      if (r.ruleCategory === 'range') {
        return (
          <span className="text-xs text-foreground font-mono">
            {r.minValue !== undefined ? `Min: ${r.minValue}` : ''}
            {r.minValue !== undefined && r.maxValue !== undefined ? ' &bull; ' : ''}
            {r.maxValue !== undefined ? `Max: ${r.maxValue}` : ''}
          </span>
        );
      }
      if (r.ruleCategory === 'cross_question' && r.crossQuestion) {
        return (
          <span className="text-xs text-foreground font-mono">
            {r.questionCode} {r.crossQuestion.operator} {r.crossQuestion.targetQuestionCode}
          </span>
        );
      }
      if (r.ruleCategory === 'hims_match' && r.himsCheck) {
        return (
          <span className="text-xs text-foreground">
            {r.himsCheck.himsFieldName}
            {r.himsCheck.tolerancePercent !== undefined ? ` (±${r.himsCheck.tolerancePercent}%)` : ''}
          </span>
        );
      }
      return <span className="text-xs text-foreground">Unique across institutions</span>;
    },
  },
  {
    id: 'onFailure',
    header: 'Action on Failure',
    accessor: (r) => r.onFailure,
    width: 'w-36',
    cell: (r) => (
      <span className="text-xs font-medium capitalize text-foreground">
        {r.onFailure === 'return_for_correction' ? 'Return for Correction' : 'Flag for Verifier'}
      </span>
    ),
  },
  {
    id: 'errorMessage',
    header: 'Failure Message',
    accessor: (r) => r.errorMessage,
    cell: (r) => (
      <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm" title={r.errorMessage}>
        {r.errorMessage}
      </p>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    width: 'w-24',
    align: 'center',
    cell: (r) => (
      <div className="flex items-center justify-center gap-1">
        <ActionIcon
          tone="warning"
          icon={Pencil}
          label="Edit Rule"
          onClick={() => onEdit(r)}
        />
        <ActionIcon
          tone="danger"
          icon={Trash2}
          label="Delete Rule"
          onClick={() => onDelete(r.id)}
        />
      </div>
    ),
  },
];
