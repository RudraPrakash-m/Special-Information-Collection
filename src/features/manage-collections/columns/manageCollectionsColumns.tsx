import { Copy, Check } from 'lucide-react';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { InformationCollectionRecord } from '../types/manageCollections.types';
import CollectionStatusBadge from '../components/CollectionStatusBadge';
import CollectionActionDropdown from '../components/CollectionActionDropdown';

export interface ManageCollectionsColumnCallbacks {
  onView: (record: InformationCollectionRecord) => void;
  onEdit: (record: InformationCollectionRecord) => void;
  onPublish: (record: InformationCollectionRecord) => void;
  onDelete: (id: string) => void;
  onExtend: (record: InformationCollectionRecord) => void;
  onCycles: (record: InformationCollectionRecord) => void;
  onModify: (record: InformationCollectionRecord) => void;
  onNewVersion: (record: InformationCollectionRecord) => void;
  onClose: (record: InformationCollectionRecord) => void;
  onDuplicate: (record: InformationCollectionRecord) => void;
  onHistory: (record: InformationCollectionRecord) => void;
  onRules: (id: string) => void;
  onInterface: (id: string) => void;
  onCopyLink: (record: InformationCollectionRecord) => void;
  copiedId: string | null;
}

export const getManageCollectionsColumns = ({
  onView,
  onEdit,
  onPublish,
  onDelete,
  onExtend,
  onCycles,
  onModify,
  onNewVersion,
  onClose,
  onDuplicate,
  onHistory,
  onRules,
  onInterface,
  onCopyLink,
  copiedId,
}: ManageCollectionsColumnCallbacks): Column<InformationCollectionRecord>[] => [
  {
    id: 'id',
    header: 'Collection ID',
    accessor: (r) => r.id,
    width: 'w-28',
    cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.id}</span>,
  },
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
    id: 'linkedSurvey',
    header: 'Linked Survey',
    accessor: (r) => r.surveyTitle,
    width: 'w-44',
    cell: (r) => (
      <span className="text-xs text-foreground line-clamp-1 block" title={r.surveyTitle}>
        {r.surveyTitle}
      </span>
    ),
  },
  {
    id: 'frequency',
    header: 'Frequency',
    accessor: (r) => r.frequency,
    width: 'w-28',
    cell: (r) => <span className="capitalize text-xs text-foreground">{r.frequency}</span>,
  },
  {
    id: 'dueDate',
    header: 'Due Date',
    accessor: (r) => r.dueDate || '—',
    width: 'w-28',
    cell: (r) => <span className="text-xs text-foreground">{r.dueDate || '—'}</span>,
  },
  {
    id: 'submissions',
    header: 'Submissions',
    width: 'w-28',
    cell: (r) => {
      const assigned = r.assignedCount || 64;
      const approved = r.approvedCount || 0;
      return (
        <span className="text-xs text-foreground">
          {approved} / {assigned}
        </span>
      );
    },
  },
  {
    id: 'dedicatedLink',
    header: 'Dedicated Link',
    width: 'w-36',
    cell: (r) => {
      const isPublished = r.status === 'Published' || r.status === 'Active';
      if (!isPublished) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      const isCopied = copiedId === r.id;
      const slug = r.dedicatedSlug || r.id.toLowerCase();
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-mono text-xs text-foreground truncate max-w-[110px]">/{slug}</span>
          <button
            type="button"
            onClick={() => onCopyLink(r)}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Copy dedicated link"
          >
            {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          </button>
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (r) => r.status,
    width: 'w-24',
    cell: (r) => <CollectionStatusBadge status={r.status} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    width: 'w-56',
    cell: (r) => (
      <CollectionActionDropdown
        record={r}
        onView={() => onView(r)}
        onEdit={() => onEdit(r)}
        onPublish={() => onPublish(r)}
        onDelete={() => onDelete(r.id)}
        onExtend={() => onExtend(r)}
        onCycles={() => onCycles(r)}
        onModify={() => onModify(r)}
        onNewVersion={() => onNewVersion(r)}
        onClose={() => onClose(r)}
        onDuplicate={() => onDuplicate(r)}
        onHistory={() => onHistory(r)}
        onRules={() => onRules(r.id)}
        onInterface={() => onInterface(r.id)}
      />
    ),
  },
];
