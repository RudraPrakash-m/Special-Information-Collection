import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  Users,
  Clock,
  Download,
  Send,
  Bell,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Button, DataTable, FilterPanel, KpiCard, KpiGrid } from '@/shared/components/ui';
import type { PendingVerificationItem, DefaulterItem } from '../types/monitoring.types';
import {
  getPendingVerificationColumns,
  getDefaulterColumns,
} from '../columns/monitoringColumns';
import { validateReminderNotification } from '../validation/monitoringValidation';

const INITIAL_PENDING_LIST: PendingVerificationItem[] = [
  {
    id: 'PV-01',
    institutionCode: 'C-39512',
    institutionName: 'BJB Autonomous College, Bhubaneswar',
    district: 'Khordha',
    currentStage: 'Returned for Correction (With Institution)',
    assignedVerifier: 'College Admin Action Needed',
    daysPending: 4,
    isOverdue: false,
  },
  {
    id: 'PV-02',
    institutionCode: 'C-41208',
    institutionName: 'Dhenkanal Autonomous College, Dhenkanal',
    district: 'Dhenkanal',
    currentStage: 'Returned for Correction (With Institution)',
    assignedVerifier: 'College Admin Action Needed',
    daysPending: 9,
    isOverdue: true,
  },
  {
    id: 'PV-03',
    institutionCode: 'C-39544',
    institutionName: 'RD Women’s University Affiliated College',
    district: 'Khordha',
    currentStage: 'Level 1: Verification Officer Scrutiny',
    assignedVerifier: 'Dr. Ananya Mohapatra',
    daysPending: 2,
    isOverdue: false,
  },
  {
    id: 'PV-04',
    institutionCode: 'C-39820',
    institutionName: 'Stewart Science College, Cuttack',
    district: 'Cuttack',
    currentStage: 'Level 2: Final Approval',
    assignedVerifier: 'Smt. Pravasini Nayak',
    daysPending: 3,
    isOverdue: false,
  },
];

const INITIAL_DEFAULTER_LIST: DefaulterItem[] = [
  {
    id: 'DEF-01',
    institutionCode: 'C-42001',
    institutionName: 'Prananath Autonomous College, Khordha',
    district: 'Khordha',
    institutionType: 'Government Autonomous',
    dueDate: '2026-11-20',
    daysOverdue: 6,
    missedCycles: 1,
    lastReminderSent: '2026-11-22',
  },
  {
    id: 'DEF-02',
    institutionCode: 'C-42350',
    institutionName: 'Banki Autonomous College, Banki',
    district: 'Cuttack',
    institutionType: 'Aided Degree College',
    dueDate: '2026-11-20',
    daysOverdue: 6,
    missedCycles: 2,
    lastReminderSent: '2026-11-21',
  },
  {
    id: 'DEF-03',
    institutionCode: 'C-43110',
    institutionName: 'Vyasanagar Autonomous College, Jajpur',
    district: 'Jajpur',
    institutionType: 'Government Autonomous',
    dueDate: '2026-11-20',
    daysOverdue: 6,
    missedCycles: 1,
  },
  {
    id: 'DEF-04',
    institutionCode: 'C-44580',
    institutionName: 'Nimapara Autonomous College, Puri',
    district: 'Puri',
    institutionType: 'Aided Degree College',
    dueDate: '2026-11-20',
    daysOverdue: 6,
    missedCycles: 3,
    lastReminderSent: '2026-11-18',
  },
];

