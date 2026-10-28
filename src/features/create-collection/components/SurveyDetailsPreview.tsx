import React from 'react';
import { AlertCircle, Calendar, CheckCircle2, FileQuestion, Layers, Users } from 'lucide-react';
import Card from '@/shared/components/layout/Card';
import type { DraftSurvey } from '../types/createCollection.types';

interface SurveyDetailsPreviewProps {
  survey: DraftSurvey | null;
}

export const SurveyDetailsPreview: React.FC<SurveyDetailsPreviewProps> = ({ survey }) => {
  if (!survey) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-muted-foreground bg-muted/20">
        Please select a Data Capture Survey from the dropdown above to review its linked parameters and validation eligibility.
      </div>
    );
  }

  // Pre-condition validation checks:
  const isModuleValid = survey.himsModule === 'Special Information Collection';
  const isRoleValid = survey.responderRole === 'Institution User only';
  const isMethodValid = survey.publicationMethod.includes('Portal');
  const isResubmissionValid = !survey.allowResubmission;
  const hasQuestions = survey.questionCount >= 1;

  const isEligible = isModuleValid && isRoleValid && isMethodValid && isResubmissionValid && hasQuestions;

  return (
    <Card
      title="Survey Details (Read-only from Survey Management)"
      description={`Survey Reference: ${survey.id}`}
      className="border-primary/20 bg-card/60 mt-4"
    >
      <div className="space-y-4">
        {/* Conditions banner */}
        {!isEligible ? (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">
                Survey Conditions Not Met [E2]
              </p>
              <p className="mb-2">
                This survey cannot be linked because one or more required settings in Survey Management do not match:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {!isModuleValid && <li>HIMS Module must be <strong>Special Information Collection</strong> (currently: <em>{survey.himsModule}</em>)</li>}
                {!isRoleValid && <li>Responder Role must be <strong>Institution User only</strong> (currently: <em>{survey.responderRole}</em>)</li>}
                {!isMethodValid && <li>Publication Method must include <strong>Portal</strong></li>}
                {!isResubmissionValid && <li>Allow Resubmission must be <strong>unchecked</strong></li>}
                {!hasQuestions && <li>Survey must have <strong>at least 1 question</strong> added</li>}
              </ul>
              <p className="mt-2 text-xs italic">
                Please edit the survey in Survey Management (Draft mode) before selecting it here.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span>All survey conditions met. Ready for official departmental collection linking.</span>
          </div>
        )}

        {/* Read-only Parameter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="p-3 rounded-lg border bg-background/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>HIMS Module</span>
            </div>
            <p className="text-sm font-medium mt-1 text-foreground">{survey.himsModule}</p>
          </div>

          <div className="p-3 rounded-lg border bg-background/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Target Institutions</span>
            </div>
            <p className="text-sm font-medium mt-1 text-foreground">{survey.targetInstitutions}</p>
          </div>

          <div className="p-3 rounded-lg border bg-background/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Start & End Date</span>
            </div>
            <p className="text-sm font-medium mt-1 text-foreground">
              {survey.startDate} to {survey.endDate}
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-background/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <FileQuestion className="w-3.5 h-3.5 text-primary" />
              <span>Configured Questions</span>
            </div>
            <p className="text-sm font-medium mt-1 text-foreground">
              {survey.questionCount} Questions defined
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-background/50 sm:col-span-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Reminder Settings</span>
            </div>
            <p className="text-sm font-medium mt-1 text-foreground">{survey.reminderSettings}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SurveyDetailsPreview;
