import React, { useState, useMemo } from 'react';
import {
  Check,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Alert, Button, DataTable, FilterPanel, Tabs, Modal, KpiCard, KpiGrid, type TabItem } from '@/shared/components/ui';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';
import type { SubmissionVerificationRecord } from '../types/verifySubmissions.types';
import { getVerifySubmissionsColumns, getVerificationAnswerColumns } from '../columns/verifySubmissionsColumns';
import { validateVerificationAction } from '../validation/verifySubmissionsValidation';
import { useConfirmDialog } from '@/features/collection-store/useConfirmDialog';

type DecisionAction = 'Approve' | 'Return for Correction' | 'Reject';

// Verification Workspace: read-only summary of the submission
const SUMMARY_FIELDS: FormField[] = [
  { name: 'institutionCode', label: 'AISHE Code', type: 'text', readOnly: true, gridColumn: 3 },
  { name: 'districtType', label: 'District & Type', type: 'text', readOnly: true, gridColumn: 3 },
  { name: 'receivedSource', label: 'Date & Source', type: 'text', readOnly: true, gridColumn: 3 },
  { name: 'ruleFlags', label: 'Rule Flags', type: 'text', readOnly: true, gridColumn: 3 },
];

const INITIAL_VERIFICATION_SUBMISSIONS: SubmissionVerificationRecord[] = [
  {
    id: 'SUB-2026-001',
    institutionCode: 'C-39512',
    institutionName: 'BJB Autonomous College, Bhubaneswar',
    district: 'Khordha',
    institutionType: 'Government Autonomous',
    receivedOn: '2026-11-04',
    source: 'Online',
    flagsCount: 2,
    flagsList: ['R-01: Cross-Question Q3 > Q2', 'R-04: AISHE Code Mismatch'],
    currentLevel: 'Level 1: Scrutiny',
    status: 'Pending',
    answers: [
      {
        questionId: 'q1',
        questionCode: 'Q1',
        questionText: 'Official AISHE Code of the College',
        answerValue: 'C-39512-OLD',
        isFlagged: true,
        flagRule: 'HIMS Master Match: Value does not match registered AISHE master.',
        himsMasterValue: 'C-39512',
      },
      {
        questionId: 'q2',
        questionCode: 'Q2',
        questionText: 'Total Operational Science Practical Labs Available',
        answerValue: 8,
        isFlagged: false,
      },
      {
        questionId: 'q3',
        questionCode: 'Q3',
        questionText: 'Total Functional Physics Lab Workstations Connected',
        answerValue: 14,
        isFlagged: true,
        flagRule: 'Cross-Question Comparison: Physics Workstations (14) exceeds lab maximum (8).',
      },
      {
        questionId: 'q4',
        questionCode: 'Q4',
        questionText: 'Total Sanctioned Full-Time Faculty',
        answerValue: 72,
        isFlagged: false,
        himsMasterValue: '72 (HIMS HRMS match exact)',
      },
    ],
  },
  {
    id: 'SUB-2026-002',
    institutionCode: 'C-39544',
    institutionName: 'RD Women’s University Affiliated College',
    district: 'Khordha',
    institutionType: 'Constituent College',
    receivedOn: '2026-11-03',
    source: 'Online',
    flagsCount: 0,
    flagsList: [],
    currentLevel: 'Level 1: Scrutiny',
    status: 'Pending',
    answers: [
      {
        questionId: 'q1',
        questionCode: 'Q1',
        questionText: 'Official AISHE Code of the College',
        answerValue: 'C-39544',
        isFlagged: false,
      },
      {
        questionId: 'q2',
        questionCode: 'Q2',
        questionText: 'Total Operational Science Practical Labs Available',
        answerValue: 6,
        isFlagged: false,
      },
      {
        questionId: 'q3',
        questionCode: 'Q3',
        questionText: 'Total Functional Physics Lab Workstations Connected',
        answerValue: 6,
        isFlagged: false,
      },
    ],
  },
  {
    id: 'SUB-2026-003',
    institutionCode: 'C-41208',
    institutionName: 'Dhenkanal Autonomous College, Dhenkanal',
    district: 'Dhenkanal',
    institutionType: 'Government Autonomous',
    receivedOn: '2026-11-05',
    source: 'Offline',
    flagsCount: 1,
    flagsList: ['R-03: Figure variance > 10%'],
    currentLevel: 'Level 1: Scrutiny',
    status: 'Pending',
    answers: [
      {
        questionId: 'q1',
        questionCode: 'Q1',
        questionText: 'Official AISHE Code of the College',
        answerValue: 'C-41208',
        isFlagged: false,
      },
      {
        questionId: 'q2',
        questionCode: 'Q2',
        questionText: 'Total Enrolled Undergraduate Students',
        answerValue: 3420,
        isFlagged: true,
        flagRule: 'HIMS Figure Tolerance: Submitted 3420 exceeds HIMS portal figure by 18% (allowable ±10%).',
        himsMasterValue: '2900',
      },
    ],
  },
  {
    id: 'SUB-2026-004',
    institutionCode: 'C-39820',
    institutionName: 'Stewart Science College, Cuttack',
    district: 'Cuttack',
    institutionType: 'Aided Degree College',
    receivedOn: '2026-11-02',
    source: 'Online',
    flagsCount: 0,
    flagsList: [],
    currentLevel: 'Level 2: Approval',
    status: 'Approved',
    answers: [],
  },
];

