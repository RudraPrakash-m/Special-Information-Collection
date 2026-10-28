// src/features/validation-rules/types/validationRules.types.ts

export type QuestionType =
  | 'short_text'
  | 'number'
  | 'decimal'
  | 'date'
  | 'single_choice'
  | 'multi_choice';

export type DataFormat =
  | 'number'
  | 'decimal'
  | 'mobile'
  | 'email'
  | 'pincode'
  | 'text';

export type RelationalOperator = '=' | '!=' | '<' | '<=' | '>' | '>=';

export type HimsCheckType = 'existence' | 'figure_match';

export type FailureAction = 'return_for_correction' | 'flag_for_verifier';

export type RuleCategory =
  | 'format'
  | 'range'
  | 'cross_question'
  | 'hims_match'
  | 'uniqueness';

export interface SurveyQuestion {
  id: string;
  questionCode: string;
  questionText: string;
  questionType: QuestionType;
  isMandatory: boolean;
  surveyId: string;
  sectionName?: string;
  helpText?: string;
}

export interface CrossQuestionConfig {
  targetQuestionId: string;
  targetQuestionCode: string;
  targetQuestionText: string;
  operator: RelationalOperator;
}

export interface HimsCheckConfig {
  himsFieldId: string;
  himsFieldName: string;
  checkType: HimsCheckType;
  tolerancePercent?: number; // 0 to 100%
}

export interface ValidationRule {
  id: string;
  collectionId: string;
  questionId: string;
  questionCode: string;
  ruleCategory: RuleCategory;
  dataFormat?: DataFormat;
  minValue?: number;
  maxValue?: number;
  crossQuestion?: CrossQuestionConfig;
  himsCheck?: HimsCheckConfig;
  isUniqueAcrossInstitutions?: boolean;
  onFailure: FailureAction;
  errorMessage: string;
  createdAt: string;
}

export interface HimsDataPoint {
  id: string;
  fieldName: string;
  category: 'institutional' | 'academic' | 'faculty' | 'infrastructure';
  type: 'code' | 'number';
  description: string;
}

export interface RuleStats {
  totalQuestions: number;
  totalRules: number;
  returnForCorrectionRules: number;
  flagForVerifierRules: number;
}

// Master list of HIMS data points exposed for rule checking
export const MOCK_HIMS_DATA_POINTS: HimsDataPoint[] = [
  {
    id: 'HIMS-AISHE',
    fieldName: 'AISHE Institutional Code',
    category: 'institutional',
    type: 'code',
    description: 'All India Survey on Higher Education Unique Reference Code',
  },
  {
    id: 'HIMS-COLLEGE-CODE',
    fieldName: 'College Master Code',
    category: 'institutional',
    type: 'code',
    description: 'State Higher Education Department Assigned College Master ID',
  },
  {
    id: 'HIMS-ENROLMENT',
    fieldName: 'Total Active Student Enrolment',
    category: 'academic',
    type: 'number',
    description: 'Total verified students enrolled across all degree streams in current academic session',
  },
  {
    id: 'HIMS-SANCTIONED-POSTS',
    fieldName: 'Sanctioned Faculty Posts',
    category: 'faculty',
    type: 'number',
    description: 'Government sanctioned substantive teaching posts for the college',
  },
  {
    id: 'HIMS-IN-POSITION-POSTS',
    fieldName: 'In-Position Regular Faculty',
    category: 'faculty',
    type: 'number',
    description: 'Currently deployed and verified regular teachers in active service',
  },
  {
    id: 'HIMS-LAB-COUNT',
    fieldName: 'Recognised Science Laboratories',
    category: 'infrastructure',
    type: 'number',
    description: 'Number of departmental science practical laboratories registered in HIMS',
  },
  {
    id: 'HIMS-CAMPUS-AREA',
    fieldName: 'Total Campus Built-up Area (Sq. Ft.)',
    category: 'infrastructure',
    type: 'number',
    description: 'Total approved administrative, academic and laboratory carpet area',
  },
];

