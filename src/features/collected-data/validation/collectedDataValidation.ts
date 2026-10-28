/**
 * Essential validations for Collected Data & Reports.
 */

export interface ReopenDatasetInput {
  reason: string;
}

export const validateReopenDataset = (
  input: ReopenDatasetInput
): { isValid: boolean; error?: string } => {
  if (!input.reason || !input.reason.trim()) {
    return {
      isValid: false,
      error: 'Reason for reopening the finalised dataset is mandatory.',
    };
  }

  return { isValid: true };
};

