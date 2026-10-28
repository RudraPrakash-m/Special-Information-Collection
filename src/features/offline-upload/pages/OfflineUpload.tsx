import React, { useState, useMemo } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Button, DataTable, DialogModal } from '@/shared/components/ui';
import { FormGenerator, type FormField } from '@/shared/components/ui/Forms';
import formFieldsJson from '../form-config/offlineUploadForm.json';
import {
  getOfflineUploadColumns,
  type ValidationReportRow,
} from '../columns/offlineUploadColumns';
import { validateOfflineUpload } from '../validation/offlineUploadValidation';

interface OfflineUploadFormData {
  collectionId: string;
  excelFile: File | null;
  scannedLetter: File | null;
}

const INITIAL_FORM_DATA: OfflineUploadFormData = {
  collectionId: 'IC-2026-001',
  excelFile: null,
  scannedLetter: null,
};

// Eligible collections for offline upload (survey closed, allowOfflineUpload true)
const ELIGIBLE_COLLECTIONS = [
  {
    id: 'IC-2026-001',
    title: 'Quarterly Degree College Academic & Lab Equipment Census',
    cycle: 'Cycle 1 - Nov 2026',
    surveyStatus: 'Closed for Online Responses',
    pendingDefaulters: 16,
  },
  {
    id: 'IC-2026-004',
    title: 'State Research & Laboratory Upgrade Grant Utilisation Audit',
    cycle: 'Cycle 2 - AY 2026-27',
    surveyStatus: 'Closed for Online Responses',
    pendingDefaulters: 6,
  },
];

const COLLECTION_OPTIONS = ELIGIBLE_COLLECTIONS.map((col) => ({
  label: `${col.id} — ${col.title} (${col.cycle})`,
  value: col.id,
}));