// Mock survey questions for each linked survey
export const MOCK_SURVEY_QUESTIONS: Record<string, SurveyQuestion[]> = {
  'SURV-2026-001': [
    {
      id: 'Q-001-01',
      questionCode: 'Q1',
      questionText: 'AISHE Institutional Identification Code',
      questionType: 'short_text',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'General Institutional Profile',
      helpText: 'e.g. C-39821 or U-0921',
    },
    {
      id: 'Q-001-02',
      questionCode: 'Q2',
      questionText: 'Total Enrolled Students (All Undergraduate & Postgraduate Streams)',
      questionType: 'number',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'Student Demographics',
    },
    {
      id: 'Q-001-03',
      questionCode: 'Q3',
      questionText: 'Total Enrolled Female Students',
      questionType: 'number',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'Student Demographics',
    },
    {
      id: 'Q-001-04',
      questionCode: 'Q4',
      questionText: 'Total Sanctioned Full-Time Teaching Faculty Posts',
      questionType: 'number',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'Faculty & Academic Staff',
    },
    {
      id: 'Q-001-05',
      questionCode: 'Q5',
      questionText: 'In-Position Full-Time Regular Faculty',
      questionType: 'number',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'Faculty & Academic Staff',
    },
    {
      id: 'Q-001-06',
      questionCode: 'Q6',
      questionText: 'Principal / IQAC Coordinator Contact Mobile Number',
      questionType: 'short_text',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'Contact Information',
      helpText: '10-digit mobile number',
    },
    {
      id: 'Q-001-07',
      questionCode: 'Q7',
      questionText: 'Official College Email Address for Verification Notices',
      questionType: 'short_text',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'Contact Information',
      helpText: 'e.g. principal@college.ac.in',
    },
    {
      id: 'Q-001-08',
      questionCode: 'Q8',
      questionText: 'NAAC Quality Assessment Period Start Date',
      questionType: 'date',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'Audit Schedule',
    },
    {
      id: 'Q-001-09',
      questionCode: 'Q9',
      questionText: 'NAAC Quality Assessment Period Concluding Date',
      questionType: 'date',
      isMandatory: true,
      surveyId: 'SURV-2026-001',
      sectionName: 'Audit Schedule',
    },
  ],
  'SURV-2026-002': [
    {
      id: 'Q-002-01',
      questionCode: 'Q1',
      questionText: 'College Master Code in HED Database',
      questionType: 'short_text',
      isMandatory: true,
      surveyId: 'SURV-2026-002',
      sectionName: 'Identification',
    },
    {
      id: 'Q-002-02',
      questionCode: 'Q2',
      questionText: 'Mo College Campus Development Grant Sanction Order Number',
      questionType: 'short_text',
      isMandatory: true,
      surveyId: 'SURV-2026-002',
      sectionName: 'Sanction Order',
    },
    {
      id: 'Q-002-03',
      questionCode: 'Q3',
      questionText: 'Approved Civil Works Budget (in INR Lakhs)',
      questionType: 'decimal',
      isMandatory: true,
      surveyId: 'SURV-2026-002',
      sectionName: 'Financial Allocation',
    },
    {
      id: 'Q-002-04',
      questionCode: 'Q4',
      questionText: 'Actual Expenditure Incurred to Date (in INR Lakhs)',
      questionType: 'decimal',
      isMandatory: true,
      surveyId: 'SURV-2026-002',
      sectionName: 'Financial Allocation',
    },
    {
      id: 'Q-002-05',
      questionCode: 'Q5',
      questionText: 'Total Smart Classrooms Constructed & Commissioned',
      questionType: 'number',
      isMandatory: true,
      surveyId: 'SURV-2026-002',
      sectionName: 'Infrastructure Output',
    },
  ],
  'SURV-2026-003': [
    {
      id: 'Q-003-01',
      questionCode: 'Q1',
      questionText: 'Institutional AISHE Code',
      questionType: 'short_text',
      isMandatory: true,
      surveyId: 'SURV-2026-003',
      sectionName: 'Identification',
    },
    {
      id: 'Q-003-02',
      questionCode: 'Q2',
      questionText: 'Total Operational Science Practical Laboratories',
      questionType: 'number',
      isMandatory: true,
      surveyId: 'SURV-2026-003',
      sectionName: 'Laboratory Status',
    },
    {
      id: 'Q-003-03',
      questionCode: 'Q3',
      questionText: 'Laboratories Meeting State Safety & Ventilation Standards',
      questionType: 'number',
      isMandatory: true,
      surveyId: 'SURV-2026-003',
      sectionName: 'Laboratory Status',
    },
    {
      id: 'Q-003-04',
      questionCode: 'Q4',
      questionText: 'Major Scientific Instruments Barcode / Asset Inventory Number',
      questionType: 'short_text',
      isMandatory: true,
      surveyId: 'SURV-2026-003',
      sectionName: 'Equipment Registry',
    },
  ],
};

