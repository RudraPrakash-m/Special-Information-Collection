import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Alert, Button, DataTable, FilterPanel, Tabs, Modal, DialogModal, type TabItem } from '@/shared/components/ui';
import { FormGenerator, SearchableSelect, type FormField } from '@/shared/components/ui/Forms';
import FieldInfoTooltip from '../components/FieldInfoTooltip';
import type { MyCollectionItem } from '../types/myCollections.types';
import { getMyCollectionsColumns } from '../columns/myCollectionsColumns';
import { getCorrectionHistoryColumns } from '../columns/correctionHistoryColumns';
import correctSubmissionConfig from '../form-config/correctSubmissionForm.json';
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
  const [filterType, setFilterType] = useState<string>('all');
  const [isFilterHidden, setIsFilterHidden] = useState<boolean>(false);
  const [selectedForCorrection, setSelectedForCorrection] = useState<MyCollectionItem | null>(null);
  const [viewingItem, setViewingItem] = useState<MyCollectionItem | null>(null);
  const [correctionAnswers, setCorrectionAnswers] = useState<Record<string, any>>({});
  const [correctionRemarks, setCorrectionRemarks] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const appliedFilterCount = useMemo(() => {
    let count = 0;
    if (filterType !== 'all') count++;
    return count;
  }, [filterType]);

  const handleResetFilters = () => {
    setFilterType('all');
    toast.info('Filters reset.');
  };

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
    return items.filter((i) => {
      if (activeTab !== 'all' && i.status !== activeTab) return false;
      if (filterType !== 'all' && i.collectionType !== filterType) return false;
      return true;
    });
  }, [items, activeTab, filterType]);

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

  // Correct Submission form: one field per answer (only highlighted ones editable) + Correction Remarks
  const correctionFields = useMemo<FormField[]>(() => {
    if (!selectedForCorrection) return [];
    const answerFields = selectedForCorrection.answers.map((ans): FormField => {
      const isEditable = ans.hasError || selectedForCorrection.allowFullEdit;
      const notes = [
        ans.ruleMessage && `Rule: ${ans.ruleMessage}`,
        ans.verifierRemark && `Remark: ${ans.verifierRemark}`,
      ]
        .filter(Boolean)
        .join(' · ');
      const label = `${ans.questionCode}. ${ans.questionText}`;
      const options =
        ans.inputType === 'select'
          ? (ans.options || ['Yes', 'No']).map((opt) => ({ label: opt, value: opt }))
          : undefined;
      const field: FormField = {
        name: ans.questionId,
        label,
        type: ans.inputType,
        options,
        gridColumn: 3,
        // Read-only answers: text / number as read-only fields, dropdowns disabled
        readOnly: !isEditable && ans.inputType !== 'select',
        disabled: !isEditable && ans.inputType === 'select',
        ...(ans.hasError && {
          required: true,
          validation: { required: true, message: `Correct the answer to ${ans.questionCode}` },
        }),
      };

      // Every question uses the consistent aligned renderer with synchronized label heights
      return {
        ...field,
        render: (value, onChange, error) => (
          <div className="col-span-12 sm:col-span-6 md:col-span-3 flex flex-col justify-end h-full">
            <div className="min-h-[42px] flex items-end pb-1.5">
              <FieldInfoTooltip
                label={label}
                required={ans.hasError}
                tooltipText={notes || undefined}
              />
            </div>
            <div className="w-full">
              {ans.inputType === 'select' ? (
                <SearchableSelect
                  options={options}
                  value={value ?? ''}
                  onChange={onChange}
                  disabled={!isEditable}
                  error={error}
                />
              ) : (
                <>
                  <input
                    type={ans.inputType === 'number' ? 'number' : 'text'}
                    value={value ?? ''}
                    readOnly={!isEditable}
                    onChange={(e) => onChange(e.target.value)}
                    className={`ui-field ${error ? 'ui-field--error' : ''} ${
                      !isEditable ? 'bg-muted/20 cursor-not-allowed opacity-90' : ''
                    }`}
                  />
                  {error && <p className="ui-error mt-1">{error}</p>}
                </>
              )}
            </div>
          </div>
        ),
      };
    });
    return [...answerFields, ...(correctSubmissionConfig as FormField[])];
  }, [selectedForCorrection]);

  const correctionDefaults = useMemo<Record<string, unknown>>(() => {
    if (!selectedForCorrection) return {};
    const values: Record<string, unknown> = { correctionRemarks: '' };
    selectedForCorrection.answers.forEach((a) => {
      values[a.questionId] = a.currentValue;
    });
    return values;
  }, [selectedForCorrection]);

  const historyColumns = useMemo(() => getCorrectionHistoryColumns(), []);

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
            <Alert
              tone="warning"
              title={`Submission Returned for Correction (${selectedForCorrection.correctionPeriodRemainingDays || 7} days remaining in correction period)`}
            >
              <p>{selectedForCorrection.verifierRemarks}</p>
              <p className="mt-1 text-xs opacity-80">
                Only answers needing correction are editable. Other answers are read-only.
              </p>
            </Alert>

            {/* Answers (highlighted ones editable) + Correction Remarks */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Questions & Answers of the Submission
              </h3>
              <FormGenerator
                key={selectedForCorrection.id}
                formId="correct-submission-form"
                fields={correctionFields}
                defaultValues={correctionDefaults}
                onValuesChange={(values) => {
                  const { correctionRemarks: remarks, ...answers } = values;
                  setCorrectionRemarks(String(remarks ?? ''));
                  setCorrectionAnswers(answers);
                }}
                onSubmit={() => setIsConfirmModalOpen(true)}
                gridColumns={12}
              />
            </div>

            {/* Correction History */}
            <div className="space-y-2">
              {/* <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Correction & Verification History
              </h4> */}
              <Card
              title="Correction & Verification History"
              >

                <DataTable
                  caption="Correction History"
                  data={selectedForCorrection.history}
                  columns={historyColumns}
                  rowKey={(h) => `${h.version}-${h.date}-${h.status}`}
                  emptyTitle="No history yet"
                />
              </Card>
            </div>

            {/* ACTION BUTTON BAR: Inside Card at Bottom, Aligned Start */}
            <div className="flex items-center justify-start gap-3 pt-5 border-t border-border mt-6">
              <Button type="button" variant="outline" leftIcon={ArrowLeft} onClick={() => setSelectedForCorrection(null)}>
                Back
              </Button>
              <Button type="submit" form="correct-submission-form" variant="primary" rightIcon={Send}>
                Resubmit for Verification
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* MY COLLECTIONS DATA TABLE WITH FILTER PANEL inside Card */
        <>
          <FilterPanel
            title="Filter My Collections"
            hidden={isFilterHidden}
            onHiddenChange={setIsFilterHidden}
            appliedCount={appliedFilterCount}
            floatingButton={false}
            onSubmit={() => { }}
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
            <div className="min-w-48 flex-1">
              <label className="text-xs font-semibold text-foreground block mb-1">Collection Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="ui-field text-xs w-full h-[34px]"
              >
                <option value="all">All Types</option>
                <option value="institution">Institution-specific</option>
                <option value="scheme">Scheme-specific</option>
              </select>
            </div>
          </FilterPanel>

          <Card title="Assigned Information Collections">
            <DataTable
              caption="Assigned Information Collections"
              data={filteredItems}
              columns={columns}
              rowKey={(r) => r.id}
              searchPlaceholder="Search assigned collections..."
              filterToggle={{
                hidden: isFilterHidden,
                onToggle: () => setIsFilterHidden((prev) => !prev),
                appliedCount: appliedFilterCount,
              }}
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
          </Card>
        </>
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

