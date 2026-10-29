import { Download, FileText, FileSpreadsheet, FileCheck } from 'lucide-react';
import { ActionIcon, Badge, type BadgeTone } from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { InterfaceDownloadItem } from '../types/dedicatedInterface.types';

const FORMAT_BADGE: Record<InterfaceDownloadItem['format'], { label: string; tone: BadgeTone; icon: typeof FileText }> = {
  PDF: { label: 'PDF', tone: 'danger', icon: FileText },
  XLSX: { label: 'Excel', tone: 'success', icon: FileSpreadsheet },
  DOCX: { label: 'Word', tone: 'info', icon: FileCheck },
};

export interface LandingDownloadsColumnCallbacks {
  onDownload: (doc: InterfaceDownloadItem) => void;
}

/** Reference documents and prescribed formats on the institution landing page. */
export const getLandingDownloadsColumns = ({
  onDownload,
}: LandingDownloadsColumnCallbacks): Column<InterfaceDownloadItem>[] => [
  {
    id: 'fileName',
    header: 'Document',
    accessor: (d) => d.fileName,
    cell: (d) => (
      <span className="text-xs font-medium text-foreground truncate block max-w-80" title={d.fileName}>
        {d.fileName}
      </span>
    ),
  },
  {
    id: 'format',
    header: 'Format',
    accessor: (d) => FORMAT_BADGE[d.format].label,
    width: 'w-28',
    cell: (d) => {
      const { label, tone, icon } = FORMAT_BADGE[d.format];
      return <Badge tone={tone} icon={icon}>{label}</Badge>;
    },
  },
  {
    id: 'fileSize',
    header: 'Size',
    accessor: (d) => d.fileSize,
    width: 'w-24',
    cell: (d) => <span className="text-xs text-foreground">{d.fileSize}</span>,
  },
  {
    id: 'actions',
    header: 'Action',
    width: 'w-20',
    align: 'center',
    hideable: false,
    cell: (d) => (
      <ActionIcon tone="primary" icon={Download} label={`Download ${d.fileName}`} onClick={() => onDownload(d)} />
    ),
  },
];