export const CollectionMonitoring: React.FC = () => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('IC-2026-001');
  const [selectedCycle, setSelectedCycle] = useState<string>('Cycle 1 - Nov 2026');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedInstitutionType, setSelectedInstitutionType] = useState<string>('all');
  const [selectedDefaulterIds, setSelectedDefaulterIds] = useState<string[]>([]);
  const [isFilterHidden, setIsFilterHidden] = useState<boolean>(false);

  const appliedFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCollectionId !== 'IC-2026-001') count++;
    if (selectedCycle !== 'Cycle 1 - Nov 2026') count++;
    if (selectedDistrict !== 'all') count++;
    if (selectedInstitutionType !== 'all') count++;
    return count;
  }, [selectedCollectionId, selectedCycle, selectedDistrict, selectedInstitutionType]);

  const handleResetFilters = () => {
    setSelectedCollectionId('IC-2026-001');
    setSelectedCycle('Cycle 1 - Nov 2026');
    setSelectedDistrict('all');
    setSelectedInstitutionType('all');
    toast.info('Filters reset.');
  };

  // Monitoring Metrics per SRS
  const assigned = 64;
  const received = 48;
  const approved = 42;
  const responseRate = ((received / assigned) * 100).toFixed(1);

  const handleSendReminder = (target: 'selected' | 'all') => {
    if (target === 'selected') {
      const validation = validateReminderNotification({ targetIds: selectedDefaulterIds });
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
    }
    const count = target === 'selected' ? selectedDefaulterIds.length : INITIAL_DEFAULTER_LIST.length;
    toast.success(
      `Official reminder with dedicated portal link dispatched via Email & SMS to ${count} defaulting institution(s).`
    );
    setSelectedDefaulterIds([]);
  };

  const pendingColumns = useMemo(() => getPendingVerificationColumns(), []);

  const defaulterColumns = useMemo(
    () =>
      getDefaulterColumns({
        selectedDefaulters: selectedDefaulterIds,
        onToggleSelect: (id, checked) => {
          if (checked) setSelectedDefaulterIds((prev) => [...prev, id]);
          else setSelectedDefaulterIds((prev) => prev.filter((item) => item !== id));
        },
        onSendSingleReminder: (item) => {
          toast.success(`Reminder notice dispatched to ${item.institutionName}.`);
        },
      }),
    [selectedDefaulterIds]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Collection Monitoring"
        breadcrumbs={[{ label: 'Monitoring' }]}
      />

      {/* KPI METRICS (Matching Dashboard Style) */}
      <KpiGrid>
        <KpiCard
          label="Total Assigned"
          value={String(assigned)}
          note="Target Institutions"
          icon={Users}
        />
        <KpiCard
          label="Submissions Received"
          value={`${received} (${responseRate}%)`}
          note={`${approved} approved`}
          icon={Activity}
        />
        <KpiCard
          label="Under Verification"
          value="18"
          note="Pending scrutiny"
          icon={CheckCircle2}
        />
        <KpiCard
          label="Defaulting Institutions"
          value="16"
          note="Passed deadline without submission"
          icon={Clock}
        />
      </KpiGrid>

      {/* FILTER PANEL (Collapsible with saffron edge strip) */}
      <FilterPanel
        title="Filter Monitoring Data"
        hidden={isFilterHidden}
        onHiddenChange={setIsFilterHidden}
        appliedCount={appliedFilterCount}
        floatingButton={false}
        onSubmit={() => {}}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={RotateCcw}
            onClick={handleResetFilters}
            className="h-[34px]"
          >
            Reset Filters
          </Button>
        }
      >
        <div className="min-w-56 flex-1">
          <label className="text-xs font-semibold text-foreground block mb-1">
            Collection
          </label>
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="ui-field text-xs w-full h-[34px]"
          >
            <option value="IC-2026-001">IC-2026-001 — Lab Equipment Census</option>
            <option value="IC-2026-003">IC-2026-003 — Faculty Census 2026</option>
            <option value="IC-2026-004">IC-2026-004 — SRLUG Audit 2026</option>
          </select>
        </div>

        <div className="min-w-44 flex-1">
          <label className="text-xs font-semibold text-foreground block mb-1">Cycle</label>
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="ui-field text-xs w-full h-[34px]"
          >
            <option value="Cycle 1 - Nov 2026">Cycle 1 - Nov 2026 (Active)</option>
            <option value="Cycle 2 - AY 2026-27">Cycle 2 - AY 2026-27</option>
          </select>
        </div>

        <div className="min-w-40 flex-1">
          <label className="text-xs font-semibold text-foreground block mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="ui-field text-xs w-full h-[34px]"
          >
            <option value="all">All Districts (30)</option>
            <option value="Khordha">Khordha</option>
            <option value="Cuttack">Cuttack</option>
            <option value="Jajpur">Jajpur</option>
            <option value="Puri">Puri</option>
          </select>
        </div>

        <div className="min-w-48 flex-1">
          <label className="text-xs font-semibold text-foreground block mb-1">Institution Type</label>
          <select
            value={selectedInstitutionType}
            onChange={(e) => setSelectedInstitutionType(e.target.value)}
            className="ui-field text-xs w-full h-[34px]"
          >
            <option value="all">All Institution Types</option>
            <option value="Government Autonomous">Government Autonomous</option>
            <option value="Aided Degree College">Aided Degree College</option>
            <option value="State University">State University</option>
          </select>
        </div>
      </FilterPanel>

      {/* SECTION 1: PENDING AT VERIFICATION / CORRECTION TABLE inside Card */}
      <Card title="Submissions Pending at Verification / Correction">
        <DataTable
          caption="Submissions Pending at Verification / Correction"
          data={INITIAL_PENDING_LIST}
          columns={pendingColumns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search pending institutions..."
          filterToggle={{
            hidden: isFilterHidden,
            onToggle: () => setIsFilterHidden((prev) => !prev),
            appliedCount: appliedFilterCount,
          }}
        />
      </Card>

      {/* SECTION 2: DEFAULTER LIST TABLE inside Card */}
      <Card title="Defaulting Institutions (Missed Due Date)">
        <DataTable
          caption="Defaulting Institutions (Missed Due Date)"
          data={INITIAL_DEFAULTER_LIST}
          columns={defaulterColumns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search defaulters by name or AISHE..."
          filterToggle={{
            hidden: isFilterHidden,
            onToggle: () => setIsFilterHidden((prev) => !prev),
            appliedCount: appliedFilterCount,
          }}
          cardActions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="warning"
                size="sm"
                icon={<Send size={13} />}
                className="!bg-[#f59f0a] hover:!bg-[#d97706] text-white border-none shadow-xs"
                onClick={() => handleSendReminder('selected')}
                disabled={selectedDefaulterIds.length === 0}
              >
                Send Reminder to Selected ({selectedDefaulterIds.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Bell size={13} />}
                onClick={() => handleSendReminder('all')}
              >
                Send Reminder to All Pending Defaulters
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={13} />}
                onClick={() => toast.success('Exporting defaulter list to Excel / PDF...')}
              >
                Export Report
              </Button>
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default CollectionMonitoring;

