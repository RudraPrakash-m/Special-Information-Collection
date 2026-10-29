import { Eye, FileEdit, ExternalLink } from 'lucide-react';
import { ActionIcon } from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { MyCollectionItem } from '../types/myCollections.types';

export interface MyCollectionsColumnCallbacks {
  onOpen: (slug: string) => void;
  onCorrect: (item: MyCollectionItem) => void;
  onViewDetails: (item: MyCollectionItem) => void;
}

export const getMyCollectionsColumns = ({
  onOpen,
  onCorrect,
  onViewDetails,
}: MyCollectionsColumnCallbacks): Column<MyCollectionItem>[] => [
  {
    id: 'collectionTitle',
    header: 'Collection Title',
    accessor: (r) => r.collectionTitle,
    cell: (r) => (
      <span className="text-xs font-medium text-foreground line-clamp-1 block" title={r.collectionTitle}>
        {r.collectionTitle}
      </span>
    ),
  },
  {
    id: 'cycle',
    header: 'Cycle',
    width: 'w-36',
    accessor: (r) => r.cycle,
    cell: (r) => <span className="text-xs text-foreground">{r.cycle}</span>,
  },
  {
    id: 'dueDate',
    header: 'Due Date',
    width: 'w-28',
    accessor: (r) => r.dueDate,
    cell: (r) => <span className="text-xs text-foreground">{r.dueDate}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    width: 'w-36',
    accessor: (r) => r.status,
    cell: (r) => (
      <span className="text-xs font-medium text-foreground capitalize">
        {r.status}
      </span>
    ),
  },
  {
    id: 'remarks',
    header: 'Verifier Remarks',
    accessor: (r) => r.verifierRemarks || '—',
    cell: (r) => (
      <span className="text-xs text-muted-foreground line-clamp-1 block max-w-sm" title={r.verifierRemarks}>
        {r.verifierRemarks || '—'}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    width: 'w-32',
    cell: (r) => (
      <div className="flex items-center gap-1">
        <ActionIcon
          tone="primary"
          icon={Eye}
          label="View Details"
          onClick={() => onViewDetails(r)}
        />

        <ActionIcon
          tone="info"
          icon={ExternalLink}
          label={r.dedicatedSlug ? 'Open Dedicated Portal' : 'Open Dedicated Portal (no dedicated link)'}
          disabled={!r.dedicatedSlug}
          onClick={() => onOpen(r.dedicatedSlug)}
        />

        <ActionIcon
          tone="warning"
          icon={FileEdit}
          label={
            r.status === 'Returned for Correction'
              ? 'Correct Submission'
              : 'Correct Submission (Returned for Correction only)'
          }
          disabled={r.status !== 'Returned for Correction'}
          onClick={() => onCorrect(r)}
        />
      </div>
    ),
  },
];
