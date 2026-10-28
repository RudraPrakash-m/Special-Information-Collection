import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Button } from '@/shared/components/ui';
import type { DraftSurvey } from '../types/createCollection.types';

interface CreateSurveyQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSurveyCreated: (newSurvey: DraftSurvey) => void;
}

export const CreateSurveyQuickModal: React.FC<CreateSurveyQuickModalProps> = ({
  isOpen,
  onClose,
  onSurveyCreated,
}) => {
  const [title, setTitle] = useState('');
  const [targetInstitutions, setTargetInstitutions] = useState('All Affiliated Degree Colleges');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Survey Title is required');
      return;
    }

    const newSurvey: DraftSurvey = {
      id: `SURV-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      himsModule: 'Special Information Collection',
      responderRole: 'Institution User only',
      publicationMethod: ['Portal'],
      allowResubmission: false,
      questionCount: Number(questionCount) || 1,
      targetInstitutions: targetInstitutions.trim() || 'All Registered Higher Education Institutions',
      startDate,
      endDate,
      reminderSettings: 'Weekly on Monday and 2 days before deadline',
      isLinkedToCollection: false,
    };

    onSurveyCreated(newSurvey);
    toast.success(`Draft survey "${newSurvey.title}" created with all required conditions!`);
    setTitle('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Survey Management → Create Draft Survey"
      size="lg"
    >
      <form onSubmit={handleSave} className="p-4 space-y-4">
        <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded border border-primary/20">
          This simulated Survey Management window pre-configures all mandatory survey conditions:
          <strong> Special Information Collection</strong> module, <strong>Institution User only</strong> responder role, <strong>Portal</strong> publication, and disabled resubmission.
        </p>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Survey Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Higher Education NIRF Ranking & Student Support Census"
            className="w-full text-sm px-3 py-2 rounded-md border bg-background"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Target Institutions
          </label>
          <input
            type="text"
            value={targetInstitutions}
            onChange={(e) => setTargetInstitutions(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-md border bg-background"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Questions Defined *
            </label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full text-sm px-3 py-2 rounded-md border bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-md border bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-md border bg-background"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Survey & Link
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSurveyQuickModal;

