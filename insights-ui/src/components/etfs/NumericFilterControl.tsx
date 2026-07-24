'use client';

import React, { useState } from 'react';
import { NUMERIC_FILTER_OP_SYMBOLS, type NumericFilterOp, type ThresholdOption } from '@/utils/etf-filter-utils';

const OPS: ReadonlyArray<NumericFilterOp> = ['lt', 'eq', 'gt'];

interface OperatorSelectProps {
  value: NumericFilterOp;
  onChange: (op: NumericFilterOp) => void;
}

/** Segmented `<` `=` `>` selector. Reusable wherever a comparator is needed. */
export function OperatorSelect({ value, onChange }: OperatorSelectProps): JSX.Element {
  return (
    <div className="inline-flex shrink-0 overflow-hidden rounded border border-border">
      {OPS.map((op) => (
        <button
          key={op}
          type="button"
          aria-label={`Operator ${NUMERIC_FILTER_OP_SYMBOLS[op]}`}
          aria-pressed={value === op}
          onClick={() => onChange(op)}
          className={`w-7 py-1 text-sm font-bold leading-none transition-colors ${
            value === op ? 'bg-amber-500 text-black' : 'bg-surface-3 text-heading hover:bg-surface-3'
          }`}
        >
          {NUMERIC_FILTER_OP_SYMBOLS[op]}
        </button>
      ))}
    </div>
  );
}

type Mode = 'preset' | 'custom';

interface ParsedValue {
  mode: Mode;
  op: NumericFilterOp;
  num: string;
}

function parseValue(value: string): ParsedValue {
  const m = value.match(/^(gt|lt|eq):(.*)$/);
  if (m) return { mode: 'custom', op: m[1] as NumericFilterOp, num: m[2] };
  return { mode: 'preset', op: 'gt', num: '' };
}

interface NumericFilterControlProps {
  id: string;
  label: string;
  /** Current raw filter value: a bucket option value, `negative`, or `op:value`. */
  value: string;
  options: ReadonlyArray<ThresholdOption>;
  onChange: (value: string) => void;
  /** Optional hint shown under the custom input (e.g. "e.g. 1B, 500M"). */
  hint?: string;
}

/**
 * A numeric filter tile offering two interchangeable modes:
 *  - Preset: the existing bucket dropdown.
 *  - Custom: an operator (<, =, >) + value input, encoded as `op:value`.
 */
export default function NumericFilterControl({ id, label, value, options, onChange, hint }: NumericFilterControlProps): JSX.Element {
  const parsed = parseValue(value);
  const [mode, setMode] = useState<Mode>(parsed.mode);
  const [op, setOp] = useState<NumericFilterOp>(parsed.op);
  const [num, setNum] = useState<string>(parsed.num);

  const isActive = value !== '';

  const switchMode = (next: Mode): void => {
    if (next === mode) return;
    setMode(next);
    // Preset and custom are mutually exclusive encodings — reset when toggling.
    setNum('');
    onChange('');
  };

  const emitCustom = (nextOp: NumericFilterOp, nextNum: string): void => {
    setOp(nextOp);
    setNum(nextNum);
    const trimmed = nextNum.trim();
    onChange(trimmed === '' ? '' : `${nextOp}:${trimmed}`);
  };

  return (
    <div className={`rounded p-2 ${isActive ? 'bg-surface-2 ring-1 ring-amber-500' : 'bg-surface-2'}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="truncate text-xs text-muted" title={label}>
          {label}
        </label>
        <div className="inline-flex shrink-0 overflow-hidden rounded bg-surface-3 text-[10px]">
          {(['preset', 'custom'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => switchMode(m)}
              className={`px-1.5 py-0.5 font-medium capitalize transition-colors ${mode === m ? 'bg-amber-500 text-black' : 'text-body hover:bg-surface-3'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'preset' ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-border bg-surface-3 px-1.5 py-1 text-xs text-heading focus:border-transparent focus:ring-1 focus:ring-primary"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex items-center gap-1">
          <OperatorSelect value={op} onChange={(nextOp) => emitCustom(nextOp, num)} />
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={num}
            placeholder="Value"
            onChange={(e) => emitCustom(op, e.target.value)}
            className="w-full min-w-0 rounded border border-border bg-surface-3 px-1.5 py-1 text-xs text-heading focus:border-transparent focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {mode === 'custom' && hint && <p className="mt-1 text-[10px] text-muted">{hint}</p>}
    </div>
  );
}