// Initial configured validation rules per collection
export const INITIAL_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'VR-101',
    collectionId: 'IC-2026-001',
    questionId: 'Q-003-03',
    questionCode: 'Q3',
    ruleCategory: 'cross_question',
    crossQuestion: {
      targetQuestionId: 'Q-003-02',
      targetQuestionCode: 'Q2',
      targetQuestionText: 'Total Operational Science Practical Laboratories',
      operator: '<=',
    },
    onFailure: 'return_for_correction',
    errorMessage: 'Laboratories meeting safety standards (Q3) cannot exceed the total operational laboratories (Q2).',
    createdAt: '2026-10-16',
  },
  {
    id: 'VR-102',
    collectionId: 'IC-2026-001',
    questionId: 'Q-003-01',
    questionCode: 'Q1',
    ruleCategory: 'hims_match',
    himsCheck: {
      himsFieldId: 'HIMS-AISHE',
      himsFieldName: 'AISHE Institutional Code',
      checkType: 'existence',
    },
    onFailure: 'return_for_correction',
    errorMessage: 'Entered AISHE Code does not exist in the official Higher Education Department HIMS master.',
    createdAt: '2026-10-16',
  },
  {
    id: 'VR-103',
    collectionId: 'IC-2026-001',
    questionId: 'Q-003-04',
    questionCode: 'Q4',
    ruleCategory: 'uniqueness',
    isUniqueAcrossInstitutions: true,
    onFailure: 'flag_for_verifier',
    errorMessage: 'Equipment Asset / Barcode number is already registered by another institution in this cycle.',
    createdAt: '2026-10-16',
  },
  {
    id: 'VR-104',
    collectionId: 'IC-2026-002',
    questionId: 'Q-002-04',
    questionCode: 'Q4',
    ruleCategory: 'cross_question',
    crossQuestion: {
      targetQuestionId: 'Q-002-03',
      targetQuestionCode: 'Q3',
      targetQuestionText: 'Approved Civil Works Budget (in INR Lakhs)',
      operator: '<=',
    },
    onFailure: 'return_for_correction',
    errorMessage: 'Actual expenditure (Q4) cannot exceed the approved civil works grant budget (Q3).',
    createdAt: '2026-10-24',
  },
  {
    id: 'VR-105',
    collectionId: 'IC-2026-002',
    questionId: 'Q-002-01',
    questionCode: 'Q1',
    ruleCategory: 'hims_match',
    himsCheck: {
      himsFieldId: 'HIMS-COLLEGE-CODE',
      himsFieldName: 'College Master Code',
      checkType: 'existence',
    },
    onFailure: 'return_for_correction',
    errorMessage: 'College code is not found in the HED state college master database.',
    createdAt: '2026-10-24',
  },
  {
    id: 'VR-106',
    collectionId: 'IC-2026-003',
    questionId: 'Q-001-03',
    questionCode: 'Q3',
    ruleCategory: 'cross_question',
    crossQuestion: {
      targetQuestionId: 'Q-001-02',
      targetQuestionCode: 'Q2',
      targetQuestionText: 'Total Enrolled Students',
      operator: '<=',
    },
    onFailure: 'return_for_correction',
    errorMessage: 'Total enrolled female students (Q3) cannot exceed total student enrolment (Q2).',
    createdAt: '2026-10-20',
  },
  {
    id: 'VR-107',
    collectionId: 'IC-2026-003',
    questionId: 'Q-001-05',
    questionCode: 'Q5',
    ruleCategory: 'cross_question',
    crossQuestion: {
      targetQuestionId: 'Q-001-04',
      targetQuestionCode: 'Q4',
      targetQuestionText: 'Total Sanctioned Full-Time Teaching Faculty Posts',
      operator: '<=',
    },
    onFailure: 'return_for_correction',
    errorMessage: 'In-position regular faculty (Q5) cannot exceed government sanctioned posts (Q4).',
    createdAt: '2026-10-20',
  },
  {
    id: 'VR-108',
    collectionId: 'IC-2026-003',
    questionId: 'Q-001-02',
    questionCode: 'Q2',
    ruleCategory: 'hims_match',
    himsCheck: {
      himsFieldId: 'HIMS-ENROLMENT',
      himsFieldName: 'Total Active Student Enrolment',
      checkType: 'figure_match',
      tolerancePercent: 5,
    },
    onFailure: 'flag_for_verifier',
    errorMessage: 'Total enrolment differs from HIMS portal student figures by more than 5%. Verifier verification required.',
    createdAt: '2026-10-20',
  },
  {
    id: 'VR-109',
    collectionId: 'IC-2026-003',
    questionId: 'Q-001-06',
    questionCode: 'Q6',
    ruleCategory: 'format',
    dataFormat: 'mobile',
    onFailure: 'return_for_correction',
    errorMessage: 'Please enter a valid 10-digit Indian mobile number.',
    createdAt: '2026-10-20',
  },
  {
    id: 'VR-110',
    collectionId: 'IC-2026-003',
    questionId: 'Q-001-07',
    questionCode: 'Q7',
    ruleCategory: 'format',
    dataFormat: 'email',
    onFailure: 'return_for_correction',
    errorMessage: 'Please enter a valid official institutional email address.',
    createdAt: '2026-10-20',
  },
  {
    id: 'VR-111',
    collectionId: 'IC-2026-003',
    questionId: 'Q-001-09',
    questionCode: 'Q9',
    ruleCategory: 'cross_question',
    crossQuestion: {
      targetQuestionId: 'Q-001-08',
      targetQuestionCode: 'Q8',
      targetQuestionText: 'NAAC Quality Assessment Period Start Date',
      operator: '>=',
    },
    onFailure: 'return_for_correction',
    errorMessage: 'Assessment concluding date (Q9) must be later than or equal to assessment start date (Q8).',
    createdAt: '2026-10-20',
  },
];

