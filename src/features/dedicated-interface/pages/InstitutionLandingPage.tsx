import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Headphones,
  Edit3,
  Eye,
  ShieldCheck,
  RotateCcw,
  Info,
  Send,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  DataTable,
  DetailList,
  KpiCard,
  KpiGrid,
  Modal,
  Tabs,
  type TabItem,
} from '@/shared/components/ui';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';
import Card from '@/shared/components/layout/Card';
import { INITIAL_INTERFACES, type DedicatedInterfaceConfig } from '../types/dedicatedInterface.types';
import { InstitutionAccessNotice } from '../components/InstitutionAccessNotice';
import { getLandingDownloadsColumns } from '../columns/landingDownloadsColumns';
import { toast } from 'sonner';

type SubmissionStatus = 'Not Started' | 'Submitted' | 'Returned for Correction';

// Admin preview: simulated institution submission status
const STATUS_TABS: TabItem[] = [
  { key: 'Not Started', label: '1. Not Started (Fill Online Active)' },
  { key: 'Submitted', label: '2. Submitted (Fill Online Hidden)' },
  { key: 'Returned for Correction', label: '3. Returned for Correction (Correct Submission Active)' },
];

const STATUS_BADGE: Record<SubmissionStatus, React.ReactNode> = {
  'Not Started': <Badge tone="info" icon={Clock}>Pending Submission</Badge>,
  Submitted: <Badge tone="success" icon={CheckCircle2}>Submitted (Under Scrutiny)</Badge>,
  'Returned for Correction': <Badge tone="warning" icon={AlertTriangle}>Returned for Correction</Badge>,
};

const SURVEY_FORM_ID = 'landing-survey-form';

