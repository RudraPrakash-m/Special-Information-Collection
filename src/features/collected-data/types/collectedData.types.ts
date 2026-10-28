export interface ConsolidatedRow {
  id: string;
  institutionCode: string;
  institutionName: string;
  district: string;
  institutionType: string;
  source: 'Online' | 'Offline';
  status: 'Approved' | 'Finalised' | 'Received';
  q1_aishe: string;
  q2_labs: number;
  q3_workstations: number;
  q4_smartClass: string;
}

