import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Alert, Button } from '@/shared/components/ui';
import { FormGenerator, SearchableSelect, UploadFile, DatePicker, type FormField } from '@/shared/components/ui/Forms';

import ApprovalLevelsBuilder from '../components/ApprovalLevelsBuilder';
import CreateSurveyQuickModal from '../components/CreateSurveyQuickModal';
import FieldInfoTooltip from '../components/FieldInfoTooltip';
import { validateCollectionForm } from '../validation/createCollectionValidation';
import { findLinkedCollection, getSurveyConditionIssues, nextCollectionId } from '../utils/collectionRules';
import {
  MOCK_HED_ADMINS,
  MOCK_SCHEMES,
  type DraftSurvey,
  type ApprovalLevel,
  type CollectionType,
  type Frequency,
  type InformationCollectionRecord,
} from '../types/createCollection.types';
import { useCollectionStore } from '@/features/collection-store/CollectionStore';


const MANAGE_COLLECTIONS_PATH = '/information-collection/manage-collections';

/** Defaults of a new collection (SRS 1.1): Frequency One-time, Allow Return for Correction checked, Correction Period 7. */
const NEW_COLLECTION_VALUES: Record<string, unknown> = {
  frequency: 'one-time',
  allowReturnForCorrection: true,
  correctionPeriodDays: 7,
  allowOfflineUpload: false,
};

/** Form values of a saved collection (edit mode). */
const toFormValues = (r: InformationCollectionRecord): Record<string, unknown> => ({
  surveyId: r.surveyId,
  collectionTitle: r.collectionTitle,
  collectionType: r.collectionType,
  scheme: r.schemeId ?? '',
  activityName: r.activityName ?? '',
  orderReference: r.orderReference ?? '',
  referenceDocument: r.referenceDocName ?? null,
  frequency: r.frequency,
  cycleDurationDays: r.cycleDurationDays ?? '',
  recurrenceEndDate: r.recurrenceEndDate ?? '',
  approvalRequired: r.approvalRequired ? 'yes' : 'no',
  allowReturnForCorrection: r.allowReturnForCorrection,
  correctionPeriodDays: r.correctionPeriodDays ?? 7,
  allowOfflineUpload: r.allowOfflineUpload,
});



