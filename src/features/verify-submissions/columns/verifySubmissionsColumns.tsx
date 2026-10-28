import { Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ActionIcon } from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { SubmissionVerificationRecord } from '../types/verifySubmissions.types';

export interface VerifySubmissionsColumnCallbacks {
  onVerify: (record: SubmissionVerificationRecord) => void;
}

export const getVerifySubmissionsColumns = ({
  onVerify,
}: VerifySubmissionsColumnCallbacks): Column<SubmissionVerificationRecord>[] => [
  {
    id: 'institutionCode',
    header: 'Code',
    accessor: (r) => r.institutionCode,
    width: 'w-24',
    cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.institutionCode}</span>,
  },
  {
    id: 'institutionName',
    header: 'Institution Name',
    accessor: (r) => r.institutionName,
    cell: (r) => (
      <span className="font-medium text-foreground text-xs line-clamp-1 block" title={r.institutionName}>
        {r.institutionName}
      </span>
    ),
  },
  {
    id: 'receivedOn',
    header: 'Received On',
    accessor: (r) => r.receivedOn,
    width: 'w-28',
    cell: (r) => <span className="text-xs text-foreground">{r.receivedOn}</span>,
  },
  {
    id: 'source',
    header: 'Source',
    accessor: (r) => r.source,
    width: 'w-24',
    cell: (r) => (
      <span className="text-xs font-medium text-foreground">
        {r.source}
      </span>
    ),
  },
  {
    id: 'flags',
    header: 'Validation Flags',
    width: 'w-32',
    cell: (r) => {
      if (r.flagsCount === 0) {
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={13} /> Clean
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
          <AlertTriangle size={13} /> {r.flagsCount} Flag{r.flagsCount > 1 ? 's' : ''}
        </span>
      );
    },
  },
  {
    id: 'level',
    header: 'Current Level',
    accessor: (r) => r.currentLevel,
    width: 'w-36',
    cell: (r) => <span className="text-xs font-medium text-foreground">{r.currentLevel}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (r) => r.status,
    width: 'w-28',
    cell: (r) => (
      <span className="text-xs font-medium text-foreground capitalize">
        {r.status}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Action',
    width: 'w-16',
    align: 'center',
    cell: (r) => (
      <ActionIcon
        tone="primary"
        icon={Eye}
        label="View & Verify Submission"
        onClick={() => onVerify(r)}
      />
    ),
  },
];
