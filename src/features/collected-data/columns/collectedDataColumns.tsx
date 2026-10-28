import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { ConsolidatedRow } from '../types/collectedData.types';

export const getConsolidatedDataColumns = (): Column<ConsolidatedRow>[] => [
  {
    id: 'institutionCode',
    header: 'AISHE Code',
    accessor: (r) => r.institutionCode,
    width: 'w-28',
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
    id: 'q2',
    header: 'Q2: Labs',
    accessor: (r) => r.q2_labs,
    width: 'w-24',
    cell: (r) => <span className="text-xs font-medium text-foreground">{r.q2_labs} labs</span>,
  },
  {
    id: 'q3',
    header: 'Q3: Units',
    accessor: (r) => r.q3_workstations,
    width: 'w-24',
    cell: (r) => <span className="text-xs font-medium text-foreground">{r.q3_workstations} units</span>,
  },
  {
    id: 'q4',
    header: 'Q4: Smart Class',
    accessor: (r) => r.q4_smartClass,
    width: 'w-28',
    cell: (r) => (
      <span className="text-xs font-medium text-foreground">
        {r.q4_smartClass}
      </span>
    ),
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
];
