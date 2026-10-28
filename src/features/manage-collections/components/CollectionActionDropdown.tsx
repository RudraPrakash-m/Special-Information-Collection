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
  onClose?: () => void;
  onDuplicate?: () => void;
  onHistory?: () => void;
  onRules?: () => void;
  onInterface?: () => void;
}

export const CollectionActionDropdown: React.FC<CollectionActionDropdownProps> = ({
  record,
  onView,
  onEdit,
  onPublish,
  onDelete,
  onExtend,
  onCycles,
  onModify,
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

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* 1. View icon button (always available) */}
      <ActionIcon
        tone="primary"
        icon={Eye}
        label="View details"
        onClick={onView}
      />

      {/* 2. Draft action icons: Publish & Edit */}
      {isDraft && onPublish && (
        <ActionIcon
          tone="success"
          icon={Send}
          label="Publish collection"
          onClick={onPublish}
        />
      )}

      {isDraft && onEdit && (
        <ActionIcon
          tone="warning"
          icon={Edit}
          label="Edit draft"
          onClick={onEdit}
        />
      )}

      {/* 3. Published action icons: Cycles & Extend */}
      {isPublished && onCycles && (
        <ActionIcon
          tone="info"
          icon={RotateCw}
          label="Manage recurring cycles"
          onClick={onCycles}
        />
      )}

      {isPublished && onExtend && (
        <ActionIcon
          tone="secondary"
          icon={Calendar}
          label="Extend deadline"
          onClick={onExtend}
        />
      )}

      {/* 4. Delete icon for draft */}
      {isDraft && onDelete && (
        <ActionIcon
          tone="danger"
          icon={Trash2}
          label="Delete draft"
          onClick={onDelete}
        />
      )}

      {/* 5. More actions icon button (3 dots) */}
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
            className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
          >
            {onRules && (
              <button
                type="button"
                onClick={() => handleAction(onRules)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground text-left"
              >
                <ShieldCheck size={14} className="text-muted-foreground" />
                <span>Configure Rules</span>
              </button>
            )}

            {onInterface && (
              <button
                type="button"
                onClick={() => handleAction(onInterface)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground text-left"
              >
                <Globe size={14} className="text-muted-foreground" />
                <span>Dedicated Interface</span>
              </button>
            )}

            {onDuplicate && (
              <button
                type="button"
                onClick={() => handleAction(onDuplicate)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground text-left"
              >
                <Copy size={14} className="text-muted-foreground" />
                <span>Duplicate Collection</span>
              </button>
            )}

            {onHistory && (
              <button
                type="button"
                onClick={() => handleAction(onHistory)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground text-left"
              >
                <History size={14} className="text-muted-foreground" />
                <span>Version History</span>
              </button>
            )}

            {isPublished && onModify && (
              <button
                type="button"
                onClick={() => handleAction(onModify)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground text-left"
              >
                <Edit size={14} className="text-muted-foreground" />
                <span>Modify (New Version)</span>
              </button>
            )}

            {isPublished && onClose && (
              <button
                type="button"
                onClick={() => handleAction(onClose)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-rose-600 text-left border-t border-border mt-1 pt-1.5"
              >
                <XCircle size={14} />
                <span>Close Collection</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionActionDropdown;
