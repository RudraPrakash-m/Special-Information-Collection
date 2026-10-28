import React from 'react';
import type { CollectionStatus } from '../types/createCollection.types';

interface CollectionStatusBadgeProps {
  status: CollectionStatus;
}

export const CollectionStatusBadge: React.FC<CollectionStatusBadgeProps> = ({ status }) => {
  const styles: Record<CollectionStatus, string> = {
    Draft: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    Published: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    Closed: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
        styles[status] || styles.Draft
      }`}
    >
      {status}
    </span>
  );
};

export default CollectionStatusBadge;

