/**
 * Essential validations for My Collections.
 */

import type { SubmissionAnswer } from '../types/myCollections.types';

export const validateCorrectionSubmission = (
  answers: SubmissionAnswer[],
  correctionAnswers: Record<string, any>
): { isValid: boolean; error?: string } => {
  const hasEmptyHighlighted = answers.some(
    (a) => a.hasError && (correctionAnswers[a.questionId] === '' || correctionAnswers[a.questionId] == null)
  );

  if (hasEmptyHighlighted) {
    return {
      isValid: false,
      error: 'Please provide corrections for all highlighted questions.',
    };
  }

  return { isValid: true };
};

