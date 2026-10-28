/**
 * Essential validations for Collection Monitoring.
 */

export interface ReminderNotificationInput {
  targetIds: string[];
}

export const validateReminderNotification = (
  input: ReminderNotificationInput
): { isValid: boolean; error?: string } => {
  if (!input.targetIds || input.targetIds.length === 0) {
    return {
      isValid: false,
      error: 'Please select at least one defaulter institution to send a reminder.',
    };
  }

  return { isValid: true };
};