export const VerifySubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionVerificationRecord[]>(INITIAL_VERIFICATION_SUBMISSIONS);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('IC-2026-001');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedInstitutionType, setSelectedInstitutionType] = useState<string>('all');
  const [isFilterHidden, setIsFilterHidden] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Pending');

  // Multi-select for bulk approve
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Individual verification view state
  const [verifyingSubmission, setVerifyingSubmission] = useState<SubmissionVerificationRecord | null>(null);
  const [decisionAction, setDecisionAction] = useState<DecisionAction>('Approve');
  const [answerRemarksMap, setAnswerRemarksMap] = useState<Record<string, string>>({});
  const { confirm, confirmDialog } = useConfirmDialog();

  const appliedFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCollectionId !== 'IC-2026-001') count++;
    if (selectedDistrict !== 'all') count++;
    if (selectedSource !== 'all') count++;
    if (selectedInstitutionType !== 'all') count++;
    return count;
  }, [selectedCollectionId, selectedDistrict, selectedSource, selectedInstitutionType]);

  const handleResetFilters = () => {
    setSelectedCollectionId('IC-2026-001');
    setSelectedDistrict('all');
    setSelectedSource('all');
    setSelectedInstitutionType('all');
    toast.info('Filters reset.');
  };

  const statusTabs: TabItem[] = useMemo(() => [
    {
      key: 'Pending',
      label: 'Pending (At My Level)',
      count: submissions.filter((s) => s.status === 'Pending').length,
    },
    {
      key: 'Approved',
      label: 'Approved Submissions',
      count: submissions.filter((s) => s.status === 'Approved').length,
    },
    {
      key: 'Returned',
      label: 'Returned for Correction',
      count: submissions.filter((s) => s.status === 'Returned').length,
    },
    {
      key: 'Rejected',
      label: 'Rejected Submissions',
      count: submissions.filter((s) => s.status === 'Rejected').length,
    },
  ], [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (s.status !== activeTab) return false;
      if (selectedDistrict !== 'all' && s.district !== selectedDistrict) return false;
      if (selectedSource !== 'all' && s.source !== selectedSource) return false;
      if (selectedInstitutionType !== 'all' && s.institutionType !== selectedInstitutionType) return false;
      return true;
    });
  }, [submissions, activeTab, selectedDistrict, selectedSource, selectedInstitutionType]);

  // Bulk Approve handler
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;

    // Check if any selected item has flags
    const flaggedItems = submissions.filter((s) => selectedIds.includes(s.id) && s.flagsCount > 0);
    if (flaggedItems.length > 0) {
      toast.error(
        `[E2] Bulk Approve cannot be applied to flagged submissions (${flaggedItems.length} selected submission(s) have validation flags). Please review them individually.`
      );
      return;
    }

    const ids = selectedIds;
    confirm({
      title: 'Bulk Approve',
      message: `Approve ${ids.length} selected submission(s) without validation flags?`,
      confirmText: 'Approve',
      type: 'success',
      onConfirm: () => {
        setSubmissions((prev) =>
          prev.map((s) =>
            ids.includes(s.id)
              ? { ...s, status: 'Approved', currentLevel: 'Approved (Final)' }
              : s
          )
        );
        toast.success(`Successfully approved ${ids.length} submission(s) without flags.`);
        setSelectedIds([]);
      },
    });
  };

  const handleOpenVerify = (record: SubmissionVerificationRecord) => {
    setVerifyingSubmission(record);
    setDecisionAction(record.flagsCount > 0 ? 'Return for Correction' : 'Approve');
    setAnswerRemarksMap({});
  };

  const handleSubmitDecision = (values: Record<string, any>) => {
    if (!verifyingSubmission) return;
    const decisionAction = values.decisionAction as DecisionAction;
    const overallRemarks = String(values.overallRemarks ?? '');

    const valResult = validateVerificationAction({
      action: decisionAction === 'Return for Correction' ? 'Return' : decisionAction === 'Reject' ? 'Reject' : 'Approve',
      remarks: overallRemarks,
    });
    if (!valResult.isValid) {
      toast.error(valResult.error || 'Please provide required remarks.');
      return;
    }

    const nextStatus =
      decisionAction === 'Approve'
        ? 'Approved'
        : decisionAction === 'Return for Correction'
        ? 'Returned'
        : 'Rejected';

    const submission = verifyingSubmission;
    confirm({
      title: 'Submit Decision',
      message: `Record "${decisionAction}" for the submission from ${submission.institutionName}?`,
      confirmText: 'Submit Decision',
      type: decisionAction === 'Approve' ? 'success' : decisionAction === 'Reject' ? 'danger' : 'warning',
      onConfirm: () => {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submission.id
              ? {
                  ...s,
                  status: nextStatus as any,
                  overallRemarks,
                  currentLevel: decisionAction === 'Approve' ? 'Approved (Level 2)' : s.currentLevel,
                }
              : s
          )
        );

        toast.success(
          `Submission for ${submission.institutionName} recorded as: ${decisionAction}`
        );
        setVerifyingSubmission(null);
      },
    });
  };

  const columns = useMemo(
    () =>
      getVerifySubmissionsColumns({
        onVerify: handleOpenVerify,
      }),
    []
  );

  const answerColumns = useMemo(
    () =>
      getVerificationAnswerColumns({
        remarks: answerRemarksMap,
        onRemarkChange: (questionId, remark) =>
          setAnswerRemarksMap((prev) => ({ ...prev, [questionId]: remark })),
      }),
    [answerRemarksMap]
  );

  // Verification Workspace: read-only submission summary
  const summaryDefaults = useMemo(
    () =>
      verifyingSubmission
        ? {
            institutionCode: verifyingSubmission.institutionCode,
            districtType: `${verifyingSubmission.district} • ${verifyingSubmission.institutionType}`,
            receivedSource: `${verifyingSubmission.receivedOn} (${verifyingSubmission.source})`,
            ruleFlags: `${verifyingSubmission.flagsCount} Flag${verifyingSubmission.flagsCount === 1 ? '' : 's'} Found`,
          }
        : {},
    [verifyingSubmission]
  );

  // Verification Workspace: verifier decision (Allow Full Edit only applies to Return for Correction)
  const decisionDefaults = useMemo(
    () => ({
      decisionAction: verifyingSubmission && verifyingSubmission.flagsCount > 0 ? 'Return for Correction' : 'Approve',
      allowFullEdit: false,
      overallRemarks: '',
    }),
    [verifyingSubmission]
  );

  const decisionFields = useMemo<FormField[]>(
    () => [
      {
        name: 'decisionAction',
        label: 'Action Decision',
        type: 'radio-group',
        required: true,
        orientation: 'horizontal',
        gridColumn: 12,
        options: [
          { value: 'Approve', label: 'Approve Submission' },
          { value: 'Return for Correction', label: 'Return for Correction' },
          { value: 'Reject', label: 'Reject' },
        ],
      },
      ...(decisionAction === 'Return for Correction'
        ? [
            {
              name: 'allowFullEdit',
              label: 'Allow Full Edit (institution can edit all answers, not only the remarked ones)',
              type: 'checkbox',
              gridColumn: 12,
            } as FormField,
          ]
        : []),
      {
        name: 'overallRemarks',
        label:
          decisionAction === 'Approve'
            ? 'Overall Verification Remarks'
            : 'Overall Verification Remarks (mandatory for Return / Reject)',
        type: 'textarea',
        rows: 3,
        gridColumn: 12,
        placeholder: 'Record summary remarks for the institution and higher verification levels...',
      },
    ],
    [decisionAction]
  );

  const flaggedAnswers = verifyingSubmission?.answers.filter((a) => a.isFlagged && a.flagRule) ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Verify and Approve Submissions"
        breadcrumbs={[{ label: 'Verify Submissions' }]}
      />

      {/* KPI CARDS (Matching Dashboard Style) */}
      <KpiGrid>
        <KpiCard
          label="Total Submissions"
          value={String(submissions.length)}
          note="Received for verification"
          icon={Users}
        />
        <KpiCard
          label="Pending Scrutiny"
          value={String(submissions.filter((s) => s.status === 'Pending').length)}
          note="Awaiting verifier action"
          icon={CheckCircle2}
        />
        <KpiCard
          label="Flagged by Rules"
          value={String(submissions.filter((s) => s.flagsCount > 0).length)}
          note="Requires attention"
          icon={AlertTriangle}
        />
        <KpiCard
          label="Approved Submissions"
          value={String(submissions.filter((s) => s.status === 'Approved').length)}
          note="Cleared & passed"
          icon={ShieldCheck}
        />
      </KpiGrid>

      {/* FILTER PANEL (Collapsible with saffron edge strip matching screenshot) */}
      <FilterPanel
        title="Filter Submissions (Level Verifier)"
        hidden={isFilterHidden}
        onHiddenChange={setIsFilterHidden}
        appliedCount={appliedFilterCount}
        floatingButton={false}
        onSubmit={() => {}}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={RotateCcw}
            onClick={handleResetFilters}
            className="h-[34px]"
          >
            Reset Filters
          </Button>
        }
      >
        <div className="min-w-56 flex-1">
          <label className="text-xs font-semibold text-foreground block mb-1">
            Collection
          </label>
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="ui-field text-xs w-full h-[34px]"
          >
            <option value="IC-2026-001">IC-2026-001 — Lab Equipment Census (Cycle 1)</option>
            <option value="IC-2026-003">IC-2026-003 — Faculty Census 2026 (Cycle 1)</option>
          </select>
        </div>

        <div className="min-w-40 flex-1">
          <label className="text-xs font-semibold text-foreground block mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="ui-field text-xs w-full h-[34px]"
          >
            <option value="all">All Districts</option>
            <option value="Khordha">Khordha</option>
            <option value="Cuttack">Cuttack</option>
            <option value="Dhenkanal">Dhenkanal</option>
          </select>
        </div>

        <div className="min-w-40 flex-1">
          <label className="text-xs font-semibold text-foreground block mb-1">Source</label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="ui-field text-xs w-full h-[34px]"
          >
            <option value="all">All Sources</option>
            <option value="Online">Online Only</option>
            <option value="Offline">Offline Only</option>
          </select>
        </div>

        <div className="min-w-48 flex-1">
          <label className="text-xs font-semibold text-foreground block mb-1">Institution Type</label>
          <select
            value={selectedInstitutionType}
            onChange={(e) => setSelectedInstitutionType(e.target.value)}
            className="ui-field text-xs w-full h-[34px]"
          >
            <option value="all">All Institution Types</option>
            <option value="Government Autonomous">Government Autonomous</option>
            <option value="Constituent College">Constituent College</option>
            <option value="Aided Degree College">Aided Degree College</option>
          </select>
        </div>
      </FilterPanel>

      {/* SUBMISSIONS DATA TABLE inside Card */}
      <Card title="Submissions Pending Verification">
        <DataTable
          caption="Submissions Pending Verification"
          data={filteredSubmissions}
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search institution name or code..."
          filterToggle={{
            hidden: isFilterHidden,
            onToggle: () => setIsFilterHidden((prev) => !prev),
            appliedCount: appliedFilterCount,
          }}
          cardActions={
            <div className="w-full flex flex-wrap items-center justify-between gap-3">
              <Tabs
                tabs={statusTabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="pills"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Check size={14} />}
                  disabled={selectedIds.length === 0}
                  onClick={handleBulkApprove}
                >
                  Bulk Approve ({selectedIds.length})
                </Button>
              </div>
            </div>
          }
        />
      </Card>

      {/* VERIFY SUBMISSION MODAL (Using standard Modal.tsx) */}
      {verifyingSubmission && (
        <Modal
          isOpen={!!verifyingSubmission}
          onClose={() => setVerifyingSubmission(null)}
          title={`Verification Workspace — ${verifyingSubmission.institutionName}`}
          size="4xl"
        >
          <div className="p-4 space-y-6">
            {/* SUBMISSION SUMMARY (read-only) */}
            <Card title="Submission Details">
              <FormGenerator
                key={`summary-${verifyingSubmission.id}`}
                formId="verify-summary-form"
                fields={SUMMARY_FIELDS}
                defaultValues={summaryDefaults}
                onSubmit={() => {}}
                gridColumns={12}
              />
            </Card>

            {/* ANSWERS WITH VALIDATION FLAGS */}
            <Card title="Survey Answers & Validation Comparison">
              <div className="space-y-4">
                {flaggedAnswers.length > 0 && (
                  <Alert tone="warning" title={`${flaggedAnswers.length} answer(s) flagged by validation rules`}>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {flaggedAnswers.map((ans) => (
                        <li key={ans.questionId}>
                          <strong>{ans.questionCode}:</strong> {ans.flagRule}
                        </li>
                      ))}
                    </ul>
                  </Alert>
                )}
                <DataTable
                  caption="Survey Answers & Validation Comparison"
                  data={verifyingSubmission.answers}
                  columns={answerColumns}
                  rowKey={(a) => a.questionId}
                  searchPlaceholder="Search question..."
                  emptyTitle="No answers recorded"
                />
              </div>
            </Card>

            {/* VERIFIER DECISION */}
            <Card title="Verifier Action & Findings">
              <FormGenerator
                key={`decision-${verifyingSubmission.id}`}
                formId="verify-decision-form"
                fields={decisionFields}
                defaultValues={decisionDefaults}
                onValuesChange={(values) => {
                  if (values.decisionAction && values.decisionAction !== decisionAction) {
                    setDecisionAction(values.decisionAction as DecisionAction);
                  }
                }}
                onSubmit={handleSubmitDecision}
                gridColumns={12}
              />
            </Card>

            {/* MODAL FOOTER BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVerifyingSubmission(null)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="verify-decision-form"
                variant="primary"
                size="sm"
                rightIcon={Send}
              >
                Submit Decision
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDialog}
    </div>
  );
};

export default VerifySubmissions;

