import React from 'react';
import { Activity, CheckCircle2, Clock, Users } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/shared/components/ui';
import type { DashboardKpi } from '../types/dashboard.types';

interface DashboardKpiSectionProps {
  kpis: DashboardKpi[];
}

export const DashboardKpiSection: React.FC<DashboardKpiSectionProps> = ({ kpis }) => {
  const iconMap: Record<string, typeof Activity> = {
    '1': Users,
    '2': Activity,
    '3': CheckCircle2,
    '4': Clock,
  };

  return (
    <KpiGrid className="mb-6">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.id] || Activity;
        return (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value.toString()}
            note={kpi.note}
            icon={Icon}
          />
        );
      })}
    </KpiGrid>
  );
};

export default DashboardKpiSection;

