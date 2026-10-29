import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  RotateCw,
  Copy,
  History,
  ShieldCheck,
  Globe,
  XCircle,
  Send,
  FilePlus2,
  type LucideIcon,
} from 'lucide-react';
import { ActionIcon } from '@/shared/components/ui';
import type { InformationCollectionRecord } from '../types/manageCollections.types';

interface CollectionActionDropdownProps {
  record: InformationCollectionRecord;
  onView: () => void;
  onEdit?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
  onExtend?: () => void;
  onCycles?: () => void;
  onModify?: () => void;
  onNewVersion?: () => void;
  onClose?: () => void;
  onDuplicate?: () => void;
  onHistory?: () => void;
  onRules?: () => void;
  onInterface?: () => void;
}

interface MenuAction {
  label: string;
  icon: LucideIcon;
  onSelect?: () => void;
  enabled: boolean;
  /** Why the action is disabled (shown as tooltip). */
  reason?: string;
  danger?: boolean;
}

/**
 * Row actions of Manage Collections (SRS 1.4). Every action is always shown; actions that do not apply to the
 * collection's status are disabled, with the reason as tooltip.
 */
export const CollectionActionDropdown: React.FC<CollectionActionDropdownProps> = ({
  record,
  onView,
  onEdit,
  onPublish,
  onDelete,
  onExtend,
  onCycles,
  onModify,
  onNewVersion,
  onClose,
  onDuplicate,
  onHistory,
  onRules,
  onInterface,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isDraft = record.status === 'Draft';
  const isPublished = record.status === 'Published' || record.status === 'Active';
  const isClosed = record.status === 'Closed';
  const isRecurring = record.frequency !== 'one-time';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAction = (cb?: () => void) => {
    setIsOpen(false);
    if (cb) cb();
  };

  const menuActions: MenuAction[] = [
    { label: 'Configure Rules', icon: ShieldCheck, onSelect: onRules, enabled: !isClosed, reason: 'Not available for a closed collection' },
    { label: 'Dedicated Interface', icon: Globe, onSelect: onInterface, enabled: !isClosed, reason: 'Not available for a closed collection' },
    { label: 'Duplicate Collection', icon: Copy, onSelect: onDuplicate, enabled: true },
    { label: 'Version History', icon: History, onSelect: onHistory, enabled: true },
    { label: 'Modify (New Version)', icon: Edit, onSelect: onModify, enabled: isPublished, reason: 'Published collections only' },
    { label: 'New Question Version', icon: FilePlus2, onSelect: onNewVersion, enabled: isPublished, reason: 'Published collections only' },
    { label: 'Close Collection', icon: XCircle, onSelect: onClose, enabled: isPublished, reason: 'Published collections only', danger: true },
  ];

  return (
    <div className="relative inline-flex items-center gap-1">
      <ActionIcon tone="primary" icon={Eye} label="View details" onClick={onView} />

      <ActionIcon
        tone="success"
        icon={Send}
        label={isDraft ? 'Publish collection' : 'Publish (Draft collections only)'}
        disabled={!isDraft}
        onClick={onPublish}
      />

      <ActionIcon
        tone="warning"
        icon={Edit}
        label={isDraft ? 'Edit draft' : 'Edit (Draft collections only)'}
        disabled={!isDraft}
        onClick={onEdit}
      />

      <ActionIcon
        tone="info"
        icon={RotateCw}
        label={
          !isRecurring
            ? 'Cycles (recurring collections only)'
            : isDraft
              ? 'Cycles (created when the collection is published)'
              : 'Manage recurring cycles'
        }
        disabled={!isRecurring || isDraft}
        onClick={onCycles}
      />

      <ActionIcon
        tone="secondary"
        icon={Calendar}
        label={isPublished ? 'Extend due date' : 'Extend due date (Published collections only)'}
        disabled={!isPublished}
        onClick={onExtend}
      />

      <ActionIcon
        tone="danger"
        icon={Trash2}
        label={isDraft ? 'Delete draft' : 'Delete (Draft collections only)'}
        disabled={!isDraft}
        onClick={onDelete}
      />

      {/* More actions (3 dots) */}
      <div className="relative">
        <ActionIcon
          ref={buttonRef}
          tone="neutral"
          icon={MoreHorizontal}
          label="More actions"
          onClick={() => setIsOpen((prev) => !prev)}
        />

        {isOpen && (
          <div
            ref={menuRef}
            className="dt-popover absolute right-0 top-full mt-1 w-56 py-1.5 text-xs"
          >
            {menuActions.map((action) => {
              const ActionIconGlyph = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  disabled={!action.enabled}
                  title={action.enabled ? undefined : action.reason}
                  onClick={() => handleAction(action.onSelect)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left ${
                    action.danger ? 'text-rose-600 border-t border-border mt-1 pt-1.5' : 'text-foreground'
                  } ${action.enabled ? 'hover:bg-muted' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <ActionIconGlyph size={14} className={action.danger ? '' : 'text-muted-foreground'} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionActionDropdown;
