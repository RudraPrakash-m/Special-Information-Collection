import { Bell } from 'lucide-react';
import { ActionIcon } from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/Table/DataTable';
import type { PendingVerificationItem, DefaulterItem } from '../types/monitoring.types';

export const getPendingVerificationColumns = (): Column<PendingVerificationItem>[] => [
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
    id: 'currentStage',
    header: 'Current Stage',
    accessor: (r) => r.currentStage,
    cell: (r) => <span className="text-xs text-foreground font-medium">{r.currentStage}</span>,
  },
  {
    id: 'verifier',
    header: 'Assigned Verifier',
    accessor: (r) => r.assignedVerifier,
    cell: (r) => <span className="text-xs text-muted-foreground">{r.assignedVerifier}</span>,
  },
  {
    id: 'daysPending',
    header: 'Pending Time',
    accessor: (r) => r.daysPending,
    width: 'w-28',
    cell: (r) => (
      <span className={`text-xs font-medium ${r.isOverdue ? 'text-rose-600 font-semibold' : 'text-foreground'}`}>
        {r.daysPending} days {r.isOverdue ? '(Delayed)' : ''}
      </span>
    ),
  },
];

export interface DefaulterColumnsCallbacks {
  selectedDefaulters: string[];
  onToggleSelect: (id: string, checked: boolean) => void;
  onSendSingleReminder: (item: DefaulterItem) => void;
  /** Reminders can be sent only while the selected cycle is open. */
  canSendReminder: boolean;
}

export const getDefaulterColumns = ({
  selectedDefaulters,
  onToggleSelect,
  onSendSingleReminder,
  canSendReminder,
}: DefaulterColumnsCallbacks): Column<DefaulterItem>[] => [
  {
    id: 'select',
    header: '',
    width: 'w-12',
    cell: (r) => (
      <input
        type="checkbox"
        checked={selectedDefaulters.includes(r.id)}
        onChange={(e) => onToggleSelect(r.id, e.target.checked)}
        className="rounded border-border"
      />
    ),
  },
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
    id: 'dueDate',
    header: 'Due Date',
    accessor: (r) => r.dueDate,
    width: 'w-28',
    cell: (r) => <span className="text-xs text-foreground">{r.dueDate}</span>,
  },
  {
    id: 'overdue',
    header: 'Days Overdue',
    accessor: (r) => r.daysOverdue,
    width: 'w-28',
    cell: (r) => (
      <span className="text-xs font-medium text-rose-600">
        +{r.daysOverdue} days
      </span>
    ),
  },
  {
    id: 'missedCycles',
    header: 'Missed Cycles',
    accessor: (r) => r.missedCycles,
    width: 'w-28',
    cell: (r) => (
      <span className="text-xs text-foreground">
        {r.missedCycles} cycle{r.missedCycles > 1 ? 's' : ''}
      </span>
    ),
  },
  {
    id: 'reminder',
    header: 'Last Reminder',
    accessor: (r) => r.lastReminderSent || 'Never',
    width: 'w-32',
    cell: (r) => (
      <span className="text-xs text-muted-foreground">
        {r.lastReminderSent || 'Never sent'}
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
        tone="warning"
        icon={Bell}
        label={canSendReminder ? 'Send Reminder Notice' : 'Send Reminder (cycle is not open)'}
        disabled={!canSendReminder}
        onClick={() => onSendSingleReminder(r)}
      />
    ),
  },
];
