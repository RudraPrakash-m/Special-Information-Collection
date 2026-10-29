import type { DraftSurvey, InformationCollectionRecord } from '../types/createCollection.types';

/* SRS 1.1 rules for which surveys the Data Capture Survey list offers, and the collection id series. */

export const SURVEY_HIMS_MODULE = 'Special Information Collection';
export const SURVEY_RESPONDER_ROLE = 'Institution User only';

/** Survey settings that must be changed in Survey Management before the survey can be linked (empty = all conditions met). */
export const getSurveyConditionIssues = (survey: DraftSurvey): string[] => {
  const issues: string[] = [];
  if (survey.himsModule !== SURVEY_HIMS_MODULE) {
    issues.push(`HIMS Module must be "${SURVEY_HIMS_MODULE}" (currently "${survey.himsModule}").`);
  }
  if (survey.responderRole !== SURVEY_RESPONDER_ROLE) {
    issues.push(`Responder Role must be "${SURVEY_RESPONDER_ROLE}" (currently "${survey.responderRole}").`);
  }
  if (!survey.publicationMethod.includes('Portal')) {
    issues.push('Publication Method must include Portal.');
  }
  if (survey.allowResubmission) {
    issues.push('Allow Resubmission must be unchecked.');
  }
  if (survey.questionCount < 1) {
    issues.push('At least one question must be added (Add Questions).');
  }
  return issues;
};

/** The collection the survey is already linked to, ignoring `exceptCollectionId` (the collection being edited). */
export const findLinkedCollection = (
  surveyId: string,
  collections: InformationCollectionRecord[],
  exceptCollectionId?: string
) => collections.find((c) => c.surveyId === surveyId && c.id !== exceptCollectionId);

/** Next free id in the IC-<year>-NNN series. */
export const nextCollectionId = (collections: InformationCollectionRecord[]) => {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^IC-${year}-(\\d+)$`);
  const last = collections.reduce((max, c) => Math.max(max, Number(pattern.exec(c.id)?.[1] ?? 0)), 0);
  return `IC-${year}-${String(last + 1).padStart(3, '0')}`;
};
