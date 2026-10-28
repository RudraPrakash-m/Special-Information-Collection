import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/shared/components/layout/PageHeader';
import { Button, DataTable, Modal, Tabs, type TabItem } from '@/shared/components/ui';
import {
  INITIAL_COLLECTIONS,
  type InformationCollectionRecord,
} from '../types/manageCollections.types';
import CollectionStatusBadge from '../components/CollectionStatusBadge';
import { getManageCollectionsColumns } from '../columns/manageCollectionsColumns';
import { validateExtendDeadline, validateCloseCollection } from '../validation/manageCollectionsValidation';

export const ManageCollections: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<InformationCollectionRecord[]>(INITIAL_COLLECTIONS);
  const [selectedCollection, setSelectedCollection] = useState<InformationCollectionRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states for SRS actions
  const [cyclesModalItem, setCyclesModalItem] = useState<InformationCollectionRecord | null>(null);
  const [historyModalItem, setHistoryModalItem] = useState<InformationCollectionRecord | null>(null);
  const [extendModalItem, setExtendModalItem] = useState<InformationCollectionRecord | null>(null);
  const [modifyModalItem, setModifyModalItem] = useState<InformationCollectionRecord | null>(null);
  const [closeModalItem, setCloseModalItem] = useState<InformationCollectionRecord | null>(null);

  // Form states for modals
  const [extendDate, setExtendDate] = useState<string>('');
  const [actionReason, setActionReason] = useState<string>('');

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: data.length,
      published: data.filter((d) => d.status === 'Published' || d.status === 'Active').length,
      draft: data.filter((d) => d.status === 'Draft').length,
      closed: data.filter((d) => d.status === 'Closed').length,
    };
  }, [data]);

  // Tab definitions matching SRS (Draft / Published / Closed)
  const statusTabs: TabItem[] = useMemo(
    () => [
      { key: 'all', label: 'All Collections', count: statusCounts.all },
      { key: 'Published', label: 'Published', count: statusCounts.published },
      { key: 'Draft', label: 'Draft', count: statusCounts.draft },
      { key: 'Closed', label: 'Closed', count: statusCounts.closed },
    ],
    [statusCounts]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'Published') {
          if (item.status !== 'Published' && item.status !== 'Active') return false;
        } else if (item.status !== statusFilter) {
          return false;
        }
      }
      if (filterType !== 'all' && item.collectionType !== filterType) {
        return false;
      }
      return true;
    });
  }, [data, statusFilter, filterType]);

  const handleCopyLink = (record: InformationCollectionRecord) => {
    const slug = record.dedicatedSlug || record.id.toLowerCase();
    const fullUrl = `${window.location.origin}/portal/collection/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(record.id);
    toast.success('Dedicated link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1.4 Action: Publish
  const handlePublish = (record: InformationCollectionRecord) => {
    if (!record.dedicatedSlug) {
      toast.error('Dedicated interface must be configured before publishing.');
      return;
    }
    setData((prev) =>
      prev.map((c) =>
        c.id === record.id
          ? {
              ...c,
              status: 'Published',
              dedicatedLinkActive: true,
              version: (c.version || 1),
              currentCycle: c.currentCycle || 'Cycle 1',
              dueDate: c.dueDate || new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
              assignedCount: c.assignedCount || 64,
            }
          : c
      )
    );
    toast.success(`Collection "${record.collectionTitle}" published successfully! Dedicated link and first cycle activated.`);
  };

  // 1.4 Action: Delete (Draft only)
  const handleDeleteDraft = (id: string) => {
    setData((prev) => prev.filter((c) => c.id !== id));
    toast.success('Draft collection deleted and linked survey released.');
  };

  // 1.4 Action: Duplicate
  const handleDuplicate = (record: InformationCollectionRecord) => {
    const newId = `IC-${Date.now().toString().slice(-4)}`;
    const duplicate: InformationCollectionRecord = {
      ...record,
      id: newId,
      collectionTitle: `${record.collectionTitle} (Copy)`,
      status: 'Draft',
      dedicatedLinkActive: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setData((prev) => [duplicate, ...prev]);
    toast.success(`Duplicate draft collection "${duplicate.collectionTitle}" created.`);
  };

  // 1.4 Action: Extend Due Date
  const handleConfirmExtend = () => {
    const validation = validateExtendDeadline({ newDate: extendDate, reason: actionReason });
    if (!validation.isValid) {
      toast.error(validation.errors.newDate || validation.errors.reason || 'Please fill required fields.');
      return;
    }
    if (extendModalItem) {
      setData((prev) =>
        prev.map((c) =>
          c.id === extendModalItem.id
            ? {
                ...c,
                dueDate: extendDate,
                versionHistory: [
                  ...(c.versionHistory || []),
                  {
                    version: c.version || 1,
                    date: new Date().toISOString().split('T')[0],
                    user: 'HED Admin',
                    changes: `Extended End Date to ${extendDate}`,
                    reason: actionReason,
                  },
                ],
              }
            : c
        )
      );
      toast.success(`Due date extended to ${extendDate} successfully.`);
      setExtendModalItem(null);
      setExtendDate('');
      setActionReason('');
    }
  };

  // 1.4 Action: Modify Collection
  const handleConfirmModify = () => {
    if (!actionReason.trim()) {
      toast.error('Reason for modifying collection is mandatory.');
      return;
    }
    if (modifyModalItem) {
      const nextVer = (modifyModalItem.version || 1) + 1;
      setData((prev) =>
        prev.map((c) =>
          c.id === modifyModalItem.id
            ? {
                ...c,
                version: nextVer,
                versionHistory: [
                  ...(c.versionHistory || []),
                  {
                    version: nextVer,
                    date: new Date().toISOString().split('T')[0],
                    user: 'HED Admin',
                    changes: `Collection modified to Version ${nextVer}`,
                    reason: actionReason,
                  },
                ],
              }
            : c
        )
      );
      toast.success(`Created collection Version ${nextVer}. Proceeding to edit parameters.`);
      setModifyModalItem(null);
      setActionReason('');
      navigate(`/information-collection/create-collection?edit=${modifyModalItem.id}`);
    }
  };

  // 1.4 Action: Close Collection
  const handleConfirmClose = () => {
    const validation = validateCloseCollection({ reason: actionReason });
    if (!validation.isValid) {
      toast.error(validation.error || 'Reason for closing collection is mandatory.');
      return;
    }
    if (closeModalItem) {
      setData((prev) =>
        prev.map((c) =>
          c.id === closeModalItem.id
            ? {
                ...c,
                status: 'Closed',
                dedicatedLinkActive: false,
                versionHistory: [
                  ...(c.versionHistory || []),
                  {
                    version: c.version || 1,
                    date: new Date().toISOString().split('T')[0],
                    user: 'HED Admin',
                    changes: 'Collection closed and further cycles stopped.',
                    reason: actionReason,
                  },
                ],
              }
            : c
        )
      );
      toast.success(`Collection "${closeModalItem.collectionTitle}" closed successfully.`);
      setCloseModalItem(null);
      setActionReason('');
    }
  };

  const columns = useMemo(
    () =>
      getManageCollectionsColumns({
        onView: (r) => setSelectedCollection(r),
        onEdit: (r) => navigate(`/information-collection/create-collection?edit=${r.id}`),
        onPublish: (r) => handlePublish(r),
        onDelete: (id) => handleDeleteDraft(id),
        onExtend: (r) => {
          setExtendModalItem(r);
          setExtendDate(r.dueDate || '');
        },
        onCycles: (r) => setCyclesModalItem(r),
        onModify: (r) => setModifyModalItem(r),
        onClose: (r) => setCloseModalItem(r),
        onDuplicate: (r) => handleDuplicate(r),
        onHistory: (r) => setHistoryModalItem(r),
        onRules: (id) => navigate(`/information-collection/validation-rules?collectionId=${id}`),
        onInterface: (id) => navigate(`/information-collection/dedicated-interface?collectionId=${id}`),
        onCopyLink: (r) => handleCopyLink(r),
        copiedId,
      }),
    [copiedId, navigate]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Information Collections"
        breadcrumbs={[{ label: 'Manage Collections' }]}
      />

      <DataTable
        caption="Departmental Information Collections"
        data={filteredData}
        columns={columns}
        rowKey={(r) => r.id}
        searchPlaceholder="Search collection title, survey name, or ID..."
        cardActions={
          <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3.5 border-b border-border -mt-1 -mx-5 px-5">
              <Tabs
                tabs={statusTabs}
                activeTab={statusFilter}
                onChange={setStatusFilter}
                variant="pills"
              />

              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={() => navigate('/information-collection/create-collection')}
              >
                Create New Collection
              </Button>
            </div>
          </div>
        }
        filters={
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="ui-field !h-8 text-xs py-0 px-2 min-w-[140px] rounded-md"
            >
              <option value="all">All Types</option>
              <option value="institution">Institution-specific</option>
              <option value="scheme">Scheme-specific</option>
              <option value="activity">Activity-specific</option>
            </select>
          </div>
        }
      />

      {/* 1. VIEW SUMMARY MODAL */}
      {selectedCollection && (
        <Modal
          isOpen={!!selectedCollection}
          onClose={() => setSelectedCollection(null)}
          title={`Collection Details — ${selectedCollection.id}`}
          size="2xl"
        >
          <div className="p-4 space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Title</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedCollection.collectionTitle}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Status & Version</span>
                <div className="mt-0.5 flex items-center gap-2">
                  <CollectionStatusBadge status={selectedCollection.status} />
                  <span className="text-xs font-mono font-bold">v{selectedCollection.version || 1}</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Type</span>
                <p className="capitalize text-foreground mt-0.5">{selectedCollection.collectionType}-specific</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Frequency</span>
                <p className="capitalize text-foreground mt-0.5">
                  {selectedCollection.frequency}
                  {selectedCollection.cycleDurationDays ? ` (${selectedCollection.cycleDurationDays} days cycle)` : ''}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Linked Survey</span>
                <p className="text-foreground mt-0.5">{selectedCollection.surveyTitle}</p>
                <p className="font-mono text-xs text-muted-foreground">{selectedCollection.surveyId}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Due Date</span>
                <p className="text-foreground mt-0.5 font-medium">{selectedCollection.dueDate || 'Not set'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Submissions Progress</span>
                <p className="text-foreground mt-0.5">
                  <strong>{selectedCollection.approvedCount || 0}</strong> Approved &bull; <strong>{selectedCollection.submittedCount || 0}</strong> Submitted &bull; <strong>{selectedCollection.assignedCount || 64}</strong> Assigned
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Dedicated Link</span>
                <p className="text-primary font-mono text-xs mt-0.5">
                  {selectedCollection.dedicatedSlug ? `/portal/collection/${selectedCollection.dedicatedSlug}` : 'Not configured yet'}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Approval Workflow</span>
              {selectedCollection.approvalRequired ? (
                <div className="mt-2 space-y-2">
                  {selectedCollection.approvalLevels.map((lvl) => (
                    <div key={lvl.levelNumber} className="p-2.5 rounded border bg-muted/20 text-xs">
                      <p className="font-semibold text-foreground">{lvl.levelName}</p>
                      <p className="text-muted-foreground">Assigned Verifier IDs: {lvl.assignedUserIds.join(', ')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Direct submission (no approval levels configured).</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const id = selectedCollection.id;
                    setSelectedCollection(null);
                    navigate(`/information-collection/validation-rules?collectionId=${id}`);
                  }}
                >
                  Validation Rules
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const id = selectedCollection.id;
                    setSelectedCollection(null);
                    navigate(`/information-collection/dedicated-interface?collectionId=${id}`);
                  }}
                >
                  Dedicated Interface
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedCollection(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. RECURRING CYCLES MODAL */}
      {cyclesModalItem && (
        <Modal
          isOpen={!!cyclesModalItem}
          onClose={() => setCyclesModalItem(null)}
          title={`Recurring Cycles — ${cyclesModalItem.collectionTitle}`}
          size="2xl"
        >
          <div className="p-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Cycle frequency: <strong className="capitalize">{cyclesModalItem.frequency}</strong>. New cycles are automatically duplicated and published at each frequency period.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="p-2">Cycle Name</th>
                    <th className="p-2">Start Date</th>
                    <th className="p-2">End Date</th>
                    <th className="p-2">Progress</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(cyclesModalItem.cycles || []).map((cycle) => (
                    <tr key={cycle.cycleNumber}>
                      <td className="p-2 font-semibold text-foreground">{cycle.cycleName}</td>
                      <td className="p-2">{cycle.startDate}</td>
                      <td className="p-2">{cycle.endDate}</td>
                      <td className="p-2">
                        {cycle.receivedCount} / {cycle.assignedCount} ({cycle.completionRate}%)
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cycle.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : cycle.status === 'Closed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {cycle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setCyclesModalItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. VERSION HISTORY MODAL */}
      {historyModalItem && (
        <Modal
          isOpen={!!historyModalItem}
          onClose={() => setHistoryModalItem(null)}
          title={`Version History & Audit Log — ${historyModalItem.collectionTitle}`}
          size="2xl"
        >
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              {(historyModalItem.versionHistory || []).map((vh, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Version {vh.version}</span>
                    <span className="text-muted-foreground">{vh.date}</span>
                  </div>
                  <p className="text-muted-foreground">Updated by: <strong className="text-foreground">{vh.user}</strong></p>
                  <p className="text-foreground">{vh.changes}</p>
                  <p className="text-muted-foreground italic">Reason: "{vh.reason}"</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setHistoryModalItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 4. EXTEND DUE DATE MODAL */}
      {extendModalItem && (
        <Modal
          isOpen={!!extendModalItem}
          onClose={() => setExtendModalItem(null)}
          title={`Extend Due Date — ${extendModalItem.collectionTitle}`}
          size="md"
        >
          <div className="p-4 space-y-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">
                New End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={extendDate}
                onChange={(e) => setExtendDate(e.target.value)}
                className="ui-field w-full"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Current Due Date: <strong>{extendModalItem.dueDate || 'N/A'}</strong>. Must be later than current end date.
              </p>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">
                Reason for Extension <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Provide justification for extending the due date..."
                className="ui-field w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setExtendModalItem(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmExtend}>
                Confirm Extension
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. MODIFY COLLECTION MODAL */}
      {modifyModalItem && (
        <Modal
          isOpen={!!modifyModalItem}
          onClose={() => setModifyModalItem(null)}
          title={`Modify Collection — ${modifyModalItem.collectionTitle}`}
          size="md"
        >
          <div className="p-4 space-y-4 text-xs">
            <p className="text-muted-foreground">
              Modifying this collection will create <strong>Version {(modifyModalItem.version || 1) + 1}</strong> and unlock instructions, validation rules, approval levels, and download formats for editing.
            </p>

            <div>
              <label className="font-semibold text-foreground block mb-1">
                Reason for Modification <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="State the reason for this new collection version..."
                className="ui-field w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setModifyModalItem(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmModify}>
                Create New Version & Edit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. CLOSE COLLECTION MODAL */}
      {closeModalItem && (
        <Modal
          isOpen={!!closeModalItem}
          onClose={() => setCloseModalItem(null)}
          title={`Close Collection — ${closeModalItem.collectionTitle}`}
          size="md"
        >
          <div className="p-4 space-y-4 text-xs">
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Warning: Closing this collection will deactivate the dedicated interface and prevent further recurring cycles from being generated.
            </p>

            <div>
              <label className="font-semibold text-foreground block mb-1">
                Reason for Closure <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="State why this collection is being closed..."
                className="ui-field w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setCloseModalItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmClose}>
                Confirm Close Collection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageCollections;
