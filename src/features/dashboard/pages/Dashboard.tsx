import { useState, useMemo } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/shared/components/layout/PageHeader";
import Card from "@/shared/components/layout/Card";
import { Button, DataTable, type Column } from "@/shared/components/ui";
import { FormGenerator } from "@/shared/components/ui/Forms";
import type { FormField } from "@/shared/components/ui/Forms";
import DashboardKpiSection from "../components/DashboardKpiSection";
import DashboardQuickModal from "../components/DashboardQuickModal";
import type { ActivityItem, DashboardKpi } from "../types/dashboard.types";
import filterConfig from "../form-config/dashboardFilterForm.json";

const INITIAL_KPIS: DashboardKpi[] = [
  { id: "1", label: "Active Modules", value: 12, note: "Ready for configuration" },
  { id: "2", label: "Total Registrations", value: "1,420", note: "Registered in system" },
  { id: "3", label: "Completed Audits", value: 86, note: "Verified & Approved" },
  { id: "4", label: "Pending Tasks", value: 9, note: "Requires attention" },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: "ACT-001", date: "2026-10-28", title: "System baseline initialization completed", category: "System", status: "Completed" },
  { id: "ACT-002", date: "2026-10-27", title: "Form Generator schemas synchronized", category: "Operations", status: "Completed" },
  { id: "ACT-003", date: "2026-10-26", title: "User security review scheduled", category: "Audit", status: "In Progress" },
  { id: "ACT-004", date: "2026-10-25", title: "API gateway connection check", category: "System", status: "Pending" },
];

export const Dashboard = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState<{ keyword?: string; category?: string; status?: string }>({});

  const filteredData = useMemo(() => {
    return activities.filter((item) => {
      if (filterQuery.keyword && !item.title.toLowerCase().includes(filterQuery.keyword.toLowerCase())) {
        return false;
      }
      if (filterQuery.category && filterQuery.category !== "all" && item.category.toLowerCase() !== filterQuery.category.toLowerCase()) {
        return false;
      }
      if (filterQuery.status && filterQuery.status !== "all" && item.status !== filterQuery.status) {
        return false;
      }
      return true;
    });
  }, [activities, filterQuery]);

  const handleCreateActivity = (formData: Record<string, unknown>) => {
    const newEntry: ActivityItem = {
      id: `ACT-00${activities.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      title: String(formData.title || "Untitled Activity"),
      category: String(formData.category || "Operations"),
      status: "In Progress",
    };
    setActivities((prev) => [newEntry, ...prev]);
    toast.success("New activity logged successfully!");
  };

  const columns: Column<ActivityItem>[] = [
    { id: "id", header: "Reference", accessor: (r) => r.id, width: "w-28" },
    { id: "date", header: "Date", accessor: (r) => r.date, sortable: true, width: "w-32" },
    { id: "title", header: "Activity Title", accessor: (r) => r.title },
    { id: "category", header: "Category", accessor: (r) => r.category, width: "w-36" },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      width: "w-32",
      cell: (r) => {
        const colorClasses: Record<string, string> = {
          Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${colorClasses[r.status] || "bg-gray-100 text-gray-700"}`}>
            {r.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* KPI Cards */}
      <DashboardKpiSection kpis={INITIAL_KPIS} />

      {/* Filter / Search Card using FormGenerator from JSON Schema */}
      <Card title="Filter & Search Activities" className="mb-4">
        <FormGenerator
          fields={filterConfig as FormField[]}
          onSubmit={(data) => setFilterQuery(data as typeof filterQuery)}
          gridColumns={12}
          buttonPosition="inline"
          buttonGridColumn={12}
          buttonClassName="justify-end gap-2 mt-2"
        >
          <Button
            type="button"
            variant="outline"
            icon={<RefreshCw size={15} />}
            onClick={() => setFilterQuery({})}
          >
            Reset Filter
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Apply Filter
          </Button>
        </FormGenerator>
      </Card>

      {/* Activity Table */}
      <div className="space-y-3">
        <DataTable
          caption="Recent Activities & Audit Logs"
          data={filteredData}
          columns={columns}
          rowKey={(r) => r.id}
          toolbarActions={
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Log New Activity
            </Button>
          }
        />
      </div>

      {/* Quick Entry Modal with JSON FormGenerator */}
      <DashboardQuickModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateActivity}
      />
    </div>
  );
};

export default Dashboard;
