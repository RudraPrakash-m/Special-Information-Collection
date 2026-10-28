export interface PendingVerificationItem {
  id: string;
  institutionCode: string;
  institutionName: string;
  district: string;
  currentStage: string;
  assignedVerifier: string;
  daysPending: number;
  isOverdue: boolean;
}

export interface DefaulterItem {
  id: string;
  institutionCode: string;
  institutionName: string;
  district: string;
  institutionType: string;
  dueDate: string;
  daysOverdue: number;
  missedCycles: number;
  lastReminderSent?: string;
}

