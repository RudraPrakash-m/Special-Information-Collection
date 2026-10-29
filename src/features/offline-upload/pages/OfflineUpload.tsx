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
import { FormGenerator, SearchableSelect, UploadFile, type FormField } from '@/shared/components/ui/Forms';
import formFieldsJson from '../form-config/offlineUploadForm.json';
import { FieldInfoTooltip } from '../components/FieldInfoTooltip';
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
  const [formKey, setFormKey] = useState<number>(0);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<ValidationReportRow[] | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState<boolean>(false);

  const selectedCollection = useMemo(
    () => ELIGIBLE_COLLECTIONS.find((c) => c.id === formData.collectionId),
    [formData.collectionId]
  );
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
      toast.error(valResult.error || 'Please fill in all mandatory fields.');
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
    setFormData((prev) => ({
      ...prev,
      excelFile: null,
      scannedLetter: null,
    }));
    setFormKey((k) => k + 1);
  };

  const handleReset = () => {
    setFormData({
      collectionId: '',
      excelFile: null,
      scannedLetter: null,
    });
    setFormKey((k) => k + 1);
    setValidationReport(null);
    toast.info('Form cleared.');
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

  // Map 4 fields placed side by side in ONE single row
  const dynamicFormFields: FormField[] = useMemo(() => {
    return (formFieldsJson as FormField[]).map((field) => {
      // 1. Collection & Closed Cycle (Col 1 of single row)
      if (field.name === 'collectionId') {
        return {
          ...field,
          placeholder: '',
          render: (value: any, onChange: (val: any) => void, error?: string) => (
            <div className="w-full col-span-1">
              <FieldInfoTooltip
                label="Collection & Closed Cycle"
                required={true}
                tooltipText="Lists collections with Allow Offline Upload enabled whose cycle survey is closed."
              />
              <SearchableSelect
                options={COLLECTION_OPTIONS}
                value={value ?? ''}
                onChange={(val) => {
                  const strVal = String(val);
                  onChange(strVal);
                  setFormData((prev) => ({ ...prev, collectionId: strVal }));
                }}
                placeholder="- Select -"
                error={error}
              />
            </div>
          ),
        };
      }

      // 2. Prescribed Excel Template (Col 2 of single row)
      if (field.name === 'template') {
        return {
          ...field,
          render: () => (
            <div className="w-full col-span-1">
              <FieldInfoTooltip
                label="Prescribed Excel Template"
                tooltipText={`Pre-populated official template with ${selectedCollection?.pendingDefaulters ?? 16} institutions with status Not Submitted and validation rules as notes.`}
              />
              <Button
                type="button"
                variant="outline"
                leftIcon={Download}
                onClick={handleDownloadTemplate}
                className="w-full h-[36px] justify-center text-xs font-semibold"
              >
                Download Template (.xlsx)
              </Button>
            </div>
          ),
        };
      }

      // 3. Filled Excel File (.xlsx) (Col 3 of single row)
      if (field.name === 'excelFile') {
        return {
          ...field,
          render: (value: any, onChange: (val: any) => void, error?: string) => (
            <div className="w-full col-span-1">
              <FieldInfoTooltip
                label="Filled Excel File (.xlsx)"
                required={true}
                tooltipText="Select .xlsx file (max 10 MB). Upload completed offline Excel submission workbook."
              />
              <UploadFile
                value={value}
                onChange={(file) => {
                  onChange(file);
                  setFormData((prev) => ({ ...prev, excelFile: file }));
                }}
                accept=".xlsx"
                error={error}
              />
            </div>
          ),
        };
      }

      // 4. Scanned Supporting Letter / Format (.pdf) (Col 4 of single row)
      if (field.name === 'scannedLetter') {
        return {
          ...field,
          render: (value: any, onChange: (val: any) => void, error?: string) => (
            <div className="w-full col-span-1">
              <FieldInfoTooltip
                label="Scanned Supporting Letter / Format"
                required={true}
                tooltipText="Select official PDF copy (max 20 MB). Upload scanned copy of forwarding letter or physical format."
              />
              <UploadFile
                value={value}
                onChange={(file) => {
                  onChange(file);
                  setFormData((prev) => ({ ...prev, scannedLetter: file }));
                }}
                accept=".pdf"
                error={error}
              />
            </div>
          ),
        };
      }

      return field;
    });
  }, [selectedCollection, handleDownloadTemplate]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Offline Information Upload"
        breadcrumbs={[{ label: 'Offline Upload' }]}
      />

      {/* MAIN UPLOAD CONFIGURATION CARD: All fields in ONE single row */}
      <Card title="Upload Configuration & Supporting Documents">
        <form onSubmit={(e) => { e.preventDefault(); handleValidate(); }}>
          <FormGenerator
            key={formKey}
            fields={dynamicFormFields}
            defaultValues={formData}
            onValuesChange={(vals) => setFormData((prev) => ({ ...prev, ...vals }))}
            onSubmit={handleValidate}
            standalone={true}
            className="!grid-cols-1 md:!grid-cols-4 lg:!grid-cols-4"
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
              type="submit"
              variant="primary"
              leftIcon={Upload}
              loading={isValidating}
            >
              Validate & Preview
            </Button>
          </div>
        </form>
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

          {/* VALIDATION REPORT DATA TABLE inside Card */}
          <Card title="Validation Report (Row-by-Row Result)">
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
          </Card>
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
