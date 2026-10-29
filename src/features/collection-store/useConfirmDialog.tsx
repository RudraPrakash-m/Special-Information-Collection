import React, { useState } from 'react';
import { DialogModal } from '@/shared/components/ui';
import type { DialogModalProps } from '@/shared/components/ui/DialogModal/DialogModal';

export interface ConfirmOptions {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  type?: DialogModalProps['type'];
  onConfirm: () => void;
}

/**
 * One reusable confirmation (shared DialogModal) per page for table actions and Save / Submit buttons.
 * Call `confirm({...})` instead of running the action, and render `confirmDialog` once in the page.
 */
export const useConfirmDialog = () => {
  const [pending, setPending] = useState<ConfirmOptions | null>(null);

  const confirmDialog = (
    <DialogModal
      isOpen={!!pending}
      onClose={() => setPending(null)}
      onConfirm={() => {
        const action = pending?.onConfirm;
        setPending(null);
        action?.();
      }}
      title={pending?.title}
      message={pending?.message ?? ''}
      confirmText={pending?.confirmText}
      type={pending?.type}
    />
  );

  return { confirm: setPending as (options: ConfirmOptions) => void, confirmDialog };
};

export default useConfirmDialog;
