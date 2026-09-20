'use client';

import { AUTO_GEN_MARKETS_INFO } from '@/utils/auto-generation/auto-gen-config';
import { AutoGenMarkets } from '@/utils/auto-generation/auto-gen-models';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React from 'react';

interface MarketsFilterProps {
  selected: AutoGenMarkets;
  onChange: (markets: AutoGenMarkets) => void;
  disabled?: boolean;
}

/**
 * Two-way market selector for the upcoming-reports preview, mirroring the
 * `AUTOMATED_GENERATION_MARKETS` App Setting. Labels come from the same
 * `AUTO_GEN_MARKETS_INFO` map the App Settings screen renders, so the two screens
 * can't drift apart. Selecting here previews a queue; it does not change the setting.
 */
export default function MarketsFilter({ selected, onChange, disabled = false }: MarketsFilterProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted mr-1">Markets:</span>
      {Object.values(AutoGenMarkets).map((markets) => (
        <Button
          key={markets}
          variant={selected === markets ? 'contained' : 'outlined'}
          size="sm"
          onClick={() => onChange(markets)}
          disabled={disabled}
          className="text-xs"
        >
          {AUTO_GEN_MARKETS_INFO[markets].label}
        </Button>
      ))}
    </div>
  );
}
