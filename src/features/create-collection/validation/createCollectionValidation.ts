/**
 * Mandatory-field validations of SRS 1.1 Create Information Collection, run by Save as Draft and Save & Next.
 * Other SRS checks (lengths, ranges, file type/size, uniqueness, recurrence period) are added during development.
 */

import type { ApprovalLevel, DraftSurvey } from '../types/createCollection.types';

export interface CollectionFormValues {
  collectionTitle?: string;
  collectionType?: string;
  scheme?: string;
  activityName?: string;
  frequency?: string;
  cycleDurationDays?: number | string;
  approvalRequired?: string;
  allowReturnForCorrection?: boolean;
  correctionPeriodDays?: number | string;
}

export interface CollectionValidationContext {
  survey: DraftSurvey | null;
  approvalLevels: ApprovalLevel[];
}

const isEmpty = (value: unknown) => value === undefined || value === null || value === '';

export const validateCollectionForm = (
  values: CollectionFormValues,
  ctx: CollectionValidationContext
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!ctx.survey) errors.surveyId = 'Please select a Data Capture Survey.';
  if (!values.collectionTitle?.trim()) errors.collectionTitle = 'Collection Title is mandatory.';
  if (!values.collectionType) errors.collectionType = 'Please select a Collection Type.';
  if (values.collectionType === 'scheme' && !values.scheme) {
    errors.scheme = 'Scheme is mandatory for a Scheme-specific collection.';
  }
  if (values.collectionType === 'activity' && !values.activityName?.trim()) {
    errors.activityName = 'Activity Name is mandatory for an Activity-specific collection.';
  }
  if (!values.frequency) errors.frequency = 'Frequency is mandatory.';
  if (values.frequency && values.frequency !== 'one-time' && isEmpty(values.cycleDurationDays)) {
    errors.cycleDurationDays = 'Cycle Duration is mandatory for a recurring collection.';
  }
  if (!values.approvalRequired) errors.approvalRequired = 'Please choose whether Approval is Required.';
  if (
    values.approvalRequired === 'yes' &&
    (ctx.approvalLevels.length === 0 || ctx.approvalLevels.some((l) => l.assignedUserIds.length === 0))
  ) {
    errors.approvalLevels = 'Define the approval levels and select at least one user for each level.';
  }
  if (values.allowReturnForCorrection && isEmpty(values.correctionPeriodDays)) {
    errors.correctionPeriodDays = 'Correction Period is mandatory when Allow Return for Correction is checked.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
