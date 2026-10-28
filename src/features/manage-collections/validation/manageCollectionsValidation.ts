/**
 * Essential runtime validations for Manage Collections operations.
 */

export interface ExtendDeadlineInput {
  newDate: string;
  reason: string;
}

export interface CloseCollectionInput {
  reason: string;
}

export const validateExtendDeadline = (
  input: ExtendDeadlineInput
): { isValid: boolean; errors: Partial<Record<keyof ExtendDeadlineInput, string>> } => {
  const errors: Partial<Record<keyof ExtendDeadlineInput, string>> = {};

  if (!input.newDate || !input.newDate.trim()) {
    errors.newDate = 'New end date is mandatory.';
  }

  if (!input.reason || !input.reason.trim()) {
    errors.reason = 'Reason for extending deadline is mandatory.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCloseCollection = (
  input: CloseCollectionInput
): { isValid: boolean; error?: string } => {
  if (!input.reason || !input.reason.trim()) {
    return {
      isValid: false,
      error: 'Reason for closing the collection is mandatory.',
    };
  }

  return { isValid: true };
};

