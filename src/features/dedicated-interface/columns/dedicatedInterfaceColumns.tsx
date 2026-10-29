import { Edit2, Trash2, ExternalLink, Copy } from 'lucide-react';
import { ActionIcon, Badge, type BadgeTone } from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { CollectionStatus } from '@/features/manage-collections/types/manageCollections.types';
import {
  getLinkStatus,
  type DedicatedInterfaceConfig,
  type LinkStatus,
} from '../types/dedicatedInterface.types';

const LINK_STATUS_TONE: Record<LinkStatus, BadgeTone> = {
  Active: 'success',
  Inactive: 'warning',
  Closed: 'neutral',
};

export const LINK_STATUS_HINT: Record<LinkStatus, string> = {
  Active: 'Link is active: the collection is published.',
  Inactive: 'Activates when the collection is published.',
  Closed: 'Collection is closed.',
};

export interface DedicatedInterfaceColumnCallbacks {
  onEdit: (record: DedicatedInterfaceConfig) => void;
  onDelete: (id: string) => void;
  onCopyLink: (record: DedicatedInterfaceConfig) => void;
  onPreview: (linkName: string) => void;
  /** Status of the linked collection; the link status follows it. */
  getCollectionStatus: (collectionId: string) => CollectionStatus | undefined;
}

export const getDedicatedInterfaceColumns = ({
  onEdit,
  onDelete,
  onCopyLink,
  onPreview,
  getCollectionStatus,
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
    id: 'linkStatus',
    header: 'Link Status',
    width: 'w-28',
    accessor: (r) => getLinkStatus(getCollectionStatus(r.collectionId)),
    cell: (r) => {
      const status = getLinkStatus(getCollectionStatus(r.collectionId));
      return (
        <Badge tone={LINK_STATUS_TONE[status]} size="sm" dot title={LINK_STATUS_HINT[status]}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    width: 'w-40',
    cell: (r) => {
      const linkActive = getLinkStatus(getCollectionStatus(r.collectionId)) === 'Active';
      return (
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
          label={linkActive ? 'Copy Link' : 'Copy Link (link is active after the collection is published)'}
          disabled={!linkActive}
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
      );
    },
  },
];
