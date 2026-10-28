export interface SubmissionAnswer {
  questionId: string;
  questionCode: string;
  questionText: string;
  currentValue: string | number;
  hasError: boolean;
  ruleMessage?: string;
  verifierRemark?: string;
  inputType: 'text' | 'number' | 'select';
  options?: string[];
}

export interface SubmissionHistory {
  version: number;
  date: string;
  user: string;
  status: string;
  remarks: string;
}

export interface MyCollectionItem {
  id: string;
  collectionTitle: string;
  collectionType: 'institution' | 'scheme' | 'activity';
  issuedBy: string;
  cycle: string;
  dueDate: string;
  status:
    | 'Not Received'
    | 'Received'
    | 'Under Verification'
    | 'Returned for Correction'
    | 'Approved'
    | 'Rejected'
    | 'Not Submitted';
  verifierRemarks?: string;
  failedRules?: string[];
  dedicatedSlug: string;
  correctionPeriodRemainingDays?: number;
  allowFullEdit?: boolean;
  answers: SubmissionAnswer[];
  history: SubmissionHistory[];
}

