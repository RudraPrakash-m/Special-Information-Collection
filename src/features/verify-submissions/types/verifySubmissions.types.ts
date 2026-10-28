export interface VerificationAnswer {
  questionId: string;
  questionCode: string;
  questionText: string;
  answerValue: string | number;
  isFlagged: boolean;
  flagRule?: string;
  himsMasterValue?: string;
  answerRemarks?: string;
}

export interface SubmissionVerificationRecord {
  id: string;
  institutionCode: string;
  institutionName: string;
  district: string;
  institutionType: string;
  receivedOn: string;
  source: 'Online' | 'Offline';
  flagsCount: number;
  flagsList: string[];
  currentLevel: string;
  status: 'Pending' | 'Approved' | 'Returned' | 'Rejected';
  overallRemarks?: string;
  answers: VerificationAnswer[];
}