export const OfflineUpload: React.FC = () => {
  const [formData, setFormData] = useState<OfflineUploadFormData>(INITIAL_FORM_DATA);
  // Bumped on reset so FormGenerator remounts with empty file inputs
  const [formKey, setFormKey] = useState<number>(0);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<ValidationReportRow[] | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState<boolean>(false);

  const selectedCollection = ELIGIBLE_COLLECTIONS.find((c) => c.id === formData.collectionId);
  const selectedCycle = selectedCollection?.cycle ?? '';
  const pdfFile = formData.scannedLetter;

  const handleDownloadTemplate = () => {
    if (!selectedCollection) {
      toast.error('Please select a collection first.');
      return;
    }
    toast.success(
      `Downloading official Excel template for ${selectedCycle} with ${selectedCollection.pendingDefaulters} pending defaulter institutions...`
    );
  };

  const handleValidate = () => {
    const valResult = validateOfflineUpload({
      collectionId: formData.collectionId,
      excelFile: formData.excelFile,
      scannedLetter: formData.scannedLetter,
    });
    if (!valResult.isValid) {
      toast.error(valResult.error || 'Please upload the required files.');
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      // Simulated row-wise validation results
      const mockReport: ValidationReportRow[] = [
        {
          rowNumber: 2,
          institutionCode: 'C-39512',
          institutionName: 'BJB Autonomous College, Bhubaneswar',
          district: 'Khordha',
          status: 'Valid',
        },
        {
          rowNumber: 3,
          institutionCode: 'C-39544',
          institutionName: 'RD Women’s University Affiliated College, Bhubaneswar',
          district: 'Khordha',
          status: 'Valid',
        },
        {
          rowNumber: 4,
          institutionCode: 'C-41208',
          institutionName: 'Dhenkanal Autonomous College, Dhenkanal',
          district: 'Dhenkanal',
          status: 'Error',
          errorDetails: 'Cross-Question Failure: Q3 Physics Workstations (18) exceeds lab instrument limit (10).',
        },
        {
          rowNumber: 5,
          institutionCode: 'C-39820',
          institutionName: 'Stewart Science College, Cuttack',
          district: 'Cuttack',
          status: 'Valid',
        },
        {
          rowNumber: 6,
          institutionCode: 'C-40112',
          institutionName: 'SCS Autonomous College, Puri',
          district: 'Puri',
          status: 'Error',
          errorDetails: 'Duplicate Submission: Institution has already submitted online on 2026-11-04.',
        },
        {
          rowNumber: 7,
          institutionCode: 'C-41550',
          institutionName: 'Kendrapara Autonomous College, Kendrapara',
          district: 'Kendrapara',
          status: 'Valid',
        },
      ];
      setValidationReport(mockReport);
      toast.info('Validation complete. Review the report below before importing.');
    }, 900);
  };

  const clearFiles = () => {
    setFormData((prev) => ({ ...prev, excelFile: null, scannedLetter: null }));
    setFormKey((k) => k + 1);
  };

  const handleReset = () => {
    clearFiles();
    setValidationReport(null);
  };

  const handleConfirmImport = () => {
    if (!validationReport) return;
    const validCount = validationReport.filter((r) => r.status === 'Valid').length;
    toast.success(
      `Successfully imported ${validCount} valid offline submissions! Marked as 'Offline' and queued for Level 1 verification.`
    );
    setIsImportConfirmOpen(false);
    setValidationReport(null);
    clearFiles();
  };

  const validRowsCount = validationReport?.filter((r) => r.status === 'Valid').length || 0;
  const errorRowsCount = validationReport?.filter((r) => r.status === 'Error').length || 0;

  const reportColumns = useMemo(() => getOfflineUploadColumns(), []);

  const formFields: FormField[] = (formFieldsJson as FormField[]).map((field) => {
    if (field.name === 'collectionId') {
      return { ...field, options: COLLECTION_OPTIONS };
    }

    // Template download is an action, not an input value
    if (field.name === 'template') {
      return {
        ...field,
        render: () => (
          <div className="col-span-12 sm:col-span-6">
            <span className="ui-label">{field.label}</span>
            <Button
              type="button"
              variant="outline"
              leftIcon={Download}
              onClick={handleDownloadTemplate}
              className="w-full justify-center"
            >
              Download Template (.xlsx)
            </Button>
            <p className="ui-help">
              Pre-populated with {selectedCollection?.pendingDefaulters ?? 0} institutions with status{' '}
              <em>Not Submitted</em> and validation rules as notes.
            </p>
          </div>
        ),
      };
    }

    return field;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Offline Information Upload"
        breadcrumbs={[{ label: 'Offline Upload' }]}
      />

      {/* MAIN UPLOAD CARD */}
      <Card title="Upload Configuration & Supporting Documents">
        <FormGenerator
          key={formKey}
          fields={formFields}
          defaultValues={formData}
          onValuesChange={(vals) => setFormData((prev) => ({ ...prev, ...vals }))}
          onSubmit={handleValidate}
          gridColumns={12}
        />

        {/* Action Button Bar: Inside Card at Bottom, Start Aligned */}
        <div className="flex items-center justify-start gap-3 pt-5 border-t border-border mt-6">
          <Button
            type="button"
            variant="outline"
            leftIcon={RotateCcw}
            onClick={handleReset}
          >
            Reset
          </Button>

          <Button
            type="button"
            variant="primary"
            leftIcon={Upload}
            loading={isValidating}
            onClick={handleValidate}
          >
            Validate & Preview
          </Button>
        </div>
      </Card>

      {/* VALIDATION REPORT SECTION */}
      {validationReport && (
        <div className="space-y-4">
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Rows Scanned</span>
              <p className="text-xl font-bold text-foreground mt-1">{validationReport.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Valid Rows Ready to Import</span>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{validRowsCount}</p>
            </div>
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 dark:bg-red-950/20 shadow-xs">
              <span className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase">Rows with Validation Errors</span>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{errorRowsCount}</p>
            </div>
          </div>

          {/* VALIDATION REPORT DATA TABLE (No Card) */}
          <DataTable
            caption="Validation Report (Row-by-Row Result)"
            data={validationReport}
            columns={reportColumns}
            rowKey={(r) => r.rowNumber.toString()}
            searchPlaceholder="Search institution or error details..."
            cardActions={
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Check size={14} />}
                  disabled={validRowsCount === 0}
                  onClick={() => setIsImportConfirmOpen(true)}
                >
                  Import {validRowsCount} Valid Rows
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download size={14} />}
                  onClick={() => toast.success('Exporting validation report to Excel...')}
                >
                  Download Report
                </Button>
              </div>
            }
          />
        </div>
      )}

      {/* IMPORT CONFIRMATION MODAL */}
      <DialogModal
        isOpen={isImportConfirmOpen}
        onClose={() => setIsImportConfirmOpen(false)}
        onConfirm={handleConfirmImport}
        title="Confirm Offline Submission Import"
        confirmText="Confirm Import"
        message={
          <div className="space-y-3">
            <p className="text-foreground">
              Are you sure you want to import <strong>{validRowsCount} valid institution submissions</strong> for{' '}
              <strong>{selectedCycle}</strong>?
            </p>
            <p>
              These records will be marked with source <strong>Offline</strong> and forwarded to the configured approval levels. The supporting letter <em>{pdfFile?.name}</em> will be linked as supporting proof.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default OfflineUpload;

