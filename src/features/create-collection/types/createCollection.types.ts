export type CollectionType = 'institution' | 'scheme' | 'activity';
export type Frequency = 'one-time' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
export type CollectionStatus = 'Draft' | 'Published' | 'Active' | 'Closed';

export interface DraftSurvey {
  id: string;
  title: string;
  himsModule: string;
  responderRole: string;
  publicationMethod: string[];
  allowResubmission: boolean;
  questionCount: number;
  targetInstitutions: string;
  startDate: string;
  endDate: string;
  reminderSettings: string;
  isLinkedToCollection?: boolean;
}

export interface SchemeMasterItem {
  id: string;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
}

export interface HedAdminUser {
  id: string;
  name: string;
  email: string;
  designation: string;
}

export interface ApprovalLevel {
  levelNumber: number;
  levelName: string;
  assignedUserIds: string[];
}

export interface CollectionCycle {
  cycleNumber: number;
  cycleName: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Closed' | 'Upcoming';
  completionRate: number; // percentage
  assignedCount: number;
  receivedCount: number;
  approvedCount: number;
}

export interface CollectionVersionItem {
  version: number;
  date: string;
  user: string;
  changes: string;
  reason: string;
}

export interface InformationCollectionRecord {
  id: string;
  collectionTitle: string;
  surveyId: string;
  surveyTitle: string;
  collectionType: CollectionType;
  schemeId?: string;
  schemeName?: string;
  activityName?: string;
  orderReference?: string;
  referenceDocName?: string;
  frequency: Frequency;
  cycleDurationDays?: number;
  recurrenceEndDate?: string;
  approvalRequired: boolean;
  approvalLevels: ApprovalLevel[];
  allowReturnForCorrection: boolean;
  correctionPeriodDays?: number;
  allowOfflineUpload: boolean;
  status: CollectionStatus;
  version?: number;
  currentCycle?: string;
  dueDate?: string;
  assignedCount?: number;
  submittedCount?: number;
  approvedCount?: number;
  dedicatedSlug?: string;
  dedicatedLinkActive?: boolean;
  cycles?: CollectionCycle[];
  versionHistory?: CollectionVersionItem[];
  createdAt: string;
  updatedAt: string;
}

export const MOCK_SURVEYS: DraftSurvey[] = [
  {
    id: 'SURV-2026-001',
    title: 'NAAC Accreditation & Quality Readiness Survey 2026',
    himsModule: 'Special Information Collection',
    responderRole: 'Institution User only',
    publicationMethod: ['Portal', 'Email Notification'],
    allowResubmission: false,
    questionCount: 18,
    targetInstitutions: 'All State Universities & Autonomous Colleges (64 Institutions)',
    startDate: '2026-11-01',
    endDate: '2026-11-25',
    reminderSettings: 'Weekly on Monday and 3 days before End Date',
    isLinkedToCollection: false,
  },
  {
    id: 'SURV-2026-002',
    title: 'Mo College Infrastructure & Campus Amenities Audit',
    himsModule: 'Special Information Collection',
    responderRole: 'Institution User only',
    publicationMethod: ['Portal'],
    allowResubmission: false,
    questionCount: 12,
    targetInstitutions: 'Government Degree Colleges — Western & Northern Zones (128 Colleges)',
    startDate: '2026-11-05',
    endDate: '2026-11-30',
    reminderSettings: 'Every 5 days automatically',
    isLinkedToCollection: false,
  },
  {
    id: 'SURV-2026-003',
    title: 'State Science Talent & Student Lab Facilities Report',
    himsModule: 'Special Information Collection',
    responderRole: 'Institution User only',
    publicationMethod: ['Portal'],
    allowResubmission: false,
    questionCount: 24,
    targetInstitutions: 'All Higher Secondary and Undergraduate Science Colleges (310 Colleges)',
    startDate: '2026-11-10',
    endDate: '2026-12-15',
    reminderSettings: 'Bi-weekly reminders',
    isLinkedToCollection: false,
  },
  {
    id: 'SURV-2026-INVALID',
    title: 'Staff Welfare & Non-Teaching Survey (Condition Test: Has Resubmission Allowed)',
    himsModule: 'General Administration',
    responderRole: 'All Users',
    publicationMethod: ['Direct Email'],
    allowResubmission: true,
    questionCount: 0,
    targetInstitutions: 'General Staff',
    startDate: '2026-10-01',
    endDate: '2026-10-20',
    reminderSettings: 'None',
    isLinkedToCollection: false,
  },
];

