import React from 'react';
import { FormGenerator } from '@/shared/components/ui/Forms';
import type { FormField } from '@/shared/components/ui/Forms';
import { Modal, Button } from '@/shared/components/ui';
import quickEntryConfig from '../form-config/quickEntryForm.json';

interface DashboardQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

export const DashboardQuickModal: React.FC<DashboardQuickModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Activity"
      size="lg"
    >
      <div className="p-4">
        <FormGenerator
          fields={quickEntryConfig as FormField[]}
          onSubmit={(data) => {
            onSubmit(data);
            onClose();
          }}
          gridColumns={12}
          buttonPosition="bottom"
        >
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save Activity
            </Button>
          </div>
        </FormGenerator>
      </div>
    </Modal>
  );
};

export default DashboardQuickModal;

