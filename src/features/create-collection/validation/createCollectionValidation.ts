/**
 * Essential validations for Create Information Collection.
 * Non-essential / complex checks are removed for smooth wireframing/dev prototyping.
 */

import type { ApprovalLevel } from '../types/createCollection.types';

export interface CollectionFormValues {
  collectionTitle?: string;
  surveyId?: string;
  collectionType?: string;
  approvalRequired?: string;
  approvalLevels?: ApprovalLevel[];
}

export const validateCollectionForm = (
  values: CollectionFormValues
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!values.collectionTitle || !values.collectionTitle.trim()) {
    errors.collectionTitle = 'Collection Title is mandatory.';
  }

  if (!values.surveyId || !values.surveyId.trim()) {
    errors.surveyId = 'Please select a Data Capture Survey.';
  }

  if (!values.collectionType || !values.collectionType.trim()) {
    errors.collectionType = 'Please select a Collection Type.';
  }

  if (values.approvalRequired === 'yes') {
    if (!values.approvalLevels || values.approvalLevels.length === 0) {
      errors.approvalLevels = 'At least one approval level is required when approval workflow is enabled.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

