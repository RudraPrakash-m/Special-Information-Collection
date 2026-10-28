import React from 'react';
import type { CollectionStatus } from '../types/manageCollections.types';

interface CollectionStatusBadgeProps {
  status: CollectionStatus;
}

export const CollectionStatusBadge: React.FC<CollectionStatusBadgeProps> = ({ status }) => {
  const dotColor: Record<CollectionStatus, string> = {
    Draft: 'bg-amber-500',
    Published: 'bg-emerald-500',
    Active: 'bg-emerald-500',
    Closed: 'bg-gray-400',
  };
  const textColor: Record<CollectionStatus, string> = {
    Draft: 'text-amber-700 dark:text-amber-400',
    Published: 'text-emerald-700 dark:text-emerald-400',
    Active: 'text-emerald-700 dark:text-emerald-400',
    Closed: 'text-muted-foreground',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor[status] || textColor.Draft}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] || dotColor.Draft}`} />
      {status}
    </span>
  );
};

export default CollectionStatusBadge;
