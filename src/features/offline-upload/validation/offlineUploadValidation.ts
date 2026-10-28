/**
 * Essential validations for Offline Upload.
 */

export interface OfflineUploadInput {
  collectionId?: string;
  excelFile?: File | null;
  scannedLetter?: File | null;
}

export const validateOfflineUpload = (
  input: OfflineUploadInput
): { isValid: boolean; error?: string } => {
  if (!input.collectionId) {
    return { isValid: false, error: 'Please select an Information Collection.' };
  }

  if (!input.excelFile) {
    return { isValid: false, error: 'Please upload the completed offline Excel submission file.' };
  }

  if (!input.scannedLetter) {
    return { isValid: false, error: 'Please upload the scanned copy of the institutional letter (PDF).' };
  }

  return { isValid: true };
};

