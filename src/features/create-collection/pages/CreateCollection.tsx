import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Alert, Button } from '@/shared/components/ui';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';

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

import createCollectionConfig from '../form-config/createCollectionForm.json';

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

/** Read-only label of the selected survey (Survey Details). */
const readOnlyField = (name: string, label: string, value: string, span = 'md:col-span-3'): FormField => ({
  name,
  label,
  render: () => (
    <div className={`col-span-12 sm:col-span-6 ${span}`}>
      <label className="ui-label select-none">{label}</label>
      <input
        type="text"
        readOnly
        disabled
        value={value}
        title={value}
        className="ui-field bg-muted/40 border-border text-foreground font-medium cursor-not-allowed select-none"
      />
    </div>
  ),
});

/** Heading of an SRS field group inside the form grid. */
const sectionHeading = (name: string, title: string, note?: string): FormField => ({
  name,
  render: () => (
    <div className="col-span-12 pt-3 border-t border-border">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
    </div>
  ),
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
    activityName: {
      tooltip: 'Activity, event, or programme for which information is collected (maximum 200 characters).',
      example: 'Annual Student Science Conclave & Laboratory Audit',
    },
    orderReference: {
      tooltip: 'Departmental order or letter requiring the information (optional, maximum 100 characters).',
      example: 'HED-EST-2026/0942-A',
    },
    cycleDurationDays: {
      tooltip:
        'Number of days each new cycle remains open (1–60). End Date of the cycle survey = cycle Start Date + duration. Must be shorter than the frequency period.',
      example: '15',
    },
    correctionPeriodDays: {
      tooltip: 'Number of days the institution has to correct and resubmit a returned submission (1–30).',
      example: '7',
    },
  }), []);

  // FormGenerator fields from the JSON config + selected survey & conditions
  const dynamicFormFields = useMemo<FormField[]>(() => {
    const fields: FormField[] = [];
    const isRecurring = !!collectionData.frequency && collectionData.frequency !== 'one-time';

    (createCollectionConfig as FormField[]).forEach((field) => {
      // Conditional fields
      if (field.name === 'scheme' && collectionData.collectionType !== 'scheme') return;
      if (field.name === 'activityName' && collectionData.collectionType !== 'activity') return;
      if ((field.name === 'cycleDurationDays' || field.name === 'recurrenceEndDate') && !isRecurring) return;
      if (field.name === 'correctionPeriodDays' && !collectionData.allowReturnForCorrection) return;

      if (field.name === 'frequency') fields.push(sectionHeading('recurrenceSection', 'Recurrence'));
      if (field.name === 'approvalRequired') {
        fields.push(sectionHeading('verificationSection', 'Verification & Upload'));
      }

      // 1. Data Capture Survey, followed by the read-only Survey Details
      if (field.name === 'surveyId') {
        fields.push({ ...field, options: surveyOptions });
        if (selectedSurvey) {
          fields.push(
            sectionHeading(
              'surveyDetailsSection',
              'Survey Details',
              'Read-only. Changed in Survey Management (Edit / Add Questions) while the survey is in Draft.'
            ),
            readOnlyField('surveyHimsModule', 'HIMS Module', selectedSurvey.himsModule),
            readOnlyField('surveyTargetInstitutions', 'Target Institutions', selectedSurvey.targetInstitutions, 'md:col-span-6'),
            readOnlyField('surveyQuestions', 'Number of Questions', String(selectedSurvey.questionCount)),
            readOnlyField(
              'surveyDates',
              'Start Date – End Date',
              `${selectedSurvey.startDate} to ${selectedSurvey.endDate}`,
              'md:col-span-6'
            ),
            readOnlyField('surveyReminders', 'Reminder Settings', selectedSurvey.reminderSettings, 'md:col-span-6'),
            sectionHeading('collectionSection', 'Collection')
          );
        }
        return;
      }

      if (field.name === 'scheme') {
        fields.push({ ...field, options: schemeOptions });
        return;
      }

      // 2. Tooltip-enhanced fields
      const info = FIELD_TOOLTIPS[field.name];
      if (info) {
        fields.push({
          ...field,
          placeholder: '',
          render: (value: any, onChange: (val: any) => void, error?: string) => (
            <div className={field.gridColumn === 6 ? 'col-span-12 sm:col-span-6' : 'col-span-12 sm:col-span-6 md:col-span-3'}>
              <FieldInfoTooltip
                label={field.label || ''}
                required={field.required || field.validation?.required}
                tooltipText={info.tooltip}
                exampleText={info.example}
              />
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={value ?? ''}
                onChange={(e) =>
                  onChange(
                    field.type === 'number'
                      ? e.target.value === ''
                        ? ''
                        : Number(e.target.value)
                      : e.target.value
                  )
                }
                min={field.min}
                max={field.max}
                maxLength={field.maxLength}
                placeholder=""
                className={`ui-field ${error ? 'ui-field--error' : ''}`}
              />
              {error && <p className="ui-error mt-1">{error}</p>}
            </div>
          ),
        });
        return;
      }

      // Default field from config
      fields.push(field);
    });

    return fields;
  }, [surveyOptions, schemeOptions, selectedSurvey, collectionData, FIELD_TOOLTIPS]);

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

        <FormGenerator
          formId="create-collection-form"
          key={`${editing?.id ?? 'new'}-${selectedSurveyId || 'none'}`}
          fields={dynamicFormFields}
          defaultValues={collectionData}
          onValuesChange={handleFormChange}
          onSubmit={handleSave}
          gridColumns={12}
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
