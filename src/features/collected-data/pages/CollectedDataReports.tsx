import React, { useState, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Download,
  FileText,
  Users,
  CheckCircle2,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card from '@/shared/components/layout/Card';
import { Button, DataTable, FilterPanel, Modal, DialogModal, Tabs, KpiCard, KpiGrid, type TabItem } from '@/shared/components/ui';
import { SearchableSelect } from '@/shared/components/ui/Forms';
import { FieldInfoTooltip } from '../components/FieldInfoTooltip';
import type { ConsolidatedRow } from '../types/collectedData.types';
import { getConsolidatedDataColumns } from '../columns/collectedDataColumns';
import { validateReopenDataset } from '../validation/collectedDataValidation';

const INITIAL_CONSOLIDATED_DATA: ConsolidatedRow[] = [
  {
    id: 'CR-01',
    institutionCode: 'C-39512',
    institutionName: 'BJB Autonomous College, Bhubaneswar',
    district: 'Khordha',
    institutionType: 'Government Autonomous',
    source: 'Online',
    status: 'Finalised',
    q1_aishe: 'C-39512',
    q2_labs: 8,
    q3_workstations: 8,
    q4_smartClass: 'Yes',
  },
  {
    id: 'CR-02',
    institutionCode: 'C-39544',
    institutionName: 'RD Women’s University Affiliated College',
    district: 'Khordha',
    institutionType: 'Constituent College',
    source: 'Online',
    status: 'Finalised',
    q1_aishe: 'C-39544',
    q2_labs: 6,
    q3_workstations: 6,
    q4_smartClass: 'Yes',
  },
  {
    id: 'CR-03',
    institutionCode: 'C-39820',
    institutionName: 'Stewart Science College, Cuttack',
    district: 'Cuttack',
    institutionType: 'Aided Degree College',
    source: 'Online',
    status: 'Finalised',
    q1_aishe: 'C-39820',
    q2_labs: 5,
    q3_workstations: 5,
    q4_smartClass: 'Partial',
  },
  {
    id: 'CR-04',
    institutionCode: 'C-41550',
    institutionName: 'Kendrapara Autonomous College',
    district: 'Kendrapara',
    institutionType: 'Government Autonomous',
    source: 'Offline',
    status: 'Finalised',
    q1_aishe: 'C-41550',
    q2_labs: 7,
    q3_workstations: 7,
    q4_smartClass: 'Yes',
  },
  {
    id: 'CR-05',
    institutionCode: 'C-41208',
    institutionName: 'Dhenkanal Autonomous College, Dhenkanal',
    district: 'Dhenkanal',
    institutionType: 'Government Autonomous',
    source: 'Offline',
    status: 'Approved',
    q1_aishe: 'C-41208',
    q2_labs: 9,
    q3_workstations: 8,
    q4_smartClass: 'No',
  },
];

const COLLECTION_CYCLE_OPTIONS = [
  {
    label: 'IC-2026-001 — Lab Equipment Census (Cycle 1 - Nov 2026)',
    value: 'IC-2026-001',
  },
  {
    label: 'IC-2026-004 — SRLUG Audit 2026 (Cycle 2 - AY 2026-27)',
    value: 'IC-2026-004',
  },
];

export const CollectedDataReports: React.FC = () => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('IC-2026-001');
  const [selectedCycle, setSelectedCycle] = useState<string>('Cycle 1 - Nov 2026');
  const [activeReportTab, setActiveReportTab] = useState<string>('consolidated');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [isFilterHidden, setIsFilterHidden] = useState<boolean>(true);

  const appliedFilterCount = useMemo(() => {
    let count = 0;
    if (selectedDistrict !== 'all') count++;
    return count;
  }, [selectedDistrict]);

  const handleResetFilters = () => {
    setSelectedDistrict('all');
    toast.info('Filters reset.');
  };

  // Finalisation state
  const [isFinalised, setIsFinalised] = useState<boolean>(true);
  const [finalisedInfo, setFinalisedInfo] = useState<{
    version: number;
    date: string;
    user: string;
  }>({
    version: 1,
    date: '2026-11-26',
    user: 'Dr. Sudhanshu Sekhar Mishra (Additional Secretary)',
  });

  // Modal states
  const [isFinaliseModalOpen, setIsFinaliseModalOpen] = useState<boolean>(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState<boolean>(false);
  const [reopenReason, setReopenReason] = useState<string>('');

  const reportTabs: TabItem[] = [
    { key: 'consolidated', label: 'Consolidated Data (Row per Institution)' },
    { key: 'summary', label: 'Summary Analytics (Aggregates & Averages)' },
    { key: 'comparison', label: 'Recurring Cycle Comparison' },
  ];

  const handleFinaliseDataset = () => {
    setIsFinalised(true);
    setFinalisedInfo({
      version: finalisedInfo.version,
      date: new Date().toISOString().split('T')[0],
      user: 'Dr. Sudhanshu Sekhar Mishra (Additional Secretary)',
    });
    setIsFinaliseModalOpen(false);
    toast.success(
      'Dataset locked successfully as the official departmental record with timestamp and digital signature.'
    );
  };

  const handleReopenDataset = () => {
    const valResult = validateReopenDataset({ reason: reopenReason });
    if (!valResult.isValid) {
      toast.error(valResult.error || 'Please enter a valid reason.');
      return;
    }
    const newVersion = finalisedInfo.version + 1;
    setIsFinalised(false);
    setFinalisedInfo((prev) => ({
      ...prev,
      version: newVersion,
    }));
    setIsReopenModalOpen(false);
    setReopenReason('');
    toast.info(
      `Dataset unlocked for revision (Version ${newVersion}). Reason recorded in audit trail.`
    );
  };

  const filteredConsolidated = useMemo(() => {
    if (selectedDistrict === 'all') return INITIAL_CONSOLIDATED_DATA;
    return INITIAL_CONSOLIDATED_DATA.filter((r) => r.district === selectedDistrict);
  }, [selectedDistrict]);

  const consolidatedColumns = useMemo(() => getConsolidatedDataColumns(), []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Data Finalisation and Reports"
        breadcrumbs={[{ label: 'Collected Data' }]}
      />

      {/* KPI METRICS (Matching Dashboard Style) */}
      <KpiGrid>
        <KpiCard
          label="Total Assigned"
          value="64"
          note="Target Institutions"
          icon={Users}
        />
        <KpiCard
          label="Approved Submissions"
          value="42"
          note="65.6% completion"
          icon={CheckCircle2}
        />
        <KpiCard
          label="Online Submissions"
          value="38"
          note="Verified portal entries"
          icon={Activity}
        />
        <KpiCard
          label="Offline Submissions"
          value="4"
          note="Scanned letter upload"
          icon={FileText}
        />
      </KpiGrid>

      {/* SECTION 1: FINALISE DATASET WORKSPACE (Inside Card) */}
      <Card title="Dataset Finalisation & Official Locking">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <FieldInfoTooltip
                label="Collection / Cycle"
                required={true}
                tooltipText="Select the information collection and survey cycle to review or finalise."
              />
              <SearchableSelect
                options={COLLECTION_CYCLE_OPTIONS}
                value={selectedCollectionId}
                onChange={(val) => {
                  const strVal = String(val);
                  setSelectedCollectionId(strVal);
                  setSelectedCycle(strVal === 'IC-2026-001' ? 'Cycle 1 - Nov 2026' : 'Cycle 2 - AY 2026-27');
                }}
                placeholder="- Select Collection / Cycle -"
              />
            </div>

            <div>
              <FieldInfoTooltip
                label="Dataset Status"
                tooltipText={
                  isFinalised
                    ? `Official dataset locked on ${finalisedInfo.date} by ${finalisedInfo.user}. Reports reflect verified values across online and offline submissions.`
                    : 'Dataset unlocked. Pending corrections may be received until re-finalisation.'
                }
              />
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg border bg-muted/20 text-xs">
                {isFinalised ? (
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <Lock size={13} /> Finalised & Locked (v{finalisedInfo.version})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <Unlock size={13} /> Open for Revisions (v{finalisedInfo.version})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ACTION BUTTON BAR: Inside Card at Bottom, Start Aligned */}
          <div className="flex items-center justify-start gap-3 pt-5 border-t border-border mt-6">
            {!isFinalised ? (
              <Button
                type="button"
                variant="primary"
                icon={<Lock size={14} />}
                onClick={() => setIsFinaliseModalOpen(true)}
              >
                Finalise & Lock Dataset
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                icon={<Unlock size={14} />}
                onClick={() => setIsReopenModalOpen(true)}
              >
                Reopen with Reason
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 2: REPORTS & ANALYTICS DATA TABLE */}
      <div className="space-y-4">
        {activeReportTab === 'consolidated' && (
          <>
            <FilterPanel
              title="Filter Consolidated Dataset"
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
              <div className="w-full sm:w-64">
                <label className="text-xs font-semibold text-foreground block mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="ui-field text-xs w-full h-[34px]"
                >
                  <option value="all">All Districts</option>
                  <option value="Khordha">Khordha</option>
                  <option value="Cuttack">Cuttack</option>
                  <option value="Dhenkanal">Dhenkanal</option>
                  <option value="Kendrapara">Kendrapara</option>
                </select>
              </div>
            </FilterPanel>

            <Card title="Consolidated Clean Data (Row-per-Institution)">
              <DataTable
                caption="Consolidated Clean Data (Row-per-Institution)"
                data={filteredConsolidated}
                columns={consolidatedColumns}
                rowKey={(r) => r.id}
                searchPlaceholder="Search institution name or AISHE..."
                filterToggle={{
                  hidden: isFilterHidden,
                  onToggle: () => setIsFilterHidden((prev) => !prev),
                  appliedCount: appliedFilterCount,
                }}
                cardActions={
                  <div className="w-full">
                    <Tabs
                      tabs={reportTabs}
                      activeTab={activeReportTab}
                      onChange={setActiveReportTab}
                      variant="pills"
                    />
                  </div>
                }
              />
            </Card>
          </>
        )}

        {activeReportTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b">
              <Tabs
                tabs={reportTabs}
                activeTab={activeReportTab}
                onChange={setActiveReportTab}
                variant="pills"
              />
              <Button
                variant="primary"
                size="sm"
                icon={<Download size={13} />}
                onClick={() => toast.success('Exporting summary analytics report...')}
              >
                Export Summary Report
              </Button>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground">
                Statistical Aggregates by District & Institution Type
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="p-3">District</th>
                      <th className="p-3">Institutions Responded</th>
                      <th className="p-3">Total Operational Labs (Sum)</th>
                      <th className="p-3">Avg Labs / College</th>
                      <th className="p-3">Total Workstations (Sum)</th>
                      <th className="p-3">Smart Classrooms (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Khordha</td>
                      <td className="p-3">18</td>
                      <td className="p-3 font-bold text-foreground">126</td>
                      <td className="p-3 text-muted-foreground">7.0</td>
                      <td className="p-3 font-bold text-foreground">138</td>
                      <td className="p-3 text-emerald-700 font-semibold">92%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Cuttack</td>
                      <td className="p-3">12</td>
                      <td className="p-3 font-bold text-foreground">78</td>
                      <td className="p-3 text-muted-foreground">6.5</td>
                      <td className="p-3 font-bold text-foreground">84</td>
                      <td className="p-3 text-emerald-700 font-semibold">83%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Dhenkanal</td>
                      <td className="p-3">6</td>
                      <td className="p-3 font-bold text-foreground">39</td>
                      <td className="p-3 text-muted-foreground">6.5</td>
                      <td className="p-3 font-bold text-foreground">42</td>
                      <td className="p-3 text-amber-700 font-semibold">66%</td>
                    </tr>
                    <tr className="bg-muted/30 font-bold">
                      <td className="p-3 text-foreground">State Total / Average</td>
                      <td className="p-3 text-foreground">42</td>
                      <td className="p-3 text-primary">283</td>
                      <td className="p-3 text-foreground">6.7</td>
                      <td className="p-3 text-primary">312</td>
                      <td className="p-3 text-emerald-700">85.7%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeReportTab === 'comparison' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b">
              <Tabs
                tabs={reportTabs}
                activeTab={activeReportTab}
                onChange={setActiveReportTab}
                variant="pills"
              />
              <Button
                variant="primary"
                size="sm"
                icon={<Download size={13} />}
                onClick={() => toast.success('Exporting recurring cycle trend analysis...')}
              >
                Export Trend Analysis
              </Button>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Quarterly Recurring Cycle Progression
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Evaluating key equipment count trends between consecutive collection cycles.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                  Collection: IC-2026-001 (Quarterly Census)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="p-3">Metric / Question Code</th>
                      <th className="p-3">Cycle 1 (Nov 2026)</th>
                      <th className="p-3">Cycle 2 (Feb 2027 Projected)</th>
                      <th className="p-3">Growth / Variance</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Q2: Total Practical Labs</td>
                      <td className="p-3">283 Labs</td>
                      <td className="p-3">305 Labs</td>
                      <td className="p-3 text-emerald-700 font-semibold">+7.8%</td>
                      <td className="p-3"><span className="text-emerald-700 font-semibold">Upward Trend</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Q3: Physics Workstations</td>
                      <td className="p-3">312 Units</td>
                      <td className="p-3">340 Units</td>
                      <td className="p-3 text-emerald-700 font-semibold">+8.9%</td>
                      <td className="p-3"><span className="text-emerald-700 font-semibold">Infrastructure Expansion</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Q4: Smart Class Adoption</td>
                      <td className="p-3">85.7%</td>
                      <td className="p-3">92.0%</td>
                      <td className="p-3 text-emerald-700 font-semibold">+6.3%</td>
                      <td className="p-3"><span className="text-emerald-700 font-semibold">Target Milestone</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FINALISE DATASET CONFIRMATION MODAL */}
      <DialogModal
        isOpen={isFinaliseModalOpen}
        onClose={() => setIsFinaliseModalOpen(false)}
        onConfirm={handleFinaliseDataset}
        title="Confirm Finalisation of Official Dataset"
        confirmText="Confirm & Lock Dataset"
        message={
          <div className="space-y-3">
            <p className="text-foreground">
              Are you sure you want to finalise and lock the dataset for{' '}
              <strong>{selectedCycle}</strong>?
            </p>
            <p>
              Locking locks the approved data as the official dataset with your user credentials and timestamp. Any pending verifications or corrections will be excluded.
            </p>
          </div>
        }
      />

      {/* REOPEN DATASET MODAL (REASON MANDATORY PER SRS) */}
      {isReopenModalOpen && (
        <Modal
          isOpen={isReopenModalOpen}
          onClose={() => setIsReopenModalOpen(false)}
          title="Reopen Dataset for Correction"
          size="md"
        >
          <div className="p-4 space-y-4 text-xs">
            <p className="text-amber-800 dark:text-amber-300 font-medium">
              Reopening will create <strong>Version {finalisedInfo.version + 1}</strong> and unlock the cycle to accept corrections.
            </p>
            <div>
              <label className="font-semibold text-foreground block mb-1">
                Reason for Reopening Dataset <span className="text-red-500">* (Mandatory)</span>
              </label>
              <textarea
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="State official justification for reopening the dataset..."
                className="ui-field text-xs w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setIsReopenModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleReopenDataset}>
                Confirm Reopen
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CollectedDataReports;
