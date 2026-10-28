/**
 * Essential validations for Configure Validation Rules.
 */

export interface ValidationRuleFormData {
  questionId?: string;
  ruleCategory?: string;
  errorMessage?: string;
}

export const validateRuleForm = (
  data: ValidationRuleFormData
): { isValid: boolean; error?: string } => {
  if (!data.questionId) {
    return { isValid: false, error: 'Please select a survey question to apply the validation rule.' };
  }

  if (!data.errorMessage || !data.errorMessage.trim()) {
    return { isValid: false, error: 'Failure error message is mandatory.' };
  }

  return { isValid: true };
};

