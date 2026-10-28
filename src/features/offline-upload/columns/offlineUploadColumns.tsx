import { CheckCircle2, XCircle } from 'lucide-react';
import type { Column } from '@/shared/components/ui/Table/DataTable';

export interface ValidationReportRow {
  rowNumber: number;
  institutionCode: string;
  institutionName: string;
  district: string;
  status: 'Valid' | 'Error';
  errorDetails?: string;
}

export const getOfflineUploadColumns = (): Column<ValidationReportRow>[] => [
  {
    id: 'rowNumber',
    header: 'Row #',
    accessor: (r) => `Row ${r.rowNumber}`,
    width: 'w-20',
    cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.rowNumber}</span>,
  },
  {
    id: 'institutionCode',
    header: 'Institution Code',
    accessor: (r) => r.institutionCode,
    width: 'w-32',
    cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.institutionCode}</span>,
  },
  {
    id: 'institutionName',
    header: 'Institution Name',
    accessor: (r) => r.institutionName,
    cell: (r) => (
      <span className="text-xs font-medium text-foreground line-clamp-1 block" title={r.institutionName}>
        {r.institutionName}
      </span>
    ),
  },
  {
    id: 'district',
    header: 'District',
    accessor: (r) => r.district,
    width: 'w-28',
    cell: (r) => <span className="text-xs text-foreground">{r.district}</span>,
  },
  {
    id: 'status',
    header: 'Validation Result',
    accessor: (r) => r.status,
    width: 'w-32',
    cell: (r) =>
      r.status === 'Valid' ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
          <CheckCircle2 size={13} /> Valid Row
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
          <XCircle size={13} /> Error
        </span>
      ),
  },
  {
    id: 'errorDetails',
    header: 'Error Details / Rule Failure',
    accessor: (r) => r.errorDetails || '',
    cell: (r) =>
      r.errorDetails ? (
        <p className="text-xs text-rose-600 font-medium">
          {r.errorDetails}
        </p>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];
