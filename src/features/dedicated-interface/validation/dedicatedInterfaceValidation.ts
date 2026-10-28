/**
 * Essential validations for Dedicated Interface configuration.
 */

export interface DedicatedInterfaceFormValues {
  collectionId?: string;
  linkName?: string;
  pageHeading?: string;
}

export const validateDedicatedInterface = (
  values: DedicatedInterfaceFormValues
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!values.collectionId || !values.collectionId.trim()) {
    errors.collectionId = 'Please select a Collection.';
  }

  if (!values.linkName || !values.linkName.trim()) {
    errors.linkName = 'Link Name is mandatory.';
  }

  if (!values.pageHeading || !values.pageHeading.trim()) {
    errors.pageHeading = 'Page Heading is mandatory.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