export const MOCK_SCHEMES: SchemeMasterItem[] = [
  { id: 'SCH-01', name: 'Mo College Abhijan Scheme', code: 'MCA-2026', status: 'Active' },
  { id: 'SCH-02', name: 'State Higher Education Innovation Fund', code: 'SHEIF-02', status: 'Active' },
  { id: 'SCH-03', name: 'Odisha State Merit Scholarship Programme', code: 'OSMSP-04', status: 'Active' },
  { id: 'SCH-04', name: 'World Bank Higher Education Modernisation Project', code: 'WB-HEMP', status: 'Active' },
  { id: 'SCH-05', name: 'State Research & Laboratory Upgrade Grant', code: 'SRLUG-26', status: 'Active' },
];

export const MOCK_HED_ADMINS: HedAdminUser[] = [
  { id: 'ADM-101', name: 'Dr. Sudhanshu Sekhar Mishra', email: 'ss.mishra@hed.gov.in', designation: 'Additional Secretary (HE)' },
  { id: 'ADM-102', name: 'Smt. Pravasini Nayak', email: 'p.nayak@hed.gov.in', designation: 'Joint Director (Planning & QA)' },
  { id: 'ADM-103', name: 'Sri Bijoy Kumar Patnaik', email: 'bk.patnaik@hed.gov.in', designation: 'Deputy Director (Academics)' },
  { id: 'ADM-104', name: 'Dr. Ananya Mohapatra', email: 'ananya.m@hed.gov.in', designation: 'Assistant Director (IT & MIS)' },
  { id: 'ADM-105', name: 'Sri Rakesh Kumar Sahoo', email: 'rk.sahoo@hed.gov.in', designation: 'Desk Officer (Special Schemes)' },
];

