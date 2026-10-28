import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Button, DataTable, Tabs, Modal, DialogModal, type TabItem } from '@/shared/components/ui';
import type { MyCollectionItem } from '../types/myCollections.types';
import { getMyCollectionsColumns } from '../columns/myCollectionsColumns';
import { validateCorrectionSubmission } from '../validation/myCollectionsValidation';

const INITIAL_MY_COLLECTIONS: MyCollectionItem[] = [
  {
    id: 'MC-001',
    collectionTitle: 'Quarterly Degree College Academic & Lab Equipment Census',
    collectionType: 'institution',
    issuedBy: 'Planning & QA Division, HED Odisha',
    cycle: 'Cycle 1 - Nov 2026',
    dueDate: '2026-11-25',
    status: 'Returned for Correction',
    verifierRemarks: 'Total functional physics lab workstations cannot exceed total sanctioned scientific instruments. Please verify AISHE code record.',
    failedRules: ['R-01: Q3 must be <= Q2', 'R-04: Institutional AISHE Code validation failure'],
    dedicatedSlug: 'science-census-2026',
    correctionPeriodRemainingDays: 5,
    allowFullEdit: false,
    answers: [
      {
        questionId: 'q1',
        questionCode: 'Q1',
        questionText: 'Official AISHE Code of the College',
        currentValue: 'C-39512-OLD',
        hasError: true,
        ruleMessage: 'AISHE code format mismatch against HIMS master list.',
        verifierRemark: 'Please provide valid active AISHE registration number.',
        inputType: 'text',
      },
      {
        questionId: 'q2',
        questionCode: 'Q2',
        questionText: 'Total Operational Science Practical Labs Available',
        currentValue: 8,
        hasError: false,
        inputType: 'number',
      },
      {
        questionId: 'q3',
        questionCode: 'Q3',
        questionText: 'Total Functional Physics Lab Workstations Connected',
        currentValue: 14,
        hasError: true,
        ruleMessage: 'Rule Violation: Physics Workstations (14) exceeds allowable capacity for 8 labs.',
        verifierRemark: 'Check count of operational desks.',
        inputType: 'number',
      },
      {
        questionId: 'q4',
        questionCode: 'Q4',
        questionText: 'Is Smart Classroom Integration Completed?',
        currentValue: 'Yes',
        hasError: false,
        inputType: 'select',
        options: ['Yes', 'No', 'Partial'],
      },
    ],
    history: [
      {
        version: 1,
        date: '2026-11-04',
        user: 'College Admin (BJB Autonomous)',
        status: 'Submitted',
        remarks: 'Initial survey submission via portal.',
      },
      {
        version: 1,
        date: '2026-11-06',
        user: 'Dr. Ananya Mohapatra (Level 1 Verifier)',
        status: 'Returned for Correction',
        remarks: 'Physics workstations count inconsistent with labs count.',
      },
    ],
  },
  {
    id: 'MC-002',
    collectionTitle: 'Faculty Sanctioned vs In-Position Strength Census 2026-27',
    collectionType: 'institution',
    issuedBy: 'Academics & Faculty Development, HED Odisha',
    cycle: 'Cycle 1 - Nov 2026',
    dueDate: '2026-11-20',
    status: 'Under Verification',
    verifierRemarks: 'Under scrutiny by Deputy Director (Academics).',
    dedicatedSlug: 'faculty-census-2026',
    answers: [],
    history: [
      {
        version: 1,
        date: '2026-11-02',
        user: 'College Admin',
        status: 'Submitted',
        remarks: 'Faculty strength statement submitted with Principal signature.',
      },
    ],
  },
  {
    id: 'MC-003',
    collectionTitle: 'State Research & Laboratory Upgrade Grant Utilisation Audit',
    collectionType: 'scheme',
    issuedBy: 'Higher Education Innovation Council',
    cycle: 'Cycle 2 - AY 2026-27',
    dueDate: '2026-12-15',
    status: 'Approved',
    verifierRemarks: 'All grant utilisation receipts verified and accepted.',
    dedicatedSlug: 'srlug-audit-2026',
    answers: [],
    history: [
      {
        version: 1,
        date: '2026-10-28',
        user: 'College Admin',
        status: 'Approved',
        remarks: 'Approved by Additional Secretary (HE).',
      },
    ],
  },
  {
    id: 'MC-004',
    collectionTitle: 'Mo College Abhijan Infrastructure Phase-2 Data Collection',
    collectionType: 'scheme',
    issuedBy: 'Mo College Abhijan Cell',
    cycle: 'Cycle 1 (One-Time)',
    dueDate: '2026-11-30',
    status: 'Not Submitted',
    verifierRemarks: 'Survey window is open. Complete submission before due date.',
    dedicatedSlug: 'mca-infra-phase2',
    answers: [],
    history: [],
  },
];