export const InstitutionLandingPage: React.FC = () => {
  const { linkName } = useParams<{ linkName: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = searchParams.get('preview') === 'true';
  const collectionIdParam = searchParams.get('collectionId');

  // Find interface by slug or collectionId
  const interfaceConfig: DedicatedInterfaceConfig = useMemo(() => {
    if (linkName) {
      const match = INITIAL_INTERFACES.find(
        (i) => i.linkName.toLowerCase() === linkName.toLowerCase()
      );
      if (match) return match;
    }
    if (collectionIdParam) {
      const match = INITIAL_INTERFACES.find((i) => i.collectionId === collectionIdParam);
      if (match) return match;
    }
    return INITIAL_INTERFACES[0];
  }, [linkName, collectionIdParam]);

  // Institution State Simulation (for demo & wireframe verification)
  const [isTargetInstitution, setIsTargetInstitution] = useState<boolean>(true);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('Not Started');

  // Survey Data Entry Modal/State
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const isCorrection = submissionStatus === 'Returned for Correction';

  const downloadColumns = useMemo(
    () =>
      getLandingDownloadsColumns({
        onDownload: (doc) => toast.success(`Simulating download of "${doc.fileName}"`),
      }),
    []
  );

  // Simulated linked survey questions
  const surveyFields = useMemo<FormField[]>(
    () => [
      { name: 'q1', label: 'Q1. AISHE Institutional Code', type: 'text', readOnly: true, gridColumn: 12 },
      {
        name: 'q2',
        label: 'Q2. Total Operational Practical Laboratories',
        type: 'number',
        required: true,
        gridColumn: 12,
      },
      {
        name: 'q3',
        label: 'Q3. Laboratories Meeting Safety & Ventilation Standards',
        type: 'number',
        required: true,
        gridColumn: 12,
        helpText: isCorrection
          ? '✓ Rectified: Safety compliant laboratories (12) now ≤ Total practical laboratories (12).'
          : undefined,
      },
    ],
    [isCorrection]
  );

  const surveyDefaults = useMemo(
    () => ({ q1: 'C-39512', q2: 12, q3: isCorrection ? 12 : 14 }),
    [isCorrection]
  );

  // If Non-Target Institution: Demonstrate Exception [E3]
  if (!isTargetInstitution) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto py-6 px-4">
        {/* Simulation Control Bar */}
        <Alert tone="warning" title="Institution Role Switcher (Wireframe Simulator)">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setIsTargetInstitution(true)}
          >
            Switch to Target Institution (BJB Autonomous College)
          </Button>
        </Alert>

        <InstitutionAccessNotice
          institutionName="Rourkela Private Industrial Training Institute"
          institutionCode="ITI-770014"
          targetScope={interfaceConfig.targetInstitutions || 'All State Universities & Colleges'}
          collectionTitle={interfaceConfig.collectionTitle}
        />
      </div>
    );
  }

  const handleFillOnline = () => {
    setIsSurveyModalOpen(true);
    toast.success('Opening linked survey for online data capture...');
  };

  const handleCorrectSubmission = () => {
    setIsSurveyModalOpen(true);
    toast.info('Opening submission correction interface...');
  };

  const handleSubmitSurvey = () => {
    setIsSurveyModalOpen(false);
    setSubmissionStatus('Submitted');
    toast.success(
      isCorrection
        ? 'Rectified survey submission resubmitted successfully!'
        : 'Survey response submitted successfully!'
    );
  };

  const correctButton = (
    <Button
      type="button"
      variant="warning"
      leftIcon={Edit3}
      className="!bg-[#f59f0a] hover:!bg-[#d97706] text-white border-none shadow-xs"
      onClick={handleCorrectSubmission}
    >
      Correct Submission
    </Button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground space-y-6 max-w-6xl mx-auto pb-16 px-4 sm:px-6 pt-4">
      {/* ADMIN PREVIEW & TESTING SIMULATION TOOLBAR */}
      <Card
        title={
          <span className="flex flex-wrap items-center gap-2">
            Institution Landing Portal Preview & Test Simulator
            {isPreview && <Badge tone="primary">Admin Preview Mode</Badge>}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={ArrowLeft}
                onClick={() =>
                  navigate(`/information-collection/dedicated-interface?collectionId=${interfaceConfig.collectionId}`)
                }
              >
                Back to Configuration
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              title="Test Exception [E3]: User of a non-target institution opens the link"
              onClick={() => setIsTargetInstitution(false)}
            >
              Test [E3] Non-Target Access
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Simulate Institution Status:</span>
          <Tabs
            tabs={STATUS_TABS}
            activeTab={submissionStatus}
            onChange={(key) => setSubmissionStatus(key as SubmissionStatus)}
            variant="pills"
            size="sm"
            label="Simulate institution status"
          />
        </div>
      </Card>

      {/* INSTITUTION HEADER & PAGE HEADING (AS CONFIGURED) */}
      <Card
        icon={Building2}
        title="BJB Autonomous College, Bhubaneswar"
        description="Higher Education Department, Government of Odisha • AISHE Code: C-39512 • District: Khordha • Role: College Admin"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success" icon={ShieldCheck}>Target Institution Verified</Badge>
            <Badge tone="neutral">Collection Code: {interfaceConfig.collectionId}</Badge>
          </div>
        }
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning" icon={Globe}>{interfaceConfig.frequency} Information Collection</Badge>
            <span className="text-xs text-muted-foreground">
              Dedicated URL: <code className="font-mono">/{interfaceConfig.linkName}</code>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {interfaceConfig.pageHeading}
          </h2>
        </div>
      </Card>

      {/* SYSTEM GENERATED 4-METRIC STATUS ROW */}
      <KpiGrid>
        <KpiCard label="Current Cycle" value="Cycle 1 (Q1 2026-27)" note="Always active on this link" icon={RotateCcw} />
        <KpiCard label="Due Date" value="15 Nov 2026, 11:59 PM" note="Official submission cutoff" icon={Calendar} />
        <KpiCard label="Days Left" value="18 Days Remaining" note="Within response window" icon={Clock} />
        <KpiCard
          label="My Status"
          value={STATUS_BADGE[submissionStatus]}
          note="Institution self-appraisal"
          icon={ShieldCheck}
        />
      </KpiGrid>

      {/* RETURNED FOR CORRECTION NOTICE */}
      {isCorrection && (
        <Alert tone="warning" title="Submission Returned by HED Scrutiny Officer (Level 1)">
          <div className="space-y-2">
            <p>
              <strong>Verifier Remarks:</strong> "Section 3: Laboratories meeting safety and ventilation standards
              count (14) cannot exceed total operational science practical laboratories reported in Section 2 (12).
              Please verify physical records and re-submit within the designated 7-day correction window."
            </p>
            <p className="text-xs">
              Returned Date: 28 Oct 2026 • Correction Due: 04 Nov 2026 (7 Days Remaining)
            </p>
            {correctButton}
          </div>
        </Alert>
      )}

      {/* INSTRUCTIONS (AS CONFIGURED) */}
      <Card title="Instructions & Reporting Guidelines" icon={Info}>
        <div className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            {interfaceConfig.instructions ||
              'Please complete all required questions with accurate institutional records.'}
          </p>
          <DetailList
            items={[
              {
                label: 'Mandatory Verification',
                value: 'All data entered into the online survey must match institutional log registers and AISHE master codes.',
              },
              {
                label: 'Submission Window',
                value: 'Once submitted, responses cannot be edited unless returned for correction by the Department scrutiny desk.',
              },
            ]}
          />
        </div>
      </Card>

      {/* DOWNLOADS: REFERENCE DOCUMENTS & PRESCRIBED FORMATS */}
      <Card title={`Reference Documents & Prescribed Formats (${interfaceConfig.downloads?.length || 0})`}>
        <DataTable
          caption="Reference Documents & Prescribed Formats"
          data={interfaceConfig.downloads ?? []}
          columns={downloadColumns}
          rowKey={(d) => d.id}
          searchPlaceholder="Search documents..."
          emptyTitle="No documents"
          emptyDescription="No reference files or formats uploaded for this collection."
        />
      </Card>

      {/* HELPDESK & SUPPORT CONTACT */}
      <Card
        title="Collection Helpdesk & Queries"
        icon={Headphones}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast.info('Helpdesk email client would open for nodal-hims@odisha.gov.in')}
          >
            Contact Helpdesk
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          {interfaceConfig.helpdeskContact ||
            'Dr. Sanjit Pattnaik (HED Nodal Officer) | 0674-2391244 | nodal-hims@odisha.gov.in'}
        </p>
      </Card>

      {/* PRIMARY ACTION (FILL ONLINE / CORRECT SUBMISSION) */}
      {submissionStatus === 'Not Started' && (
        <Card
          title="Ready to Submit Institutional Response?"
          description={`Opens the linked survey "${interfaceConfig.surveyTitle}" for Cycle 1 online data entry.`}
        >
          <Button type="button" variant="primary" rightIcon={ArrowRight} onClick={handleFillOnline}>
            Fill Online
          </Button>
        </Card>
      )}

      {submissionStatus === 'Submitted' && (
        <Alert tone="success" title="Survey Response Successfully Submitted">
          <div className="space-y-2">
            <p>
              Submitted on 26 Oct 2026, 04:30 PM. Your response is currently locked and undergoing scrutiny by the
              HED verification team.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={Eye}
              onClick={() => toast.info('Opening submitted read-only response sheet...')}
            >
              View Submitted Response
            </Button>
          </div>
        </Alert>
      )}

      {isCorrection && (
        <Card
          title="Action Required: Resubmit with Rectifications"
          description="Make corrections as indicated by the verification desk and re-submit."
        >
          {correctButton}
        </Card>
      )}

      {/* SIMULATED SURVEY MODAL */}
      <Modal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        size="2xl"
        title={
          <span className="flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            {isCorrection ? 'Correct Survey Submission' : 'Survey Data Entry (Fill Online)'}
          </span>
        }
        description={interfaceConfig.surveyTitle}
        footer={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsSurveyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={SURVEY_FORM_ID} variant="primary" size="sm" rightIcon={Send}>
              {isCorrection ? 'Submit Rectified Response' : 'Save & Submit Survey'}
            </Button>
          </>
        }
      >
        <FormGenerator
          key={submissionStatus}
          formId={SURVEY_FORM_ID}
          fields={surveyFields}
          defaultValues={surveyDefaults}
          onSubmit={handleSubmitSurvey}
          gridColumns={12}
        />
      </Modal>
    </div>
  );
};

export default InstitutionLandingPage;
