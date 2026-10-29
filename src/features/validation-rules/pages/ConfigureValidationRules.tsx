import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  RotateCcw,
  Save,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Button, DataTable } from '@/shared/components/ui';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';

import { useCollectionStore } from '@/features/collection-store/CollectionStore';
import type { CollectionType, Frequency } from '@/features/manage-collections/types/manageCollections.types';

const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  institution: 'Institution-specific',
  scheme: 'Scheme-specific',
  activity: 'Activity-specific',
};

const FREQUENCY_LABELS: Record<Frequency, string> = {
  'one-time': 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  'half-yearly': 'Half-yearly',
  yearly: 'Yearly',
};

import {
  MOCK_SURVEY_QUESTIONS,
  MOCK_HIMS_DATA_POINTS,
  INITIAL_VALIDATION_RULES,
  type SurveyQuestion,
  type ValidationRule,
} from '../types/validationRules.types';

import validationRuleConfig from '../form-config/validationRuleForm.json';
import { getValidationRulesColumns } from '../columns/validationRulesColumns';
import { validateRuleForm } from '../validation/validationRulesValidation';

export const ConfigureValidationRules: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCollectionId = searchParams.get('collectionId');

  // Master Collections
  const { collections } = useCollectionStore();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    urlCollectionId || collections[0]?.id || ''
  );

  // Active collection object
  const currentCollection = useMemo(() => {
    return collections.find((c) => c.id === selectedCollectionId) || collections[0] || null;
  }, [collections, selectedCollectionId]);

  // Top section: collection selector + read-only details of the selected collection
  const collectionContextFields = useMemo<FormField[]>(
    () => [
      {
        name: 'collectionId',
        label: 'Information Collection',
        type: 'select',
        placeholder: '- Search Collection -',
        gridColumn: 3,
        required: true,
        options: collections.map((c) => ({ label: `${c.collectionTitle} (${c.id})`, value: c.id })),
      },
      { name: 'surveyTitle', label: 'Linked Data Capture Survey', type: 'text', gridColumn: 3, readOnly: true },
      { name: 'collectionType', label: 'Collection Type', type: 'text', gridColumn: 3, readOnly: true },
      { name: 'status', label: 'Collection Status', type: 'text', gridColumn: 3, readOnly: true },
    ],
    [collections]
  );

  const collectionContextValues = useMemo(
    () => ({
      collectionId: currentCollection?.id ?? '',
      surveyTitle: currentCollection?.surveyTitle || 'No linked survey',
      collectionType: currentCollection ? COLLECTION_TYPE_LABELS[currentCollection.collectionType] : '',
      status: currentCollection
        ? `${currentCollection.status} (${FREQUENCY_LABELS[currentCollection.frequency]})`
        : '',
    }),
    [currentCollection]
  );

  // Questions of the linked survey
  const surveyQuestions = useMemo<SurveyQuestion[]>(() => {
    if (!currentCollection) return [];
    return MOCK_SURVEY_QUESTIONS[currentCollection.surveyId] || [];
  }, [currentCollection]);

  // Rules State
  const [allRules, setAllRules] = useState<ValidationRule[]>(INITIAL_VALIDATION_RULES);

  // Filtered rules for current collection
  const collectionRules = useMemo(() => {
    if (!currentCollection) return [];
    return allRules.filter((r) => r.collectionId === currentCollection.id);
  }, [allRules, currentCollection]);

  // Form State managed for FormGenerator
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Helper to construct automatic failure message
  const generateErrorMessage = useCallback(
    (values: Record<string, any>) => {
      const activeQ = surveyQuestions.find((q) => q.id === values.questionId) || surveyQuestions[0];
      if (!activeQ) return 'Validation condition must be met.';

      if (values.ruleCategory === 'cross_question') {
        const target = surveyQuestions.find((q) => q.id === values.targetQuestionId);
        const targetName = target ? `${target.questionCode} (${target.questionText})` : 'target question';
        return `${activeQ.questionCode} must be ${values.operator || '<='} ${targetName}.`;
      }
      if (values.ruleCategory === 'hims_match') {
        const hField = MOCK_HIMS_DATA_POINTS.find((dp) => dp.id === values.himsFieldId);
        if (values.verificationMode && String(values.verificationMode).startsWith('figure_')) {
          const tol = String(values.verificationMode).replace('figure_', '');
          return `${activeQ.questionCode} figure exceeds allowable variance (±${tol}%) against HIMS ${hField?.fieldName || 'records'}.`;
        }
        return `${activeQ.questionCode} does not exist in official HIMS master.`;
      }
      if (values.ruleCategory === 'format') {
        return `Please enter a valid ${(values.dataFormat || 'TEXT').toUpperCase()} format for ${activeQ.questionCode}.`;
      }
      if (values.ruleCategory === 'range') {
        return `${activeQ.questionCode} must be between ${values.minValue || '0'} and ${values.maxValue || 'maximum allowed'}.`;
      }
      if (values.ruleCategory === 'uniqueness') {
        return `${activeQ.questionCode} must be unique across all institutions.`;
      }
      return 'Validation condition must be met.';
    },
    [surveyQuestions]
  );

  const initialFormState = useMemo<Record<string, any>>(() => {
    return {
      questionId: '',
      ruleCategory: '',
      operator: '',
      targetQuestionId: '',
      himsFieldId: '',
      verificationMode: '',
      dataFormat: '',
      minValue: '',
      maxValue: '',
      uniquenessScope: '',
      onFailure: '',
      errorMessage: '',
    };
  }, []);

  const [ruleFormData, setRuleFormData] = useState<Record<string, any>>(initialFormState);

  // Update question if previously selected question no longer exists
  useEffect(() => {
    if (surveyQuestions.length > 0 && editingRuleId) {
      setRuleFormData((prev) => {
        if (prev.questionId && !surveyQuestions.some((q) => q.id === prev.questionId)) {
          return { ...prev, questionId: surveyQuestions[0]?.id || '' };
        }
        return prev;
      });
    }
  }, [surveyQuestions, editingRuleId]);

  // Handle form value changes from FormGenerator
  const handleFormChange = (values: Record<string, any>) => {
    setRuleFormData((prev) => {
      const merged = { ...prev, ...values };

      // If user hasn't explicitly customized error message or if ruleCategory/parameters changed, auto-generate
      const isParamChanged =
        prev.ruleCategory !== merged.ruleCategory ||
        prev.questionId !== merged.questionId ||
        prev.targetQuestionId !== merged.targetQuestionId ||
        prev.operator !== merged.operator ||
        prev.himsFieldId !== merged.himsFieldId ||
        prev.verificationMode !== merged.verificationMode ||
        prev.dataFormat !== merged.dataFormat ||
        prev.minValue !== merged.minValue ||
        prev.maxValue !== merged.maxValue;

      if (isParamChanged || !merged.errorMessage) {
        merged.errorMessage = generateErrorMessage(merged);
      }

      return merged;
    });
  };

  // Dynamically prepare FormGenerator fields based on JSON schema + active survey questions & ruleCategory
  const dynamicFormFields = useMemo<FormField[]>(() => {
    const activeCategory = ruleFormData.ruleCategory || 'cross_question';

    return (validationRuleConfig as FormField[])
      .filter((field) => {
        // Universal fields
        if (['questionId', 'ruleCategory', 'onFailure', 'errorMessage'].includes(field.name)) {
          return true;
        }
        // Dynamic parameter fields per rule category
        if (activeCategory === 'cross_question') {
          return ['operator', 'targetQuestionId'].includes(field.name);
        }
        if (activeCategory === 'hims_match') {
          return ['himsFieldId', 'verificationMode'].includes(field.name);
        }
        if (activeCategory === 'format') {
          return ['dataFormat', 'formatNotice'].includes(field.name);
        }
        if (activeCategory === 'range') {
          return ['minValue', 'maxValue'].includes(field.name);
        }
        if (activeCategory === 'uniqueness') {
          return ['uniquenessScope', 'conflictNotice'].includes(field.name);
        }
        return false;
      })
      .map((field) => {
        if (field.name === 'questionId') {
          return {
            ...field,
            options: surveyQuestions.map((q) => ({
              label: `${q.questionCode}: ${q.questionText} [${q.questionType.replace('_', ' ')}]`,
              value: q.id,
            })),
          };
        }
        if (field.name === 'targetQuestionId') {
          return {
            ...field,
            options: surveyQuestions
              .filter((q) => q.id !== ruleFormData.questionId)
              .map((q) => ({
                label: `${q.questionCode}: ${q.questionText}`,
                value: q.id,
              })),
          };
        }
        if (field.name === 'himsFieldId') {
          return {
            ...field,
            options: MOCK_HIMS_DATA_POINTS.map((dp) => ({
              label: `${dp.fieldName} (${dp.type})`,
              value: dp.id,
            })),
          };
        }
        if (field.name === 'errorMessage') {
          return {
            ...field,
            wrapperClassName: 'md:col-span-9 col-span-12 sm:col-span-6',
          };
        }
        return field;
      });
  }, [surveyQuestions, ruleFormData.ruleCategory, ruleFormData.questionId]);

  // Handle Editing an existing rule
  const handleEditRule = (rule: ValidationRule) => {
    setEditingRuleId(rule.id);
    const updatedValues: Record<string, any> = {
      questionId: rule.questionId,
      ruleCategory: rule.ruleCategory,
      onFailure: rule.onFailure,
      errorMessage: rule.errorMessage,
      formatNotice: 'Enforced upon submit & upload',
      conflictNotice: 'Duplicate submission blocked',
    };

    if (rule.dataFormat) updatedValues.dataFormat = rule.dataFormat;
    if (rule.minValue !== undefined) updatedValues.minValue = rule.minValue;
    if (rule.maxValue !== undefined) updatedValues.maxValue = rule.maxValue;
    if (rule.crossQuestion) {
      updatedValues.operator = rule.crossQuestion.operator;
      updatedValues.targetQuestionId = rule.crossQuestion.targetQuestionId;
    }
    if (rule.himsCheck) {
      updatedValues.himsFieldId = rule.himsCheck.himsFieldId;
      updatedValues.verificationMode =
        rule.himsCheck.checkType === 'existence'
          ? 'existence'
          : `figure_${rule.himsCheck.tolerancePercent ?? 5}`;
    }
    if (rule.isUniqueAcrossInstitutions) {
      updatedValues.uniquenessScope = 'cycle';
    }

    setRuleFormData(updatedValues);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Handle Deleting a rule
  const handleDeleteRule = (ruleId: string) => {
    setAllRules((prev) => prev.filter((r) => r.id !== ruleId));
    toast.success('Validation rule removed.');
  };

  // Reset form
  const handleResetForm = () => {
    setEditingRuleId(null);
    const resetValues: Record<string, any> = {
      ...initialFormState,
      questionId: surveyQuestions[0]?.id || '',
      targetQuestionId: surveyQuestions[1]?.id || '',
    };
    resetValues.errorMessage = generateErrorMessage(resetValues);
    setRuleFormData(resetValues);
  };

  // Save / Add Validation Rule
  const handleSaveRule = (formData: Record<string, any>) => {
    const valResult = validateRuleForm({
      questionId: formData.questionId,
      ruleCategory: formData.ruleCategory,
      errorMessage: formData.errorMessage,
    });
    if (!valResult.isValid) {
      toast.error(valResult.error || 'Please check rule inputs.');
      return;
    }

    const activeQ = surveyQuestions.find((q) => q.id === formData.questionId);
    if (!activeQ) {
      toast.error('Please select a valid survey question.');
      return;
    }

    if (formData.ruleCategory === 'format' && activeQ.questionType !== 'short_text') {
      toast.error('Data format restrictions are only applicable to Short Text questions.');
      return;
    }

    if (formData.ruleCategory === 'range' && !['number', 'decimal'].includes(activeQ.questionType)) {
      toast.error('Value ranges are only applicable to numerical questions.');
      return;
    }

    if (formData.ruleCategory === 'range') {
      const min = Number(formData.minValue);
      const max = Number(formData.maxValue);
      if (formData.minValue !== '' && formData.maxValue !== '' && min > max) {
        toast.error('Minimum value must be less than or equal to Maximum value.');
        return;
      }
    }

    if (formData.ruleCategory === 'cross_question') {
      if (!formData.targetQuestionId) {
        toast.error('Please select a target question for comparison.');
        return;
      }
      if (formData.targetQuestionId === activeQ.id) {
        toast.error('A question cannot be compared against itself.');
        return;
      }
    }

    if (formData.ruleCategory === 'hims_match' && !formData.himsFieldId) {
      toast.error('Please select a HIMS Master reference field.');
      return;
    }

    const msg = (formData.errorMessage || '').trim();
    if (!msg) {
      toast.error('Error message is mandatory.');
      return;
    }

    const targetQ = surveyQuestions.find((q) => q.id === formData.targetQuestionId);
    const himsDP = MOCK_HIMS_DATA_POINTS.find((dp) => dp.id === formData.himsFieldId);
    const isFigure = String(formData.verificationMode).startsWith('figure_');
    const tol = isFigure ? parseInt(String(formData.verificationMode).replace('figure_', ''), 10) : undefined;

    if (editingRuleId) {
      setAllRules((prev) =>
        prev.map((r) => {
          if (r.id !== editingRuleId) return r;
          return {
            ...r,
            questionId: activeQ.id,
            questionCode: activeQ.questionCode,
            ruleCategory: formData.ruleCategory,
            dataFormat: formData.ruleCategory === 'format' ? formData.dataFormat : undefined,
            minValue: formData.ruleCategory === 'range' && formData.minValue !== '' ? Number(formData.minValue) : undefined,
            maxValue: formData.ruleCategory === 'range' && formData.maxValue !== '' ? Number(formData.maxValue) : undefined,
            crossQuestion:
              formData.ruleCategory === 'cross_question'
                ? {
                    targetQuestionId: targetQ?.id || '',
                    targetQuestionCode: targetQ?.questionCode || '',
                    targetQuestionText: targetQ?.questionText || '',
                    operator: formData.operator || '<=',
                  }
                : undefined,
            himsCheck:
              formData.ruleCategory === 'hims_match'
                ? {
                    himsFieldId: himsDP?.id || '',
                    himsFieldName: himsDP?.fieldName || '',
                    checkType: isFigure ? 'figure_match' : 'existence',
                    tolerancePercent: tol,
                  }
                : undefined,
            isUniqueAcrossInstitutions:
              formData.ruleCategory === 'uniqueness' ? true : undefined,
            onFailure: formData.onFailure,
            errorMessage: msg,
          };
        })
      );
      toast.success(`Rule ${editingRuleId} updated successfully.`);
      handleResetForm();
    } else {
      const newRule: ValidationRule = {
        id: `VR-${Date.now().toString().slice(-4)}`,
        collectionId: currentCollection?.id || 'IC-2026-001',
        questionId: activeQ.id,
        questionCode: activeQ.questionCode,
        ruleCategory: formData.ruleCategory,
        dataFormat: formData.ruleCategory === 'format' ? formData.dataFormat : undefined,
        minValue: formData.ruleCategory === 'range' && formData.minValue !== '' ? Number(formData.minValue) : undefined,
        maxValue: formData.ruleCategory === 'range' && formData.maxValue !== '' ? Number(formData.maxValue) : undefined,
        crossQuestion:
          formData.ruleCategory === 'cross_question'
            ? {
                targetQuestionId: targetQ?.id || '',
                targetQuestionCode: targetQ?.questionCode || '',
                targetQuestionText: targetQ?.questionText || '',
                operator: formData.operator || '<=',
              }
            : undefined,
        himsCheck:
          formData.ruleCategory === 'hims_match'
            ? {
                himsFieldId: himsDP?.id || '',
                himsFieldName: himsDP?.fieldName || '',
                checkType: isFigure ? 'figure_match' : 'existence',
                tolerancePercent: tol,
              }
            : undefined,
        isUniqueAcrossInstitutions:
          formData.ruleCategory === 'uniqueness' ? true : undefined,
        onFailure: formData.onFailure,
        errorMessage: msg,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setAllRules((prev) => [newRule, ...prev]);
      toast.success(`Validation rule configured for ${activeQ.questionCode}!`);
      handleResetForm();
    }
  };

  const handleSaveDraft = () => {
    toast.success(
      `Validation rules for "${currentCollection?.collectionTitle}" saved as Draft.`
    );
    navigate('/information-collection/manage-collections');
  };

  const handleSaveAndNext = () => {
    toast.success(
      `All ${collectionRules.length} validation rules saved against "${currentCollection?.collectionTitle}". Proceeding to Dedicated Interface...`
    );
    navigate(`/information-collection/dedicated-interface?collectionId=${selectedCollectionId}`);
  };

  const ruleColumns = useMemo(
    () =>
      getValidationRulesColumns({
        surveyQuestions,
        onEdit: handleEditRule,
        onDelete: handleDeleteRule,
      }),
    [surveyQuestions]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Configure Validation Rules"
        breadcrumbs={[{ label: 'Validation Rules' }]}
      />

      {/* TOP CONTEXT BAR: Searchable Collection Selector & Linked Survey Preview */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
        <FormGenerator
          formId="validation-rules-collection-form"
          fields={collectionContextFields}
          defaultValues={collectionContextValues}
          onValuesChange={(values) => {
            if (values.collectionId && values.collectionId !== selectedCollectionId) {
              setSelectedCollectionId(String(values.collectionId));
              handleResetForm();
            }
          }}
          onSubmit={() => undefined}
          gridColumns={12}
        />
      </div>

      {/* MAIN UNIFIED CARD: Reusable Form with FormGenerator (Searchable Selects) */}
      <Card
        title={editingRuleId ? `Edit Rule (${editingRuleId})` : 'Configure Question Validation Rule'}
        actions={
          editingRuleId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={handleResetForm}
            >
              Cancel Edit
            </Button>
          ) : undefined
        }
      >
        <FormGenerator
          formId="validation-rule-form"
          key={`${editingRuleId || 'new'}-${selectedCollectionId}-${ruleFormData.ruleCategory}`}
          fields={dynamicFormFields}
          defaultValues={ruleFormData}
          onValuesChange={handleFormChange}
          onSubmit={handleSaveRule}
          gridColumns={12}
        />

        {/* Form Action Buttons: Inside the Card and Start Aligned */}
        <div className="flex items-center justify-start gap-3 pt-5 border-t border-border mt-6">
          <Button
            type="button"
            variant="warning"
            leftIcon={Save}
            className="!bg-[#f59f0a] hover:!bg-[#d97706] text-white border-none shadow-xs"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>

          {editingRuleId && (
            <Button
              type="button"
              variant="outline"
              leftIcon={RotateCcw}
              onClick={handleResetForm}
            >
              Cancel Edit
            </Button>
          )}

          <Button
            type="submit"
            form="validation-rule-form"
            variant="primary"
            leftIcon={editingRuleId ? CheckCircle2 : Plus}
          >
            {editingRuleId ? 'Update Validation Rule' : 'Add Validation Rule'}
          </Button>

          <Button
            type="button"
            variant="primary"
            rightIcon={ArrowRight}
            onClick={handleSaveAndNext}
          >
            Save & Next
          </Button>
        </div>
      </Card>

      {/* Active Validation Rules Table inside Card */}
      <Card title="Active Validation Rules">
        <DataTable
          caption="Active Validation Rules"
          data={collectionRules}
          columns={ruleColumns}
          rowKey={(r) => r.id}
          rowLabel={(r) => `${r.id} (${r.questionCode})`}
          searchPlaceholder="Search rules, question, type or parameters..."
          emptyTitle="No Validation Rules Configured"
          emptyDescription="Use the form above to add cross-question comparisons, HIMS master checks, or format validations."
        />
      </Card>
    </div>
  );
};

export default ConfigureValidationRules;