export const CreateCollection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { surveys, setSurveys, collections, setCollections } = useCollectionStore();

  // Edit mode: Manage Collections → Edit opens this page with ?edit=<collection id>
  const editId = searchParams.get('edit');
  const editing = useMemo(() => collections.find((c) => c.id === editId) ?? null, [collections, editId]);

  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(() => editing?.surveyId ?? '');
  const [collectionData, setCollectionData] = useState<Record<string, any>>(() =>
    editing ? toFormValues(editing) : NEW_COLLECTION_VALUES
  );
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>(() => editing?.approvalLevels ?? []);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  // [E2] A survey created through Create New Survey that does not meet the survey conditions
  const [surveyNotice, setSurveyNotice] = useState<{ title: string; issues: string[] } | null>(null);
  // Which button submitted the form
  const submitIntent = useRef<'draft' | 'next'>('next');

  const selectedSurvey = useMemo(
    () => surveys.find((s) => s.id === selectedSurveyId) || null,
    [surveys, selectedSurveyId]
  );

  // Only Draft surveys that meet the survey conditions and are not linked to another collection
  const surveyOptions = useMemo(
    () =>
      surveys
        .filter(
          (s) =>
            s.id === selectedSurveyId ||
            (getSurveyConditionIssues(s).length === 0 && !findLinkedCollection(s.id, collections, editing?.id))
        )
        .map((s) => ({ label: `${s.title} (${s.id})`, value: s.id })),
    [surveys, collections, selectedSurveyId, editing]
  );

  // Active schemes from the Scheme Master
  const schemeOptions = useMemo(
    () =>
      MOCK_SCHEMES.filter((s) => s.status === 'Active').map((s) => ({
        label: `${s.name} (${s.code})`,
        value: s.id,
      })),
    []
  );

  // Tooltip information for fields that use tooltips in place of placeholders
  const FIELD_TOOLTIPS: Record<string, { tooltip: string; example?: string }> = useMemo(() => ({
    surveyId: {
      tooltip: 'Select an active draft survey to link with this information collection.',
      example: 'SRV-2026-001',
    },
    collectionTitle: {
      tooltip: 'Official title of the information collection as displayed to institutions (maximum 200 characters).',
      example: 'Quarterly Degree College Academic & Lab Equipment Census',
    },
    collectionType: {
      tooltip: 'Scope of target institutions: Institution-specific, Scheme-specific, or Activity-specific.',
    },
    scheme: {
      tooltip: 'Associated scheme from the Scheme Master for scheme-specific collections.',
    },
    activityName: {
      tooltip: 'Activity, event, or programme for which information is collected (maximum 200 characters).',
      example: 'Annual Student Science Conclave & Laboratory Audit',
    },
    orderReference: {
      tooltip: 'Departmental order or letter requiring the information (optional, maximum 100 characters).',
      example: 'HED-EST-2026/0942-A',
    },
    referenceDocument: {
      tooltip: 'Upload scanned copy of administrative approval or guideline document (.pdf, max 10 MB).',
    },
    frequency: {
      tooltip: 'Recurrence interval for data collection cycles: One-time, Monthly, Quarterly, Half-yearly, or Yearly.',
    },
    cycleDurationDays: {
      tooltip:
        'Number of days each new cycle remains open (1–60). Cycle End Date = Start Date + duration.',
      example: '15',
    },
    recurrenceEndDate: {
      tooltip: 'Date after which no further recurrence cycles will be automatically generated.',
    },
    approvalRequired: {
      tooltip: 'Select whether submissions require hierarchical HED Admin verification levels before official locking.',
    },
    allowReturnForCorrection: {
      tooltip: 'Enable to allow verifiers to return erroneous submissions to institutions for correction.',
    },
    correctionPeriodDays: {
      tooltip: 'Number of days the institution has to correct and resubmit a returned submission (1–30).',
      example: '7',
    },
    allowOfflineUpload: {
      tooltip: 'Enable bulk offline submission upload via official prescribed Excel template (.xlsx).',
    },
  }), []);

  // FormGenerator fields arranged strictly in rows of 4 columns
  const dynamicFormFields = useMemo<FormField[]>(() => {
    const isRecurring = !!collectionData.frequency && collectionData.frequency !== 'one-time';
    const isScheme = collectionData.collectionType === 'scheme';
    const isActivity = collectionData.collectionType === 'activity';

    // Helper to wrap each field in a 4-column container with synchronized label height
    const makeColumnField = (
      name: string,
      label: string,
      required: boolean,
      control: React.ReactNode,
      tooltipKey = name
    ): FormField => ({
      name,
      label,
      gridColumn: 3,
      render: () => {
        const info = FIELD_TOOLTIPS[tooltipKey];
        return (
          <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 flex flex-col justify-end h-full">
            <div className="min-h-[38px] flex items-end pb-1.5">
              <FieldInfoTooltip
                label={label}
                required={required}
                tooltipText={info?.tooltip}
                exampleText={info?.example}
              />
            </div>
            <div className="w-full">{control}</div>
          </div>
        );
      },
    });

    const fields: FormField[] = [];

    // ROW 1: 4 fields
    // 1. Data Capture Survey *
    fields.push(
      makeColumnField(
        'surveyId',
        'Data Capture Survey',
        true,
        <SearchableSelect
          options={surveyOptions}
          value={collectionData.surveyId ?? ''}
          onChange={(val) => handleFormChange({ surveyId: String(val) })}
          placeholder="- Select Survey -"
          error={validationErrors.surveyId}
        />
      )
    );

    // 2. Collection Title *
    fields.push(
      makeColumnField(
        'collectionTitle',
        'Collection Title',
        true,
        <input
          type="text"
          value={collectionData.collectionTitle ?? ''}
          onChange={(e) => handleFormChange({ collectionTitle: e.target.value })}
          maxLength={200}
          placeholder="Enter collection title"
          className={`ui-field ${validationErrors.collectionTitle ? 'ui-field--error' : ''}`}
        />
      )
    );

    // 3. Collection Type * (SRS: Radio Button)
    fields.push(
      makeColumnField(
        'collectionType',
        'Collection Type',
        true,
        <div className="flex items-center justify-between gap-1 h-[38px] px-2 rounded-lg border border-border bg-card">
          <label className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground cursor-pointer select-none">
            <input
              type="radio"
              name="collectionType"
              value="institution"
              checked={collectionData.collectionType === 'institution'}
              onChange={() => handleFormChange({ collectionType: 'institution' })}
              className="ui-radio"
            />
            <span>Institution</span>
          </label>
          <label className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground cursor-pointer select-none">
            <input
              type="radio"
              name="collectionType"
              value="scheme"
              checked={collectionData.collectionType === 'scheme'}
              onChange={() => handleFormChange({ collectionType: 'scheme' })}
              className="ui-radio"
            />
            <span>Scheme</span>
          </label>
          <label className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground cursor-pointer select-none">
            <input
              type="radio"
              name="collectionType"
              value="activity"
              checked={collectionData.collectionType === 'activity'}
              onChange={() => handleFormChange({ collectionType: 'activity' })}
              className="ui-radio"
            />
            <span>Activity</span>
          </label>
        </div>
      )
    );

    // 4. Scope association (Scheme / Activity / Order Reference)
    if (isScheme) {
      fields.push(
        makeColumnField(
          'scheme',
          'Scheme',
          true,
          <SearchableSelect
            options={schemeOptions}
            value={collectionData.scheme ?? ''}
            onChange={(val) => handleFormChange({ scheme: String(val) })}
            placeholder="- Select Scheme -"
            error={validationErrors.scheme}
          />
        )
      );
    } else if (isActivity) {
      fields.push(
        makeColumnField(
          'activityName',
          'Activity Name',
          true,
          <input
            type="text"
            value={collectionData.activityName ?? ''}
            onChange={(e) => handleFormChange({ activityName: e.target.value })}
            maxLength={200}
            placeholder="Enter activity name"
            className={`ui-field ${validationErrors.activityName ? 'ui-field--error' : ''}`}
          />
        )
      );
    } else {
      // Institution-specific: Order / Letter Reference takes slot 4 in Row 1!
      fields.push(
        makeColumnField(
          'orderReference',
          'Order / Letter Reference',
          false,
          <input
            type="text"
            value={collectionData.orderReference ?? ''}
            onChange={(e) => handleFormChange({ orderReference: e.target.value })}
            maxLength={100}
            placeholder="Order/letter ref no."
            className="ui-field"
          />
        )
      );
    }

    // ROW 2: 4 fields
    if (isScheme || isActivity) {
      fields.push(
        makeColumnField(
          'orderReference',
          'Order / Letter Reference',
          false,
          <input
            type="text"
            value={collectionData.orderReference ?? ''}
            onChange={(e) => handleFormChange({ orderReference: e.target.value })}
            maxLength={100}
            placeholder="Order/letter ref no."
            className="ui-field"
          />
        )
      );
    }

    fields.push(
      makeColumnField(
        'referenceDocument',
        'Reference Document',
        false,
        <UploadFile
          value={collectionData.referenceDocument}
          onChange={(file) => handleFormChange({ referenceDocument: file })}
          accept=".pdf"
        />
      )
    );

    fields.push(
      makeColumnField(
        'frequency',
        'Frequency',
        true,
        <SearchableSelect
          options={[
            { label: 'One-time', value: 'one-time' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Half-yearly', value: 'half-yearly' },
            { label: 'Yearly', value: 'yearly' },
          ]}
          value={collectionData.frequency ?? 'one-time'}
          onChange={(val) => handleFormChange({ frequency: String(val) })}
          placeholder="- Select Frequency -"
          error={validationErrors.frequency}
        />
      )
    );

    if (!isScheme && !isActivity) {
      // In institution: Approval Required is field 7 (SRS: Radio Button), Allow Offline Upload is field 8!
      fields.push(
        makeColumnField(
          'approvalRequired',
          'Approval Required',
          true,
          <div className="flex items-center gap-4 h-[38px] px-3 rounded-lg border border-border bg-card">
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer select-none">
              <input
                type="radio"
                name="approvalRequired"
                value="yes"
                checked={collectionData.approvalRequired === 'yes'}
                onChange={() => handleFormChange({ approvalRequired: 'yes' })}
                className="ui-radio"
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer select-none">
              <input
                type="radio"
                name="approvalRequired"
                value="no"
                checked={collectionData.approvalRequired === 'no'}
                onChange={() => handleFormChange({ approvalRequired: 'no' })}
                className="ui-radio"
              />
              <span>No</span>
            </label>
          </div>
        )
      );

      fields.push(
        makeColumnField(
          'allowOfflineUpload',
          'Allow Offline Upload',
          false,
          <label className="flex items-center gap-2 h-[38px] px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground cursor-pointer select-none hover:bg-muted/30">
            <input
              type="checkbox"
              checked={Boolean(collectionData.allowOfflineUpload)}
              onChange={(e) => handleFormChange({ allowOfflineUpload: e.target.checked })}
              className="ui-check"
            />
            <span>Allow Offline (.xlsx)</span>
          </label>
        )
      );
    } else {
      // In scheme/activity: Approval Required is field 8 (SRS: Radio Button)!
      fields.push(
        makeColumnField(
          'approvalRequired',
          'Approval Required',
          true,
          <div className="flex items-center gap-4 h-[38px] px-3 rounded-lg border border-border bg-card">
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer select-none">
              <input
                type="radio"
                name="approvalRequired"
                value="yes"
                checked={collectionData.approvalRequired === 'yes'}
                onChange={() => handleFormChange({ approvalRequired: 'yes' })}
                className="ui-radio"
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer select-none">
              <input
                type="radio"
                name="approvalRequired"
                value="no"
                checked={collectionData.approvalRequired === 'no'}
                onChange={() => handleFormChange({ approvalRequired: 'no' })}
                className="ui-radio"
              />
              <span>No</span>
            </label>
          </div>
        )
      );
    }

    // ROW 3:
    if (isRecurring) {
      fields.push(
        makeColumnField(
          'cycleDurationDays',
          'Cycle Duration (Days)',
          true,
          <input
            type="number"
            value={collectionData.cycleDurationDays ?? ''}
            onChange={(e) =>
              handleFormChange({
                cycleDurationDays: e.target.value === '' ? '' : Number(e.target.value),
              })
            }
            min={1}
            max={60}
            placeholder="Days (1–60)"
            className={`ui-field ${validationErrors.cycleDurationDays ? 'ui-field--error' : ''}`}
          />
        )
      );

      fields.push(
        makeColumnField(
          'recurrenceEndDate',
          'Recurrence End Date',
          false,
          <DatePicker
            value={collectionData.recurrenceEndDate ?? ''}
            onChange={(e) => handleFormChange({ recurrenceEndDate: e.target.value })}
            placeholder="Select date"
          />
        )
      );
    }

    fields.push(
      makeColumnField(
        'allowReturnForCorrection',
        'Allow Return for Correction',
        false,
        <label className="flex items-center gap-2 h-[38px] px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground cursor-pointer select-none hover:bg-muted/30">
          <input
            type="checkbox"
            checked={Boolean(collectionData.allowReturnForCorrection)}
            onChange={(e) =>
              handleFormChange({ allowReturnForCorrection: e.target.checked })
            }
            className="ui-check"
          />
          <span>Enable Return</span>
        </label>
      )
    );

    if (collectionData.allowReturnForCorrection) {
      fields.push(
        makeColumnField(
          'correctionPeriodDays',
          'Correction Period (Days)',
          true,
          <input
            type="number"
            value={collectionData.correctionPeriodDays ?? 7}
            onChange={(e) =>
              handleFormChange({
                correctionPeriodDays: e.target.value === '' ? '' : Number(e.target.value),
              })
            }
            min={1}
            max={30}
            placeholder="Days (1–30)"
            className={`ui-field ${validationErrors.correctionPeriodDays ? 'ui-field--error' : ''}`}
          />
        )
      );
    }

    if (isScheme || isActivity) {
      fields.push(
        makeColumnField(
          'allowOfflineUpload',
          'Allow Offline Upload',
          false,
          <label className="flex items-center gap-2 h-[38px] px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground cursor-pointer select-none hover:bg-muted/30">
            <input
              type="checkbox"
              checked={Boolean(collectionData.allowOfflineUpload)}
              onChange={(e) => handleFormChange({ allowOfflineUpload: e.target.checked })}
              className="ui-check"
            />
            <span>Allow Offline (.xlsx)</span>
          </label>
        )
      );
    }

    return fields;
  }, [
    surveyOptions,
    schemeOptions,
    collectionData,
    validationErrors,
    FIELD_TOOLTIPS,
  ]);

  // Survey created via the simulated Survey Management window
  const handleSurveyCreated = (newSurvey: DraftSurvey) => {
    setSurveys((prev) => [newSurvey, ...prev]);
    const issues = getSurveyConditionIssues(newSurvey);
    if (issues.length > 0) {
      // [E2] Not offered in the list until the survey settings are changed in Survey Management
      setSurveyNotice({ title: newSurvey.title, issues });
      toast.warning('[E2] The new survey does not meet the survey conditions.');
      return;
    }
    setSurveyNotice(null);
    setSelectedSurveyId(newSurvey.id);
    setCollectionData((prev) => ({
      ...prev,
      surveyId: newSurvey.id,
      collectionTitle: prev.collectionTitle || newSurvey.title,
    }));
  };

  // Synchronize field changes
  const handleFormChange = (values: Record<string, any>) => {
    if (values.surveyId && values.surveyId !== selectedSurveyId) {
      const found = surveys.find((s) => s.id === values.surveyId);
      setSelectedSurveyId(values.surveyId);
      // Collection Title defaults to the Survey Title
      if (found && !collectionData.collectionTitle) {
        values.collectionTitle = found.title;
      }
    }
    // Approval Required = Yes starts with Level 1
    if (values.approvalRequired === 'yes' && approvalLevels.length === 0) {
      setApprovalLevels([{ levelNumber: 1, levelName: 'Level 1: Verification', assignedUserIds: [] }]);
    }
    setCollectionData((prev) => ({ ...prev, ...values }));
  };

  const validateAll = (): boolean => {
    const result = validateCollectionForm(collectionData, {
      survey: selectedSurvey,
      approvalLevels,
    });

    setValidationErrors(result.errors);

    if (!result.isValid) {
      toast.error(Object.values(result.errors)[0]);
      return false;
    }
    return true;
  };

  // Save as Draft and Save & Next both validate and save the collection (status Draft, linked to the survey)
  const handleSave = () => {
    if (!validateAll() || !selectedSurvey) return;

    const today = new Date().toISOString().split('T')[0];
    const type = collectionData.collectionType as CollectionType;
    const frequency = collectionData.frequency as Frequency;
    const isRecurring = frequency !== 'one-time';
    const approvalRequired = collectionData.approvalRequired === 'yes';
    const allowReturn = Boolean(collectionData.allowReturnForCorrection);
    const scheme = type === 'scheme' ? MOCK_SCHEMES.find((s) => s.id === collectionData.scheme) : undefined;
    const doc = collectionData.referenceDocument;

    const record: InformationCollectionRecord = {
      ...editing,
      id: editing?.id ?? nextCollectionId(collections),
      collectionTitle: collectionData.collectionTitle.trim(),
      surveyId: selectedSurvey.id,
      surveyTitle: selectedSurvey.title,
      collectionType: type,
      schemeId: scheme?.id,
      schemeName: scheme?.name,
      activityName: type === 'activity' ? collectionData.activityName.trim() : undefined,
      orderReference: collectionData.orderReference?.trim() || undefined,
      referenceDocName: doc instanceof File ? doc.name : doc || undefined,
      frequency,
      cycleDurationDays: isRecurring ? Number(collectionData.cycleDurationDays) : undefined,
      recurrenceEndDate: isRecurring ? collectionData.recurrenceEndDate || undefined : undefined,
      approvalRequired,
      approvalLevels: approvalRequired ? approvalLevels : [],
      allowReturnForCorrection: allowReturn,
      correctionPeriodDays: allowReturn ? Number(collectionData.correctionPeriodDays) : undefined,
      allowOfflineUpload: Boolean(collectionData.allowOfflineUpload),
      status: editing?.status ?? 'Draft',
      version: editing?.version ?? 1,
      createdAt: editing?.createdAt ?? today,
      updatedAt: today,
    };

    setCollections((prev) =>
      editing ? prev.map((c) => (c.id === record.id ? record : c)) : [record, ...prev]
    );

    if (submitIntent.current === 'next') {
      toast.success(`Collection "${record.collectionTitle}" saved. Configure its validation rules next.`);
      navigate(`/information-collection/validation-rules?collectionId=${record.id}`);
    } else {
      toast.success(`Collection "${record.collectionTitle}" saved as Draft.`);
      navigate(MANAGE_COLLECTIONS_PATH);
    }
  };

  // Back: previous page, or the collection list when this page was opened directly
  const handleBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(MANAGE_COLLECTIONS_PATH);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={editing ? 'Edit Information Collection' : 'Create Information Collection'}
        breadcrumbs={[{ label: 'Create Collection' }]}
      />

      <Card
        title="Collection Details"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsSurveyModalOpen(true)}
          >
            Create New Survey
          </Button>
        }
      >
        {surveyNotice && (
          <Alert
            tone="warning"
            className="mb-4"
            title={`[E2] "${surveyNotice.title}" does not meet the survey conditions`}
          >
            <p>Change these settings in Survey Management, then select the survey here:</p>
            <ul className="list-disc pl-5 mt-1">
              {surveyNotice.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Survey Linked Parameters Strip (4 columns) when a survey is selected */}
        {selectedSurvey && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Linked Survey Parameters (Read-only from Survey Management)
              </span>
              <span className="text-xs font-mono font-semibold text-primary">
                ID: {selectedSurvey.id}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground font-semibold block uppercase text-[10px]">HIMS Module</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedSurvey.himsModule}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block uppercase text-[10px]">Target Institutions</span>
                <p className="font-semibold text-foreground mt-0.5 truncate" title={selectedSurvey.targetInstitutions}>
                  {selectedSurvey.targetInstitutions}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block uppercase text-[10px]">Configured Questions</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedSurvey.questionCount} Questions defined</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block uppercase text-[10px]">Survey Schedule</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedSurvey.startDate} to {selectedSurvey.endDate}</p>
              </div>
            </div>
          </div>
        )}

        <FormGenerator
          formId="create-collection-form"
          key={`${editing?.id ?? 'new'}-${selectedSurveyId || 'none'}`}
          fields={dynamicFormFields}
          defaultValues={collectionData}
          onValuesChange={handleFormChange}
          onSubmit={handleSave}
          gridColumns={12}
          className="!grid-cols-1 sm:!grid-cols-2 md:!grid-cols-4 lg:!grid-cols-4 gap-4"
        />

        {/* Approval Levels when Approval Required is Yes */}
        {collectionData.approvalRequired === 'yes' && (
          <div className="mt-6 pt-4 border-t border-border">
            <ApprovalLevelsBuilder
              levels={approvalLevels}
              availableAdmins={MOCK_HED_ADMINS}
              onChange={setApprovalLevels}
              error={validationErrors.approvalLevels}
            />
          </div>
        )}

        {/* Actions (SRS 1.1): Back, Save as Draft, Save & Next */}
        <div className="flex flex-wrap items-center justify-start gap-3 pt-5 border-t border-border mt-6">
          <Button type="button" variant="outline" leftIcon={ArrowLeft} onClick={handleBack}>
            Back
          </Button>

          <Button
            type="submit"
            form="create-collection-form"
            variant="warning"
            leftIcon={Save}
            className="!bg-[#f59f0a] hover:!bg-[#d97706] text-white border-none shadow-xs"
            onClick={() => {
              submitIntent.current = 'draft';
            }}
          >
            Save as Draft
          </Button>

          <Button
            type="submit"
            form="create-collection-form"
            variant="primary"
            rightIcon={ArrowRight}
            onClick={() => {
              submitIntent.current = 'next';
            }}
          >
            Save & Next
          </Button>
        </div>
      </Card>

      {/* Simulated Survey Management → Create Survey */}
      <CreateSurveyQuickModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        onSurveyCreated={handleSurveyCreated}
      />
    </div>
  );
};

export default CreateCollection;
