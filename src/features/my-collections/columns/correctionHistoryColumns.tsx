import { Badge, type BadgeTone } from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { SubmissionHistory } from '../types/myCollections.types';

const STATUS_TONE: Record<string, BadgeTone> = {
  Submitted: 'info',
  Resubmitted: 'info',
  'Returned for Correction': 'warning',
  'Under Verification': 'info',
  Approved: 'success',
  Rejected: 'danger',
};

/** Correction & verification history of a submission (SRS 1.5 Correction History). */
export const getCorrectionHistoryColumns = (): Column<SubmissionHistory>[] => [
  {
    id: 'version',
    header: 'Version',
    width: 'w-20',
    accessor: (r) => r.version,
    cell: (r) => <span className="text-xs font-semibold text-foreground">v{r.version}</span>,
  },
  {
    id: 'date',
    header: 'Date',
    width: 'w-28',
    accessor: (r) => r.date,
    sortable: true,
  },
  {
    id: 'user',
    header: 'User',
    accessor: (r) => r.user,
  },
  {
    id: 'status',
    header: 'Status',
    width: 'w-44',
    accessor: (r) => r.status,
    cell: (r) => (
      <Badge tone={STATUS_TONE[r.status] ?? 'neutral'} size="sm" dot>
        {r.status}
      </Badge>
    ),
  },
  {
    id: 'remarks',
    header: 'Remarks',
    accessor: (r) => r.remarks,
  },
];
