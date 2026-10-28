import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Building2,
  Headphones,
  Edit3,
  Eye,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button, Modal } from '@/shared/components/ui';
import Card from '@/shared/components/layout/Card';
import {
  INITIAL_INTERFACES,
  type DedicatedInterfaceConfig,
  type InterfaceDownloadItem,
} from '../types/dedicatedInterface.types';
import { InstitutionAccessNotice } from '../components/InstitutionAccessNotice';
import { toast } from 'sonner';

export const InstitutionLandingPage: React.FC = () => {
  const { linkName } = useParams<{ linkName: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = searchParams.get('preview') === 'true';
  const collectionIdParam = searchParams.get('collectionId');

  // Find interface by slug or collectionId
  const interfaceConfig: DedicatedInterfaceConfig = useMemo(() => {
    if (linkName) {
      const match = INITIAL_INTERFACES.find(
        (i) => i.linkName.toLowerCase() === linkName.toLowerCase()
      );
      if (match) return match;
    }
    if (collectionIdParam) {
      const match = INITIAL_INTERFACES.find((i) => i.collectionId === collectionIdParam);
      if (match) return match;
    }
    return INITIAL_INTERFACES[0];
  }, [linkName, collectionIdParam]);

  // Institution State Simulation (for demo & wireframe verification)
  const [isTargetInstitution, setIsTargetInstitution] = useState<boolean>(true);
  const [submissionStatus, setSubmissionStatus] = useState<
    'Not Started' | 'Submitted' | 'Returned for Correction'
  >('Not Started');

  // Survey Data Entry Modal/State
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // If Non-Target Institution: Demonstrate Exception [E3]
  if (!isTargetInstitution) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto py-6 px-4">
        {/* Simulation Control Bar */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between gap-4 text-xs">
          <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-600" />
            Institution Role Switcher (Wireframe Simulator):
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTargetInstitution(true)}
              className="px-3 py-1 rounded-md bg-amber-600 text-white font-semibold hover:bg-amber-700"
            >
              Switch to Target Institution (BJB Autonomous College)
            </button>
          </div>
        </div>

        <InstitutionAccessNotice
          institutionName="Rourkela Private Industrial Training Institute"
          institutionCode="ITI-770014"
          targetScope={interfaceConfig.targetInstitutions || 'All State Universities & Colleges'}
          collectionTitle={interfaceConfig.collectionTitle}
        />
      </div>
    );
  }

  const getFormatBadge = (format: 'PDF' | 'XLSX' | 'DOCX') => {
    switch (format) {
      case 'PDF':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <FileText size={12} /> PDF
          </span>
        );
      case 'XLSX':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <FileSpreadsheet size={12} /> Excel
          </span>
        );
      case 'DOCX':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <FileCheck size={12} /> Word
          </span>
        );
    }
  };

  const handleFillOnline = () => {
    setIsSurveyModalOpen(true);
    toast.success('Opening linked survey for online data capture...');
  };

  const handleCorrectSubmission = () => {
    setIsSurveyModalOpen(true);
    toast.info('Opening submission correction interface...');
  };

  return (
    <div className="min-h-screen bg-background text-foreground space-y-6 max-w-6xl mx-auto pb-16 px-4 sm:px-6">
      {/* ADMIN PREVIEW & TESTING SIMULATION TOOLBAR */}
      <div className="p-3 bg-gradient-to-r from-amber-500/10 via-background to-blue-500/10 border border-border rounded-xl shadow-xs space-y-2 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-foreground">
              Institution Landing Portal Preview & Test Simulator
            </span>
            {isPreview && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                Admin Preview Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={ArrowLeft}
                onClick={() =>
                  navigate(`/information-collection/dedicated-interface?collectionId=${interfaceConfig.collectionId}`)
                }
                className="h-7 text-xs"
              >
                Back to Configuration
              </Button>
            )}

            <button
              onClick={() => setIsTargetInstitution(false)}
              className="text-[11px] px-2.5 py-1 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-medium"
              title="Test Exception [E3]: User of a non-target institution opens the link"
            >
              Test [E3] Non-Target Access
            </button>
          </div>
        </div>

        {/* Institution Status Switcher */}
        <div className="flex items-center gap-2 pt-1 border-t border-border flex-wrap text-xs">
          <span className="text-muted-foreground font-medium">Simulate Institution Status:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSubmissionStatus('Not Started')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                submissionStatus === 'Not Started'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              1. Not Started (Fill Online Active)
            </button>
            <button
              onClick={() => setSubmissionStatus('Submitted')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                submissionStatus === 'Submitted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              2. Submitted (Fill Online Hidden)
            </button>
            <button
              onClick={() => setSubmissionStatus('Returned for Correction')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                submissionStatus === 'Returned for Correction'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              3. Returned for Correction (Correct Submission Active)
            </button>
          </div>
        </div>
      </div>

      {/* INSTITUTION HEADER BAR */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Higher Education Department, Government of Odisha
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Target Institution Verified
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                BJB Autonomous College, Bhubaneswar
              </h1>
              <p className="text-xs text-muted-foreground">
                AISHE Code: <span className="font-mono font-semibold">C-39512</span> • District: Khordha • Role: College Admin
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">Collection Code:</span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
              {interfaceConfig.collectionId}
            </span>
          </div>
        </div>

        {/* HERO TITLE (PAGE HEADING AS CONFIGURED) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Globe size={12} /> {interfaceConfig.frequency} Information Collection
            </span>
            <span className="text-xs text-muted-foreground">
              Dedicated URL: <code className="font-mono">/{interfaceConfig.linkName}</code>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {interfaceConfig.pageHeading}
          </h2>
        </div>
      </div>

      {/* SYSTEM GENERATED 4-METRIC STATUS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Cycle */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Current Cycle</span>
            <RotateCcw size={15} className="text-primary" />
          </div>
          <p className="text-base font-bold text-foreground">Cycle 1 (Q1 2026-27)</p>
          <p className="text-[11px] text-muted-foreground">Always active on this link</p>
        </div>

        {/* Due Date */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Due Date</span>
            <Calendar size={15} className="text-primary" />
          </div>
          <p className="text-base font-bold text-foreground">15 Nov 2026, 11:59 PM</p>
          <p className="text-[11px] text-muted-foreground">Official submission cutoff</p>
        </div>

        {/* Days Left */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Days Left</span>
            <Clock size={15} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-base font-bold text-amber-700 dark:text-amber-400">18 Days Remaining</p>
          <p className="text-[11px] text-muted-foreground">Within response window</p>
        </div>

        {/* My Status */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">My Status</span>
            <ShieldCheck size={15} className="text-primary" />
          </div>
          <div>
            {submissionStatus === 'Not Started' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Clock size={13} /> Pending Submission
              </span>
            )}
            {submissionStatus === 'Submitted' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={13} /> Submitted (Under Scrutiny)
              </span>
            )}
            {submissionStatus === 'Returned for Correction' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <AlertTriangle size={13} className="text-amber-600" /> Returned for Correction
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">Institution self-appraisal</p>
        </div>
      </div>

      {/* RETURNED FOR CORRECTION BANNER (WHEN STATUS IS RETURNED FOR CORRECTION) */}
      {submissionStatus === 'Returned for Correction' && (
        <div className="p-4 sm:p-5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Submission Returned by HED Scrutiny Officer (Level 1)
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Verifier Remarks:</span> "Section 3: Laboratories meeting safety and ventilation standards count (14) cannot exceed total operational science practical laboratories reported in Section 2 (12). Please verify physical records and re-submit within the designated 7-day correction window."
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Returned Date: 28 Oct 2026 • Correction Due: 04 Nov 2026 (7 Days Remaining)
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="warning"
              leftIcon={Edit3}
              className="!bg-[#f59f0a] hover:!bg-[#d97706] text-white border-none shadow-xs shrink-0"
              onClick={handleCorrectSubmission}
            >
              Correct Submission
            </Button>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS CARD (AS CONFIGURED) */}
      <Card title="Instructions & Reporting Guidelines">
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-3">
          <p className="text-foreground font-medium">
            {interfaceConfig.instructions ||
              'Please complete all required questions with accurate institutional records.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <p className="font-semibold text-foreground">Mandatory Verification:</p>
              <p className="text-muted-foreground">
                All data entered into the online survey must match institutional log registers and AISHE master codes.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <p className="font-semibold text-foreground">Submission Window:</p>
              <p className="text-muted-foreground">
                Once submitted, responses cannot be edited unless returned for correction by the Department scrutiny desk.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* DOWNLOADS SECTION: REFERENCE DOCUMENTS & PRESCRIBED FORMATS */}
      <Card
        title={`Reference Documents & Prescribed Formats (${interfaceConfig.downloads?.length || 0})`}
      >
        <div className="space-y-3">
          {interfaceConfig.downloads && interfaceConfig.downloads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {interfaceConfig.downloads.map((doc: InterfaceDownloadItem) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/20 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">{getFormatBadge(doc.format)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground line-clamp-2" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {doc.fileSize}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={Download}
                    className="w-full text-xs h-8"
                    onClick={() => toast.success(`Simulating download of "${doc.fileName}"`)}
                  >
                    Download Format
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              No reference files or formats uploaded for this collection.
            </p>
          )}
        </div>
      </Card>

      {/* HELPDESK & SUPPORT CONTACT */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Headphones size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Collection Helpdesk & Queries
            </h4>
            <p className="text-xs text-muted-foreground font-medium">
              {interfaceConfig.helpdeskContact ||
                'Dr. Sanjit Pattnaik (HED Nodal Officer) | 0674-2391244 | nodal-hims@odisha.gov.in'}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            toast.info('Helpdesk email client would open for nodal-hims@odisha.gov.in')
          }
        >
          Contact Helpdesk
        </Button>
      </div>

      {/* PRIMARY ACTION BUTTONS (FILL ONLINE / CORRECT SUBMISSION) */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-md flex flex-col items-center justify-center gap-3 text-center">
        {submissionStatus === 'Not Started' && (
          <>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Ready to Submit Institutional Response?
              </h3>
              <p className="text-xs text-muted-foreground">
                Opens the linked survey "{interfaceConfig.surveyTitle}" for Cycle 1 online data entry.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="lg"
              rightIcon={ArrowRight}
              className="px-8 py-2.5 text-sm font-semibold shadow-md"
              onClick={handleFillOnline}
            >
              Fill Online
            </Button>
          </>
        )}

        {submissionStatus === 'Submitted' && (
          <div className="space-y-3 py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={16} /> Survey Response Successfully Submitted
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Submitted on 26 Oct 2026, 04:30 PM. Your response is currently locked and undergoing scrutiny by the HED verification team.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={Eye}
                onClick={() => toast.info('Opening submitted read-only response sheet...')}
              >
                View Submitted Response
              </Button>
            </div>
          </div>
        )}

        {submissionStatus === 'Returned for Correction' && (
          <div className="space-y-2 py-1">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                Action Required: Resubmit with Rectifications
              </h3>
              <p className="text-xs text-muted-foreground">
                Make corrections as indicated by the verification desk and re-submit.
              </p>
            </div>
            <Button
              type="button"
              variant="warning"
              size="lg"
              leftIcon={Edit3}
              className="!bg-[#f59f0a] hover:!bg-[#d97706] text-white border-none shadow-md px-8 font-semibold"
              onClick={handleCorrectSubmission}
            >
              Correct Submission
            </Button>
          </div>
        )}
      </div>

      {/* SIMULATED SURVEY MODAL */}
      <Modal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        size="2xl"
        title={
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={18} />
            </span>
            {submissionStatus === 'Returned for Correction'
              ? 'Correct Survey Submission'
              : 'Survey Data Entry (Fill Online)'}
          </span>
        }
        description={interfaceConfig.surveyTitle}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSurveyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setIsSurveyModalOpen(false);
                setSubmissionStatus('Submitted');
                toast.success(
                  submissionStatus === 'Returned for Correction'
                    ? 'Rectified survey submission resubmitted successfully!'
                    : 'Survey response submitted successfully!'
                );
              }}
            >
              {submissionStatus === 'Returned for Correction'
                ? 'Submit Rectified Response'
                : 'Save & Submit Survey'}
            </Button>
          </>
        }
      >
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                <span className="font-bold text-foreground">Question 1: AISHE Institutional Code</span>
                <input
                  type="text"
                  readOnly
                  value="C-39512"
                  className="ui-field bg-background font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                <span className="font-bold text-foreground">Question 2: Total Operational Practical Laboratories</span>
                <input
                  type="number"
                  defaultValue="12"
                  className="ui-field bg-background font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                <span className="font-bold text-foreground">Question 3: Laboratories Meeting Safety & Ventilation Standards</span>
                <input
                  type="number"
                  defaultValue={submissionStatus === 'Returned for Correction' ? '12' : '14'}
                  className="ui-field bg-background font-mono"
                />
                {submissionStatus === 'Returned for Correction' && (
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    ✓ Rectified: Safety compliant laboratories (12) now ≤ Total practical laboratories (12).
                  </p>
                )}
              </div>
            </div>
      </Modal>
    </div>
  );
};

export default InstitutionLandingPage;
