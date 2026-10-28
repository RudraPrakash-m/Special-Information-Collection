/**
 * Essential validations for Verifying Submissions.
 */

export interface VerificationActionInput {
  action: 'Approve' | 'Return' | 'Reject';
  remarks?: string;
}

export const validateVerificationAction = (
  input: VerificationActionInput
): { isValid: boolean; error?: string } => {
  if (input.action === 'Return' && (!input.remarks || !input.remarks.trim())) {
    return {
      isValid: false,
      error: 'Remarks detailing reasons for correction are mandatory when returning a submission.',
    };
  }

  if (input.action === 'Reject' && (!input.remarks || !input.remarks.trim())) {
    return {
      isValid: false,
      error: 'Rejection reason remarks are mandatory.',
    };
  }

  return { isValid: true };
};

