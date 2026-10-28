import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Button } from '@/shared/components/ui';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';

import ApprovalLevelsBuilder from '../components/ApprovalLevelsBuilder';
import CreateSurveyQuickModal from '../components/CreateSurveyQuickModal';
import FieldInfoTooltip from '../components/FieldInfoTooltip';
import { validateCollectionForm } from '../validation/createCollectionValidation';
import {
  MOCK_SURVEYS,
  MOCK_HED_ADMINS,
  type DraftSurvey,
  type ApprovalLevel,
  type CollectionType,
  type Frequency,
  type InformationCollectionRecord,
} from '../types/createCollection.types';

import createCollectionConfig from '../form-config/createCollectionForm.json';

export const CreateCollection: React.FC = () => {
  const navigate = useNavigate();

  // Master & Survey state
  const [surveys, setSurveys] = useState<DraftSurvey[]>(MOCK_SURVEYS);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');

  // Form State (Empty initial state: no prefilled dummy data)
  const [collectionData, setCollectionData] = useState<Record<string, any>>({});
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Active Selected Survey Object
  const selectedSurvey = useMemo(() => {
    return surveys.find((s) => s.id === selectedSurveyId) || null;
  }, [surveys, selectedSurveyId]);

  // Tooltip information for fields that use tooltips in place of placeholders
  const FIELD_TOOLTIPS: Record<string, { tooltip: string; example?: string }> = useMemo(() => ({
    activityName: {
      tooltip: 'Activity, event, or programme requiring official data collection.',
      example: 'Annual Student Science Conclave & Laboratory Audit',
    },
    orderReference: {
      tooltip: 'Official departmental order or government letter reference.',
      example: 'HED-EST-2026/0942-A',
    },
    cycleDurationDays: {
      tooltip: 'Number of days each cycle remains open (1–60 days). Must be shorter than the frequency period.',
      example: '15',
    },
    correctionPeriodDays: {
      tooltip: 'Number of days the institution has to correct and resubmit a returned submission (1–30 days).',
      example: '7',
    },
  }), []);

  // Dynamically prepare FormGenerator fields based on JSON schema + selected survey & conditions
  const dynamicFormFields = useMemo<FormField[]>(() => {
    const fields: FormField[] = [];

    (createCollectionConfig as FormField[]).forEach((field) => {
      // Conditional display logic:
      if (field.name === 'scheme' && collectionData.collectionType !== 'scheme') return;
      if (field.name === 'activityName' && collectionData.collectionType !== 'activity') return;
      if (
        (field.name === 'cycleDurationDays' || field.name === 'recurrenceEndDate') &&
        (!collectionData.frequency || collectionData.frequency === 'one-time')
      ) {
        return;
      }
      if (
        (field.name === 'allowReturnForCorrection' || field.name === 'correctionPeriodDays') &&
        collectionData.approvalRequired !== 'yes'
      ) {
        return;
      }
      if (
        field.name === 'correctionPeriodDays' &&
        collectionData.allowReturnForCorrection !== 'yes'
      ) {
        return;
      }

      // 1. Data Capture Survey select
      if (field.name === 'surveyId') {
        fields.push({
          ...field,
          placeholder: '- Select Survey -',
          options: surveys.map((s) => ({
            label: `${s.title} (${s.id})`,
            value: s.id,
          })),
        });

        // If a survey is selected, insert the 4 read-only preview fields immediately into the form grid
        if (selectedSurvey) {
          fields.push(
            {
              name: 'surveyHimsModule',
              label: 'HIMS Module',
              gridColumn: 3,
              render: () => (
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                  <label className="ui-label select-none">HIMS Module</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={selectedSurvey.himsModule}
                    className="ui-field bg-muted/40 border-border text-foreground font-medium cursor-not-allowed select-none"
                  />
                </div>
              ),
            },
            {
              name: 'surveyTargetInstitutions',
              label: 'Target Institutions',
              gridColumn: 3,
              render: () => (
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                  <label className="ui-label select-none">Target Institutions</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={selectedSurvey.targetInstitutions}
                    className="ui-field bg-muted/40 border-border text-foreground font-medium cursor-not-allowed select-none"
                  />
                </div>
              ),
            },
            {
              name: 'surveyDates',
              label: 'Start & End Date',
              gridColumn: 3,
              render: () => (
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                  <label className="ui-label select-none">Start & End Date</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`${selectedSurvey.startDate} to ${selectedSurvey.endDate}`}
                    className="ui-field bg-muted/40 border-border text-foreground font-medium cursor-not-allowed select-none"
                  />
                </div>
              ),
            },
            {
              name: 'surveyQuestions',
              label: 'Questions Configured',
              gridColumn: 3,
              render: () => (
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                  <label className="ui-label select-none">Questions Configured</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`${selectedSurvey.questionCount} Questions (${selectedSurvey.responderRole})`}
                    className="ui-field bg-muted/40 border-border text-foreground font-medium cursor-not-allowed select-none"
                  />
                </div>
              ),
            }
          );
        }
        return;
      }

      // 2. Tooltip-enhanced fields
      const info = FIELD_TOOLTIPS[field.name];
      if (info) {
        fields.push({
          ...field,
          placeholder: '',
          render: (value: any, onChange: (val: any) => void, error?: string) => (
            <div className="col-span-12 sm:col-span-6 md:col-span-3">
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
  }, [surveys, selectedSurvey, collectionData, FIELD_TOOLTIPS]);

  // Handle survey created via simulated Survey Management modal
  const handleSurveyCreated = (newSurvey: DraftSurvey) => {
    setSurveys((prev) => [newSurvey, ...prev]);
    setSelectedSurveyId(newSurvey.id);
    setCollectionData((prev) => ({
      ...prev,
      surveyId: newSurvey.id,
      collectionTitle: newSurvey.title,
    }));
  };

  // Synchronize field changes
  const handleFormChange = (values: Record<string, any>) => {
    if (values.surveyId && values.surveyId !== selectedSurveyId) {
      const found = surveys.find((s) => s.id === values.surveyId);
      setSelectedSurveyId(values.surveyId);
      if (found && !collectionData.collectionTitle) {
        values.collectionTitle = found.title;
      }
    }
    setCollectionData((prev) => ({ ...prev, ...values }));
  };

  // Essential Validation Logic
  const validateAll = (): boolean => {
    const result = validateCollectionForm({
      collectionTitle: collectionData.collectionTitle,
      surveyId: selectedSurveyId,
      collectionType: collectionData.collectionType,
      approvalRequired: collectionData.approvalRequired,
      approvalLevels,
    });

    setValidationErrors(result.errors);

    if (!result.isValid) {
      const firstError = Object.values(result.errors)[0];
      toast.error(firstError);
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    if (!validateAll()) return;

    const newRecord: InformationCollectionRecord = {
      id: `IC-${Date.now().toString().slice(-4)}`,
      collectionTitle: collectionData.collectionTitle,
      surveyId: selectedSurveyId,
      surveyTitle: selectedSurvey?.title || '',
      collectionType: collectionData.collectionType as CollectionType,
      schemeId: collectionData.scheme,
      activityName: collectionData.activityName,
      orderReference: collectionData.orderReference,
      frequency: (collectionData.frequency as Frequency) || 'one-time',
      cycleDurationDays: collectionData.cycleDurationDays ? Number(collectionData.cycleDurationDays) : undefined,
      recurrenceEndDate: collectionData.recurrenceEndDate,
      approvalRequired: collectionData.approvalRequired === 'yes',
      approvalLevels: collectionData.approvalRequired === 'yes' ? approvalLevels : [],
      allowReturnForCorrection: collectionData.allowReturnForCorrection === 'yes',
      correctionPeriodDays: collectionData.correctionPeriodDays ? Number(collectionData.correctionPeriodDays) : 7,
      allowOfflineUpload: collectionData.allowOfflineUpload === 'yes',
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    toast.success(`Collection "${newRecord.collectionTitle}" saved as Draft successfully!`);
    navigate('/information-collection/manage-collections');
  };

  const handleSaveAndNext = () => {
    if (!validateAll()) return;

    const generatedId = `IC-${Date.now().toString().slice(-4)}`;
    toast.success('Collection validated! Proceeding to Configure Validation Rules...');
    setTimeout(() => {
      navigate(`/information-collection/validation-rules?collectionId=${generatedId}`);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Create Information Collection"
        breadcrumbs={[{ label: 'Create Collection' }]}
      />

      {/* Main Unified Card Container with FormGenerator matching other pages */}
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
        <FormGenerator
          formId="create-collection-form"
          key={selectedSurveyId || 'new'}
          fields={dynamicFormFields}
          defaultValues={collectionData}
          onValuesChange={handleFormChange}
          onSubmit={handleSaveAndNext}
          gridColumns={12}
        />

        {/* Approval Levels Form Structure when Approval Required is Yes */}
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

        {/* Form Action Buttons: Inside the Card and Start Aligned matching other pages */}
        <div className="flex items-center justify-start gap-3 pt-5 border-t border-border mt-6">
          <Button
            type="button"
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/information-collection/manage-collections')}
          >
            Back to List
          </Button>

          <Button
            type="button"
            variant="warning"
            leftIcon={Save}
            className="!bg-[#f59f0a] hover:!bg-[#d97706] text-white border-none shadow-xs"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>

          <Button
            type="submit"
            form="create-collection-form"
            variant="primary"
            rightIcon={ArrowRight}
          >
            Save & Next
          </Button>
        </div>
      </Card>

      {/* Simulated Survey Management Modal */}
      <CreateSurveyQuickModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        onSurveyCreated={handleSurveyCreated}
      />
    </div>
  );
};

export default CreateCollection;
