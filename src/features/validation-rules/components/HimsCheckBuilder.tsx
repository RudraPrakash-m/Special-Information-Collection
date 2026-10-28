import React from 'react';
import { MOCK_HIMS_DATA_POINTS, type HimsCheckConfig, type HimsCheckType } from '../types/validationRules.types';
import FieldInfoTooltip from './FieldInfoTooltip';

interface HimsCheckBuilderProps {
  config: Partial<HimsCheckConfig>;
  onChange: (config: Partial<HimsCheckConfig>) => void;
  error?: string;
}

export const HimsCheckBuilder: React.FC<HimsCheckBuilderProps> = ({ config, onChange, error }) => {
  const handleFieldChange = (fieldId: string) => {
    const found = MOCK_HIMS_DATA_POINTS.find((dp) => dp.id === fieldId);
    if (!found) return;

    onChange({
      ...config,
      himsFieldId: found.id,
      himsFieldName: found.fieldName,
      checkType: found.type === 'number' ? 'figure_match' : 'existence',
      tolerancePercent: found.type === 'number' ? config.tolerancePercent ?? 5 : undefined,
    });
  };

  const handleTypeChange = (type: HimsCheckType) => {
    onChange({
      ...config,
      checkType: type,
      tolerancePercent: type === 'figure_match' ? config.tolerancePercent ?? 5 : undefined,
    });
  };

  const handleToleranceChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    onChange({
      ...config,
      tolerancePercent: clamped,
    });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-amber-200/80 bg-amber-50/30 dark:bg-amber-950/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-start">
        {/* HIMS Data Point Selector (5 columns) */}
        <div className="md:col-span-5">
          <FieldInfoTooltip
            label="HIMS Master Reference Field"
            required={true}
            tooltipText="Select the official HIMS institutional, academic, or faculty master data point to verify against."
            exampleText="AISHE Institutional Code or Total Enrolment"
          />
          <select
            value={config.himsFieldId || ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="ui-field text-xs truncate"
          >
            <option value="">- Select HIMS Master Field -</option>
            {MOCK_HIMS_DATA_POINTS.map((dp) => (
              <option key={dp.id} value={dp.id}>
                {dp.fieldName} ({dp.category})
              </option>
            ))}
          </select>
        </div>

        {/* Verification Check Mode (4 columns) */}
        <div className="md:col-span-4">
          <FieldInfoTooltip
            label="Verification Mode"
            required={true}
            tooltipText="Whether the answer must exist as a registered key code in HIMS, or match a reported numerical figure within a tolerance margin."
            exampleText="Figure Match within Tolerance %"
          />
          <select
            value={config.checkType || 'existence'}
            onChange={(e) => handleTypeChange(e.target.value as HimsCheckType)}
            className="ui-field text-xs"
          >
            <option value="existence">Master Record Existence (Must exist in HIMS)</option>
            <option value="figure_match">Numerical Figure Match (Within Tolerance %)</option>
          </select>
        </div>

        {/* Tolerance % Input (3 columns, visible only when figure_match) */}
        {config.checkType === 'figure_match' ? (
          <div className="md:col-span-3">
            <FieldInfoTooltip
              label="Allowed Tolerance % (0–100)"
              required={true}
              tooltipText="Permissible variance percentage between submitted figure and official HIMS portal records before rule triggers."
              exampleText="5"
            />
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={config.tolerancePercent ?? 5}
                onChange={(e) => handleToleranceChange(Number(e.target.value))}
                className="ui-field text-xs pr-7"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none">
                %
              </span>
            </div>
          </div>
        ) : (
          <div className="md:col-span-3">
            <label className="ui-label select-none">Tolerance Setting</label>
            <input
              type="text"
              readOnly
              value="Exact Match (0% deviation)"
              className="ui-field bg-muted/40 font-medium text-xs cursor-not-allowed select-none"
            />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  );
};

export default HimsCheckBuilder;