export const MyCollections: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MyCollectionItem[]>(INITIAL_MY_COLLECTIONS);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedForCorrection, setSelectedForCorrection] = useState<MyCollectionItem | null>(null);
  const [viewingItem, setViewingItem] = useState<MyCollectionItem | null>(null);
  const [correctionAnswers, setCorrectionAnswers] = useState<Record<string, any>>({});
  const [correctionRemarks, setCorrectionRemarks] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const statusTabs: TabItem[] = useMemo(() => [
    { key: 'all', label: 'All Collections', count: items.length },
    {
      key: 'Returned for Correction',
      label: 'Returned for Correction',
      count: items.filter((i) => i.status === 'Returned for Correction').length,
    },
    {
      key: 'Under Verification',
      label: 'Under Verification',
      count: items.filter((i) => i.status === 'Under Verification').length,
    },
    {
      key: 'Approved',
      label: 'Approved',
      count: items.filter((i) => i.status === 'Approved').length,
    },
    {
      key: 'Not Submitted',
      label: 'Not Submitted',
      count: items.filter((i) => i.status === 'Not Submitted').length,
    },
  ], [items]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter((i) => i.status === activeTab);
  }, [items, activeTab]);

  const handleOpenCorrection = (item: MyCollectionItem) => {
    setSelectedForCorrection(item);
    const initialAnswers: Record<string, any> = {};
    item.answers.forEach((a) => {
      initialAnswers[a.questionId] = a.currentValue;
    });
    setCorrectionAnswers(initialAnswers);
    setCorrectionRemarks('');
  };

  const handleResubmit = () => {
    if (!selectedForCorrection) return;

    const validation = validateCorrectionSubmission(
      selectedForCorrection.answers,
      correctionAnswers
    );
    if (!validation.isValid) {
      toast.error(validation.error || 'Please provide corrections for all highlighted questions.');
      return;
    }

    const updated = items.map((i) => {
      if (i.id === selectedForCorrection.id) {
        return {
          ...i,
          status: 'Under Verification' as const,
          verifierRemarks: 'Resubmitted for verification by institution.',
          answers: i.answers.map((a) => ({
            ...a,
            currentValue: correctionAnswers[a.questionId],
            hasError: false,
          })),
          history: [
            ...i.history,
            {
              version: (i.history.length || 1) + 1,
              date: new Date().toISOString().split('T')[0],
              user: 'College Admin (BJB Autonomous)',
              status: 'Resubmitted',
              remarks: correctionRemarks || 'Corrected highlighted answers as requested.',
            },
          ],
        };
      }
      return i;
    });

    setItems(updated);
    setIsConfirmModalOpen(false);
    setSelectedForCorrection(null);
    toast.success('Corrected submission resubmitted successfully for department verification!');
  };

  const columns = useMemo(
    () =>
      getMyCollectionsColumns({
        onOpen: (slug) => navigate(`/portal/collection/${slug}`),
        onCorrect: (item) => handleOpenCorrection(item),
        onViewDetails: (item) => setViewingItem(item),
      }),
    [navigate]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="My Information Collections"
        breadcrumbs={[{ label: 'My Collections' }]}
      />

      {/* IF CORRECTION VIEW ACTIVE, RENDER 1.5 CORRECT SUBMISSION WORKSPACE */}
      {selectedForCorrection ? (
        <Card
          title={`Correct Submission — ${selectedForCorrection.collectionTitle}`}
        >
          <div className="space-y-6">
            {/* ALERT BANNER */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  Submission Returned for Correction ({selectedForCorrection.correctionPeriodRemainingDays || 7} days remaining in correction period)
                </p>
                <p className="text-amber-800 dark:text-amber-300">
                  {selectedForCorrection.verifierRemarks}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Only highlighted answers needing correction are editable. Non-flagged answers remain read-only.
                </p>
              </div>
            </div>

            {/* QUESTIONS & ANSWERS SECTION */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Questions & Answers of the Submission
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedForCorrection.answers.map((ans) => {
                  const isEditable = ans.hasError || selectedForCorrection.allowFullEdit;
                  return (
                    <div
                      key={ans.questionId}
                      className={`p-4 rounded-xl border transition-all ${
                        ans.hasError
                          ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                          {ans.questionCode}
                        </span>
                        {ans.hasError ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <AlertCircle size={12} /> Correction Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-foreground mb-3">{ans.questionText}</p>

                      {/* EDITABLE VS READ-ONLY INPUT */}
                      <div>
                        {ans.inputType === 'select' ? (
                          <select
                            disabled={!isEditable}
                            value={correctionAnswers[ans.questionId] ?? ans.currentValue}
                            onChange={(e) =>
                              setCorrectionAnswers({
                                ...correctionAnswers,
                                [ans.questionId]: e.target.value,
                              })
                            }
                            className={`ui-field text-xs ${!isEditable ? 'bg-muted cursor-not-allowed opacity-80' : ''}`}
                          >
                            {(ans.options || ['Yes', 'No']).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={ans.inputType === 'number' ? 'number' : 'text'}
                            disabled={!isEditable}
                            value={correctionAnswers[ans.questionId] ?? ans.currentValue}
                            onChange={(e) =>
                              setCorrectionAnswers({
                                ...correctionAnswers,
                                [ans.questionId]:
                                  ans.inputType === 'number' ? Number(e.target.value) : e.target.value,
                              })
                            }
                            className={`ui-field text-xs ${!isEditable ? 'bg-muted cursor-not-allowed opacity-80' : ''}`}
                          />
                        )}
                      </div>

                      {/* REMARKS DISPLAY */}
                      {ans.hasError && (
                        <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-900/60 text-[11px] space-y-1">
                          {ans.ruleMessage && (
                            <p className="text-red-700 dark:text-red-400 font-medium">
                              Rule: {ans.ruleMessage}
                            </p>
                          )}
                          {ans.verifierRemark && (
                            <p className="text-amber-800 dark:text-amber-300">
                              Verifier Note: {ans.verifierRemark}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CORRECTION REMARKS */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Institution's Remarks on Correction (Optional, maximum 1000 characters)
              </label>
              <textarea
                rows={3}
                value={correctionRemarks}
                onChange={(e) => setCorrectionRemarks(e.target.value)}
                placeholder="Explain the changes made in the submitted values for verification records..."
                className="ui-field text-xs w-full"
                maxLength={1000}
              />
            </div>

            {/* CORRECTION HISTORY TABLE */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Correction & Verification History
              </h4>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="p-2.5">Version</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Actor</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedForCorrection.history.map((h, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-bold">v{h.version}</td>
                        <td className="p-2.5 text-muted-foreground">{h.date}</td>
                        <td className="p-2.5 font-medium">{h.user}</td>
                        <td className="p-2.5 font-semibold text-amber-700">{h.status}</td>
                        <td className="p-2.5 text-muted-foreground">{h.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION BUTTON BAR: Inside Card at Bottom, Aligned Start */}
            <div className="flex items-center justify-start gap-3 pt-5 border-t border-border mt-6">
              <Button
                type="button"
                variant="primary"
                rightIcon={Send}
                onClick={() => setIsConfirmModalOpen(true)}
              >
                Resubmit for Verification
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* MY COLLECTIONS DATA TABLE */
        <DataTable
          caption="Assigned Information Collections"
          data={filteredItems}
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search assigned collections..."
          cardActions={
            <div className="w-full">
              <Tabs
                tabs={statusTabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="pills"
              />
            </div>
          }
        />
      )}

      {/* CONFIRM RESUBMISSION MODAL */}
      <DialogModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleResubmit}
        title="Confirm Resubmission"
        confirmText="Confirm Resubmit"
        message={
          <div className="space-y-3">
            <p className="text-foreground">
              Are you sure you want to resubmit the corrected values for{' '}
              <strong>{selectedForCorrection?.collectionTitle}</strong>?
            </p>
            <p>
              All question-level and cross-question validation rules will be evaluated upon submission and forwarded to the assigned HED Admin verification levels.
            </p>
          </div>
        }
      />

      {/* VIEW SUBMISSION DETAILS MODAL */}
      {viewingItem && (
        <Modal
          isOpen={!!viewingItem}
          onClose={() => setViewingItem(null)}
          title={`Collection Details — ${viewingItem.collectionTitle}`}
          size="2xl"
        >
          <div className="p-4 space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Collection Title</span>
                <p className="font-semibold text-foreground mt-0.5">{viewingItem.collectionTitle}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Status</span>
                <p className="font-semibold text-foreground mt-0.5 capitalize">{viewingItem.status}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Cycle & Due Date</span>
                <p className="text-foreground mt-0.5">{viewingItem.cycle} &bull; Due: {viewingItem.dueDate}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Issued By</span>
                <p className="text-foreground mt-0.5">{viewingItem.issuedBy}</p>
              </div>
            </div>

            {viewingItem.verifierRemarks && (
              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                  Verifier Remarks
                </span>
                <p className="text-xs text-foreground">{viewingItem.verifierRemarks}</p>
              </div>
            )}

            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">
                Submitted Answers Summary
              </span>
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border text-xs">
                {viewingItem.answers.map((a) => (
                  <div key={a.questionId} className="p-2.5 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono font-semibold text-primary">{a.questionCode}: </span>
                      <span className="text-foreground">{a.questionText}</span>
                    </div>
                    <span className="font-medium text-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded">
                      {String(a.currentValue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setViewingItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyCollections;

