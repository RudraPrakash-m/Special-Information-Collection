import React from 'react';
import type { SurveyQuestion, RelationalOperator, CrossQuestionConfig } from '../types/validationRules.types';
import FieldInfoTooltip from './FieldInfoTooltip';

interface CrossQuestionRuleBuilderProps {
  currentQuestion: SurveyQuestion;
  allQuestions: SurveyQuestion[];
  config: Partial<CrossQuestionConfig>;
  onChange: (config: Partial<CrossQuestionConfig>) => void;
  error?: string;
}

const OPERATORS: { value: RelationalOperator; label: string; desc: string }[] = [
  { value: '<=', label: '≤  (Less than or Equal to)', desc: 'Current must not exceed target' },
  { value: '<', label: '<  (Strictly Less than)', desc: 'Current must be smaller than target' },
  { value: '>=', label: '≥  (Greater than or Equal to)', desc: 'Current must at least equal target' },
  { value: '>', label: '>  (Strictly Greater than)', desc: 'Current must be greater than target' },
  { value: '=', label: '=  (Must Exactly Equal)', desc: 'Current must match target exactly' },
  { value: '!=', label: '≠  (Must Not Equal)', desc: 'Current must differ from target' },
];

export const CrossQuestionRuleBuilder: React.FC<CrossQuestionRuleBuilderProps> = ({
  currentQuestion,
  allQuestions,
  config,
  onChange,
  error,
}) => {
  // Compatible questions from the same survey (excluding self)
  const compatibleQuestions = allQuestions.filter((q) => {
    if (q.id === currentQuestion.id) return false;
    // Numbers/decimals compare with numbers/decimals
    if (['number', 'decimal'].includes(currentQuestion.questionType)) {
      return ['number', 'decimal'].includes(q.questionType);
    }
    // Dates compare with dates
    if (currentQuestion.questionType === 'date') {
      return q.questionType === 'date';
    }
    // Texts/choices compare with texts/choices
    return ['short_text', 'single_choice'].includes(q.questionType);
  });

  const handleTargetChange = (targetId: string) => {
    const targetQ = allQuestions.find((q) => q.id === targetId);
    if (!targetQ) return;
    onChange({
      ...config,
      targetQuestionId: targetQ.id,
      targetQuestionCode: targetQ.questionCode,
      targetQuestionText: targetQ.questionText,
    });
  };

  const handleOperatorChange = (op: RelationalOperator) => {
    onChange({
      ...config,
      operator: op,
    });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-amber-200/80 bg-amber-50/30 dark:bg-amber-950/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-start">
        {/* Current Question Read-only Display (4 columns) */}
        <div className="md:col-span-4">
          <label className="ui-label select-none">
            Current Question (Left-hand side)
          </label>
          <input
            type="text"
            readOnly
            value={`${currentQuestion.questionCode}: ${currentQuestion.questionText}`}
            className="ui-field bg-muted/40 font-medium cursor-not-allowed select-none truncate text-xs"
            title={`${currentQuestion.questionCode}: ${currentQuestion.questionText}`}
          />
        </div>

        {/* Comparison Operator (3 columns) */}
        <div className="md:col-span-3">
          <FieldInfoTooltip
            label="Relational Operator"
            required={true}
            tooltipText="Relational operator defining the valid mathematical condition between the two questions."
            exampleText="≤ (Less than or Equal)"
          />
          <select
            value={config.operator || '<='}
            onChange={(e) => handleOperatorChange(e.target.value as RelationalOperator)}
            className="ui-field text-xs"
          >
            {OPERATORS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target Question Dropdown (5 columns) */}
        <div className="md:col-span-5">
          <FieldInfoTooltip
            label="Target Question to Compare With"
            required={true}
            tooltipText="Select a compatible question from the survey to enforce the relational rule."
            exampleText="Q2: Total Student Enrolment"
          />
          <select
            value={config.targetQuestionId || ''}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="ui-field text-xs truncate"
          >
            <option value="">- Select Compatible Question -</option>
            {compatibleQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.questionCode}: {q.questionText} ({q.questionType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  );
};

export default CrossQuestionRuleBuilder;

