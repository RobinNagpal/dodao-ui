import Input from '@dodao/web-core/components/core/input/Input';
import React from 'react';

interface ScoreInputProps {
  /** Current value as a string (controlled). Empty string means "no score". */
  value: string;
  onChange: (value: string) => void;
  /** Inclusive upper bound. ETF scores are 0-20, stock scores 0-25. */
  max?: number;
  disabled?: boolean;
}

/**
 * Labelled numeric input for a user's personal score. Extracted because the
 * exact same block was copy-pasted across the favourite/notes modals, which is
 * how a wrong "0-25" range slipped into the ETF screens (ETF scores are 0-20).
 * Centralising the range here keeps the label, bounds, and placeholder in sync.
 */
export default function ScoreInput({ value, onChange, max = 20, disabled = false }: ScoreInputProps) {
  const range = `0-${max}`;
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium whitespace-nowrap">My Score ({range}):</label>
      <div className="flex-1 max-w-xs">
        <Input
          modelValue={value}
          onUpdate={(v) => onChange(v?.toString() || '')}
          number={true}
          min={0}
          max={max}
          placeholder={range}
          className="bg-gray-800 border-gray-700 text-white w-full"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