export const INITIAL_COLLECTIONS: InformationCollectionRecord[] = [
  {
    id: 'IC-2026-001',
    collectionTitle: 'Quarterly Degree College Academic & Lab Equipment Census',
    surveyId: 'SURV-2026-003',
    surveyTitle: 'State Science Talent & Student Lab Facilities Report',
    collectionType: 'institution',
    frequency: 'quarterly',
    cycleDurationDays: 20,
    recurrenceEndDate: '2027-03-31',
    approvalRequired: true,
    approvalLevels: [
      { levelNumber: 1, levelName: 'Level 1: Scrutiny', assignedUserIds: ['ADM-104'] },
      { levelNumber: 2, levelName: 'Level 2: Approval', assignedUserIds: ['ADM-102'] },
    ],
    allowReturnForCorrection: true,
    correctionPeriodDays: 7,
    allowOfflineUpload: true,
    status: 'Published',
    version: 1,
    currentCycle: 'Cycle 1 - Nov 2026',
    dueDate: '2026-11-25',
    assignedCount: 64,
    submittedCount: 48,
    approvedCount: 42,
    dedicatedSlug: 'science-census-2026',
    dedicatedLinkActive: true,
    cycles: [
      { cycleNumber: 1, cycleName: 'Cycle 1 - Nov 2026', startDate: '2026-11-01', endDate: '2026-11-25', status: 'Active', completionRate: 65.6, assignedCount: 64, receivedCount: 48, approvedCount: 42 },
      { cycleNumber: 2, cycleName: 'Cycle 2 - Feb 2027', startDate: '2027-02-01', endDate: '2027-02-25', status: 'Upcoming', completionRate: 0, assignedCount: 64, receivedCount: 0, approvedCount: 0 },
    ],
    versionHistory: [
      { version: 1, date: '2026-10-15', user: 'Dr. Sudhanshu Sekhar Mishra', changes: 'Initial publication with 2 approval levels and dedicated landing page.', reason: 'Official rollout for Q3 AY 2026-27.' },
    ],
    createdAt: '2026-10-15',
    updatedAt: '2026-10-16',
  },
  {
    id: 'IC-2026-002',
    collectionTitle: 'Mo College Abhijan Infrastructure Phase-2 Data Collection',
    surveyId: 'SURV-2026-002',
    surveyTitle: 'Mo College Infrastructure & Campus Amenities Audit',
    collectionType: 'scheme',
    schemeId: 'SCH-01',
    schemeName: 'Mo College Abhijan Scheme',
    orderReference: 'HED-O-2026/8941',
    frequency: 'one-time',
    approvalRequired: true,
    approvalLevels: [
      { levelNumber: 1, levelName: 'Level 1: Verification', assignedUserIds: ['ADM-105'] },
      { levelNumber: 2, levelName: 'Level 2: Final Approval', assignedUserIds: ['ADM-101'] },
    ],
    allowReturnForCorrection: true,
    correctionPeriodDays: 10,
    allowOfflineUpload: false,
    status: 'Draft',
    version: 1,
    currentCycle: 'Cycle 1 (One-Time)',
    dueDate: '2026-11-30',
    assignedCount: 128,
    submittedCount: 0,
    approvedCount: 0,
    dedicatedSlug: 'mca-infra-phase2',
    dedicatedLinkActive: false,
    cycles: [
      { cycleNumber: 1, cycleName: 'Cycle 1', startDate: '2026-11-05', endDate: '2026-11-30', status: 'Active', completionRate: 0, assignedCount: 128, receivedCount: 0, approvedCount: 0 },
    ],
    versionHistory: [
      { version: 1, date: '2026-10-24', user: 'Sri Rakesh Kumar Sahoo', changes: 'Draft configuration created from Mo College survey.', reason: 'Pending final review by Joint Director.' },
    ],
    createdAt: '2026-10-24',
    updatedAt: '2026-10-24',
  },
  {
    id: 'IC-2026-003',
    collectionTitle: 'Faculty Sanctioned vs In-Position Strength Census 2026-27',
    surveyId: 'SURV-2026-001',
    surveyTitle: 'NAAC Accreditation & Quality Readiness Survey 2026',
    collectionType: 'institution',
    frequency: 'half-yearly',
    cycleDurationDays: 15,
    recurrenceEndDate: '2027-05-31',
    approvalRequired: true,
    approvalLevels: [
      { levelNumber: 1, levelName: 'Level 1: Scrutiny', assignedUserIds: ['ADM-103'] },
      { levelNumber: 2, levelName: 'Level 2: Approval', assignedUserIds: ['ADM-101'] },
    ],
    allowReturnForCorrection: true,
    correctionPeriodDays: 7,
    allowOfflineUpload: false,
    status: 'Published',
    version: 1,
    currentCycle: 'Cycle 1 - Nov 2026',
    dueDate: '2026-11-20',
    assignedCount: 64,
    submittedCount: 52,
    approvedCount: 46,
    dedicatedSlug: 'faculty-census-2026',
    dedicatedLinkActive: true,
    cycles: [
      { cycleNumber: 1, cycleName: 'Cycle 1 - Nov 2026', startDate: '2026-11-01', endDate: '2026-11-20', status: 'Active', completionRate: 71.8, assignedCount: 64, receivedCount: 52, approvedCount: 46 },
    ],
    versionHistory: [
      { version: 1, date: '2026-10-18', user: 'Sri Bijoy Kumar Patnaik', changes: 'Published for 64 state institutions with AISHE matching.', reason: 'Annual Higher Education Department requirement.' },
    ],
    createdAt: '2026-10-18',
    updatedAt: '2026-10-20',
  },
  {
    id: 'IC-2026-004',
    collectionTitle: 'State Research & Laboratory Upgrade Grant Utilisation Audit',
    surveyId: 'SURV-2026-003',
    surveyTitle: 'State Science Talent & Student Lab Facilities Report',
    collectionType: 'scheme',
    schemeId: 'SCH-05',
    schemeName: 'State Research & Laboratory Upgrade Grant (SRLUG-26)',
    orderReference: 'HED-SRLUG-2026/0412',
    frequency: 'yearly',
    cycleDurationDays: 30,
    recurrenceEndDate: '2027-12-31',
    approvalRequired: true,
    approvalLevels: [
      { levelNumber: 1, levelName: 'Level 1: Technical Review', assignedUserIds: ['ADM-104'] },
      { levelNumber: 2, levelName: 'Level 2: Scrutiny', assignedUserIds: ['ADM-102'] },
      { levelNumber: 3, levelName: 'Level 3: Final Approval', assignedUserIds: ['ADM-101'] },
    ],
    allowReturnForCorrection: true,
    correctionPeriodDays: 14,
    allowOfflineUpload: true,
    status: 'Published',
    version: 2,
    currentCycle: 'Cycle 2 - AY 2026-27',
    dueDate: '2026-12-15',
    assignedCount: 45,
    submittedCount: 39,
    approvedCount: 35,
    dedicatedSlug: 'srlug-audit-2026',
    dedicatedLinkActive: true,
    cycles: [
      { cycleNumber: 1, cycleName: 'Cycle 1 - AY 2025-26', startDate: '2025-11-01', endDate: '2025-12-15', status: 'Closed', completionRate: 100, assignedCount: 45, receivedCount: 45, approvedCount: 45 },
      { cycleNumber: 2, cycleName: 'Cycle 2 - AY 2026-27', startDate: '2026-11-10', endDate: '2026-12-15', status: 'Active', completionRate: 77.7, assignedCount: 45, receivedCount: 39, approvedCount: 35 },
    ],
    versionHistory: [
      { version: 1, date: '2025-10-10', user: 'Dr. Ananya Mohapatra', changes: 'Initial baseline survey for SRLUG grant recipients.', reason: 'Grant release milestone.' },
      { version: 2, date: '2026-10-12', user: 'Dr. Sudhanshu Sekhar Mishra', changes: 'Updated laboratory equipment item checklist in question set.', reason: 'Added biosafety and instrumentation compliance.' },
    ],
    createdAt: '2026-10-10',
    updatedAt: '2026-10-22',
  },
  {
    id: 'IC-2026-005',
    collectionTitle: 'Annual Student Science Conclave & Laboratory Audit',
    surveyId: 'SURV-2026-001',
    surveyTitle: 'NAAC Accreditation & Quality Readiness Survey 2026',
    collectionType: 'activity',
    activityName: 'Annual Student Science Conclave & Laboratory Audit',
    orderReference: 'HED-ACT-2026/9110',
    frequency: 'one-time',
    approvalRequired: true,
    approvalLevels: [
      { levelNumber: 1, levelName: 'Level 1: Verification', assignedUserIds: ['ADM-105'] },
    ],
    allowReturnForCorrection: true,
    correctionPeriodDays: 7,
    allowOfflineUpload: false,
    status: 'Draft',
    version: 1,
    currentCycle: 'Cycle 1 (One-Time)',
    dueDate: '2026-11-28',
    assignedCount: 90,
    submittedCount: 0,
    approvedCount: 0,
    dedicatedSlug: 'science-conclave-2026',
    dedicatedLinkActive: false,
    cycles: [
      { cycleNumber: 1, cycleName: 'Cycle 1', startDate: '2026-11-01', endDate: '2026-11-28', status: 'Active', completionRate: 0, assignedCount: 90, receivedCount: 0, approvedCount: 0 },
    ],
    versionHistory: [
      { version: 1, date: '2026-10-26', user: 'Sri Rakesh Kumar Sahoo', changes: 'Draft activity collection registered.', reason: 'Waiting for sanction order attachment.' },
    ],
    createdAt: '2026-10-26',
    updatedAt: '2026-10-26',
  },
  {
    id: 'IC-2026-006',
    collectionTitle: 'Autonomous Colleges NAAC Readiness & Infrastructure Baseline 2025',
    surveyId: 'SURV-2026-002',
    surveyTitle: 'Mo College Infrastructure & Campus Amenities Audit',
    collectionType: 'institution',
    frequency: 'one-time',
    approvalRequired: false,
    approvalLevels: [],
    allowReturnForCorrection: false,
    allowOfflineUpload: true,
    status: 'Closed',
    version: 1,
    currentCycle: 'Cycle 1 (Completed)',
    dueDate: '2026-03-31',
    assignedCount: 32,
    submittedCount: 32,
    approvedCount: 32,
    dedicatedSlug: 'naac-readiness-2025',
    dedicatedLinkActive: false,
    cycles: [
      { cycleNumber: 1, cycleName: 'Cycle 1 (One-Time)', startDate: '2025-11-01', endDate: '2026-03-31', status: 'Closed', completionRate: 100, assignedCount: 32, receivedCount: 32, approvedCount: 32 },
    ],
    versionHistory: [
      { version: 1, date: '2025-11-01', user: 'Smt. Pravasini Nayak', changes: 'Closed and finalized baseline audit for NAAC 2025.', reason: 'All 32 institutions completed submissions.' },
    ],
    createdAt: '2025-11-01',
    updatedAt: '2026-03-31',
  },
];

