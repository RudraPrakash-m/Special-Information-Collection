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
import { Button, DataTable, FilterPanel, Tabs, Modal, KpiCard, KpiGrid, type TabItem } from '@/shared/components/ui';
import type { SubmissionVerificationRecord } from '../types/verifySubmissions.types';
import { getVerifySubmissionsColumns } from '../columns/verifySubmissionsColumns';
import { validateVerificationAction } from '../validation/verifySubmissionsValidation';

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
  const [isFilterHidden, setIsFilterHidden] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Pending');

  // Multi-select for bulk approve
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Individual verification view state
  const [verifyingSubmission, setVerifyingSubmission] = useState<SubmissionVerificationRecord | null>(null);
  const [decisionAction, setDecisionAction] = useState<'Approve' | 'Return for Correction' | 'Reject'>('Approve');
  const [allowFullEdit, setAllowFullEdit] = useState<boolean>(false);
  const [overallRemarks, setOverallRemarks] = useState<string>('');
  const [answerRemarksMap, setAnswerRemarksMap] = useState<Record<string, string>>({});

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

    setSubmissions((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, status: 'Approved', currentLevel: 'Approved (Final)' }
          : s
      )
    );
    toast.success(`Successfully approved ${selectedIds.length} submission(s) without flags.`);
    setSelectedIds([]);
  };

  const handleOpenVerify = (record: SubmissionVerificationRecord) => {
    setVerifyingSubmission(record);
    setDecisionAction(record.flagsCount > 0 ? 'Return for Correction' : 'Approve');
    setAllowFullEdit(false);
    setOverallRemarks('');
    setAnswerRemarksMap({});
  };

  const handleSubmitDecision = () => {
    if (!verifyingSubmission) return;

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

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === verifyingSubmission.id
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
      `Submission for ${verifyingSubmission.institutionName} recorded as: ${decisionAction}`
    );
    setVerifyingSubmission(null);
  };

  const columns = useMemo(
    () =>
      getVerifySubmissionsColumns({
        onVerify: handleOpenVerify,
      }),
    []
  );

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
          <div className="p-4 space-y-6 text-sm">
            {/* SUBMISSION HEADER SUMMARY */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 rounded-lg bg-muted/20 border border-border text-xs">
              <div>
                <span className="text-muted-foreground block">AISHE Code:</span>
                <span className="font-mono font-bold text-foreground">{verifyingSubmission.institutionCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">District & Type:</span>
                <span className="font-semibold text-foreground">{verifyingSubmission.district} &bull; {verifyingSubmission.institutionType}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Date & Source:</span>
                <span className="font-semibold text-foreground">{verifyingSubmission.receivedOn} ({verifyingSubmission.source})</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Rule Flags:</span>
                <span className={`font-bold ${verifyingSubmission.flagsCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {verifyingSubmission.flagsCount} Flags Found
                </span>
              </div>
            </div>

            {/* ANSWERS WITH VALIDATION FLAGS HIGHLIGHTED */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Survey Answers & Validation Comparison
              </h3>

              <div className="space-y-3">
                {verifyingSubmission.answers.map((ans) => (
                  <div
                    key={ans.questionId}
                    className={`p-3 rounded-lg border text-xs space-y-2 ${
                      ans.isFlagged
                        ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                          {ans.questionCode}
                        </span>
                        <span className="font-medium text-foreground ml-2">{ans.questionText}</span>
                      </div>
                      {ans.isFlagged && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                          Flagged by Rule
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-dashed">
                      <div>
                        <span className="text-muted-foreground">Submitted Answer: </span>
                        <strong className="text-foreground text-xs font-semibold">{String(ans.answerValue)}</strong>
                      </div>
                      {ans.himsMasterValue && (
                        <div className="text-muted-foreground">
                          Official HIMS Master: <span className="font-mono font-semibold text-foreground">{ans.himsMasterValue}</span>
                        </div>
                      )}
                    </div>

                    {ans.flagRule && (
                      <div className="p-2 rounded bg-amber-100/60 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-[11px]">
                        <strong>Violation:</strong> {ans.flagRule}
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        placeholder="Add specific comment/remark for this answer (optional, max 500 chars)..."
                        value={answerRemarksMap[ans.questionId] || ''}
                        onChange={(e) =>
                          setAnswerRemarksMap({
                            ...answerRemarksMap,
                            [ans.questionId]: e.target.value,
                          })
                        }
                        maxLength={500}
                        className="ui-field text-xs w-full mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VERIFIER DECISION PANEL */}
            <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Verifier Action & Findings
              </h4>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Action Decision <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="decisionAction"
                      value="Approve"
                      checked={decisionAction === 'Approve'}
                      onChange={() => setDecisionAction('Approve')}
                      className="text-primary"
                    />
                    <span>Approve Submission</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="decisionAction"
                      value="Return for Correction"
                      checked={decisionAction === 'Return for Correction'}
                      onChange={() => setDecisionAction('Return for Correction')}
                      className="text-amber-600"
                    />
                    <span className="text-amber-700 dark:text-amber-400 font-bold">
                      Return for Correction
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="decisionAction"
                      value="Reject"
                      checked={decisionAction === 'Reject'}
                      onChange={() => setDecisionAction('Reject')}
                      className="text-red-600"
                    />
                    <span className="text-red-600 dark:text-red-400 font-bold">Reject</span>
                  </label>
                </div>
              </div>

              {decisionAction === 'Return for Correction' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="allowFullEdit"
                    checked={allowFullEdit}
                    onChange={(e) => setAllowFullEdit(e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="allowFullEdit" className="text-xs font-medium text-foreground cursor-pointer">
                    Allow Full Edit (Allows institution to edit all answers, not only the remarked ones)
                  </label>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">
                  Overall Verification Remarks{' '}
                  {(decisionAction === 'Return for Correction' || decisionAction === 'Reject') && (
                    <span className="text-red-500">* (Mandatory for Return/Reject)</span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={overallRemarks}
                  onChange={(e) => setOverallRemarks(e.target.value)}
                  placeholder="Record summary remarks for the institution and higher verification levels..."
                  className="ui-field text-xs w-full"
                  maxLength={1000}
                />
              </div>
            </div>

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
                type="button"
                variant="primary"
                size="sm"
                rightIcon={Send}
                onClick={handleSubmitDecision}
              >
                Submit Decision
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VerifySubmissions;

