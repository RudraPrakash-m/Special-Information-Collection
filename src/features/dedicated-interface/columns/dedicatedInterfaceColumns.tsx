import { Edit2, Trash2, ExternalLink, Copy } from 'lucide-react';
import { ActionIcon } from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { DedicatedInterfaceConfig } from '../types/dedicatedInterface.types';

export interface DedicatedInterfaceColumnCallbacks {
  onEdit: (record: DedicatedInterfaceConfig) => void;
  onDelete: (id: string) => void;
  onCopyLink: (record: DedicatedInterfaceConfig) => void;
  onPreview: (linkName: string) => void;
}

export const getDedicatedInterfaceColumns = ({
  onEdit,
  onDelete,
  onCopyLink,
  onPreview,
}: DedicatedInterfaceColumnCallbacks): Column<DedicatedInterfaceConfig>[] => [
  {
    id: 'slNo',
    header: 'Sl. No',
    width: 'w-16',
    cell: (_r, idx) => (
      <span className="text-xs text-muted-foreground block text-center">
        {idx !== undefined ? idx + 1 : 1}
      </span>
    ),
  },
  {
    id: 'collection',
    header: 'Collection',
    accessor: (r) => r.collectionTitle,
    cell: (r) => (
      <span className="text-xs font-medium text-foreground block truncate max-w-xs" title={r.collectionTitle}>
        {r.collectionTitle}
      </span>
    ),
  },
  {
    id: 'linkName',
    header: 'Link Name',
    accessor: (r) => r.linkName,
    width: 'w-48',
    cell: (r) => (
      <span className="text-xs font-mono text-primary font-medium">
        /{r.linkName}
      </span>
    ),
  },
  {
    id: 'pageHeading',
    header: 'Page Heading',
    accessor: (r) => r.pageHeading,
    cell: (r) => (
      <span className="text-xs text-foreground truncate block max-w-sm" title={r.pageHeading}>
        {r.pageHeading}
      </span>
    ),
  },
  {
    id: 'downloads',
    header: 'Downloads',
    width: 'w-36',
    cell: (r) => (
      <span className="text-xs text-foreground truncate block">
        {r.downloadFileName || 'None'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: 'w-24',
    cell: (r) => (
      <span className="text-xs font-medium text-foreground capitalize">
        {r.status}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    width: 'w-40',
    cell: (r) => (
      <div className="flex items-center gap-1">
        <ActionIcon
          tone="info"
          icon={ExternalLink}
          label="Preview Landing Portal"
          onClick={() => onPreview(r.linkName)}
        />
        <ActionIcon
          tone="secondary"
          icon={Copy}
          label="Copy Link"
          onClick={() => onCopyLink(r)}
        />
        <ActionIcon
          tone="warning"
          icon={Edit2}
          label="Edit Interface"
          onClick={() => onEdit(r)}
        />
        <ActionIcon
          tone="danger"
          icon={Trash2}
          label="Delete Interface"
          onClick={() => onDelete(r.id)}
        />
      </div>
    ),
  },
];
