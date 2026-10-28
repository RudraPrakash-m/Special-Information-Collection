import React, { useMemo } from 'react';
import { Plus, Trash2, AlertTriangle, UserCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { MultiSelect, type Option } from '@/shared/components/ui/Forms';
import FieldInfoTooltip from './FieldInfoTooltip';
import type { ApprovalLevel, HedAdminUser } from '../types/createCollection.types';

interface ApprovalLevelsBuilderProps {
  levels: ApprovalLevel[];
  availableAdmins: HedAdminUser[];
  onChange: (levels: ApprovalLevel[]) => void;
  error?: string;
}

export const ApprovalLevelsBuilder: React.FC<ApprovalLevelsBuilderProps> = ({
  levels,
  availableAdmins,
  onChange,
  error,
}) => {
  // Map of which user is assigned to which level
  const userAssignedInLevel = useMemo(() => {
    const map: Record<string, number> = {};
    levels.forEach((lvl) => {
      lvl.assignedUserIds.forEach((uid: string) => {
        map[uid] = lvl.levelNumber;
      });
    });
    return map;
  }, [levels]);

  const handleAddLevel = () => {
    if (levels.length >= 3) return;
    const newLevelNum = levels.length + 1;
    const defaultTitles = [
      'Level 1: Verification',
      'Level 2: Scrutiny',
      'Level 3: Final Approval',
    ];
    const newLevel: ApprovalLevel = {
      levelNumber: newLevelNum,
      levelName: defaultTitles[newLevelNum - 1] || `Level ${newLevelNum}`,
      assignedUserIds: [],
    };
    onChange([...levels, newLevel]);
  };

  const handleRemoveLevel = (index: number) => {
    if (levels.length <= 1) return;
    const filtered = levels.filter((_, idx) => idx !== index);
    const renumbered = filtered.map((lvl, idx) => ({
      ...lvl,
      levelNumber: idx + 1,
    }));
    onChange(renumbered);
  };

  const handleStageNameChange = (levelIndex: number, newName: string) => {
    const updated = [...levels];
    updated[levelIndex].levelName = newName;
    onChange(updated);
  };

  const handleVerifiersChange = (levelIndex: number, selectedIds: (string | number)[]) => {
    const updated = [...levels];
    updated[levelIndex].assignedUserIds = selectedIds.map(String);
    onChange(updated);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Sub-header with Add Next Level */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <UserCheck size={18} className="text-amber-500" />
            Approval Levels Configuration (1 to 3 Levels)
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assign active HED Admin verifiers per level. A verifier cannot be assigned to more than one level.
          </p>
        </div>

        {levels.length < 3 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus size={14} />}
            onClick={handleAddLevel}
          >
            Add Next Level
          </Button>
        )}
      </div>

      {/* Validation Error Notice */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertTriangle size={15} className="flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Grid Structure for Each Level (4-Column Layout, No Table) */}
      <div className="space-y-3">
        {levels.map((level, lvlIdx) => {
          // Prepare options with disabled label for users assigned in other levels
          const adminOptions: Option[] = availableAdmins.map((admin) => {
            const assignedLevel = userAssignedInLevel[admin.id];
            const isAssignedElsewhere = assignedLevel !== undefined && assignedLevel !== level.levelNumber;

            return {
              value: admin.id,
              label: isAssignedElsewhere
                ? `${admin.name} (Assigned in Level ${assignedLevel})`
                : `${admin.name} — ${admin.designation}`,
              disabled: isAssignedElsewhere,
            };
          });

          return (
            <div
              key={level.levelNumber}
              className="p-4 rounded-lg border border-border/80 bg-muted/5 dark:bg-muted/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-start">
                {/* Field 1: Level Indicator (1 Column) */}
                <div>
                  <label className="ui-label select-none">
                    Level
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`Level ${level.levelNumber}`}
                    className="ui-field bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/90 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 font-bold cursor-not-allowed select-none"
                  />
                </div>

                {/* Field 2: Stage Name with Info Tooltip (1 Column) */}
                <div>
                  <FieldInfoTooltip
                    label="Stage Name"
                    required={true}
                    tooltipText="Descriptive stage designation for this verification level."
                    exampleText={
                      level.levelNumber === 1
                        ? 'Level 1: Verification'
                        : level.levelNumber === 2
                        ? 'Level 2: Scrutiny'
                        : 'Level 3: Final Approval'
                    }
                  />
                  <input
                    type="text"
                    value={level.levelName}
                    onChange={(e) => handleStageNameChange(lvlIdx, e.target.value)}
                    placeholder=""
                    className="ui-field"
                  />
                </div>

                {/* Field 3: Assigned Verifiers MultiSelect (1 Column - reduced width) */}
                <div>
                  <MultiSelect
                    label="Assigned Verifiers"
                    required={true}
                    options={adminOptions}
                    value={level.assignedUserIds}
                    onChange={(selected) => handleVerifiersChange(lvlIdx, selected)}
                    placeholder="- Select Verifiers -"
                    wrapperClassName="w-full"
                  />
                </div>

                {/* Field 4: Action (1 Column) */}
                <div>
                  <label className="ui-label select-none">
                    Action
                  </label>
                  {levels.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-[calc(var(--control-h)*0.9)] text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
                      icon={<Trash2 size={14} />}
                      onClick={() => handleRemoveLevel(lvlIdx)}
                    >
                      Remove Level
                    </Button>
                  ) : (
                    <div className="w-full h-[calc(var(--control-h)*0.9)] flex items-center justify-center rounded border border-dashed border-border bg-muted/20 text-xs text-muted-foreground italic select-none">
                      Default (Required)
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalLevelsBuilder;
