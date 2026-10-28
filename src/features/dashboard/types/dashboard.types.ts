export interface DashboardKpi {
  id: string;
  label: string;
  value: string | number;
  note: string;
  change?: string;
  isPositive?: boolean;
}

export interface ActivityItem {
  id: string;
  date: string;
  title: string;
  category: string;
  status: 'Completed' | 'Pending' | 'In Progress' | 'Cancelled';
}

export interface DashboardFilterFormData {
  keyword?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

