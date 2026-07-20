'use client';

import { GenerationRequestWithFlags } from '@/app/admin-v1/generation-requests/GenerationRequestsTable';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import React from 'react';

interface ReloadRequestModalProps {
  open: boolean;
  request: GenerationRequestWithFlags | null;
  onClose: () => void;
  onReloadFailedPartsOnly: () => void;
  onReloadFullRequest: () => void;
}

/** Prompt to re-queue a failed request, either just the failed steps or the whole ticker. */
export default function ReloadRequestModal({ open, request, onClose, onReloadFailedPartsOnly, onReloadFullRequest }: ReloadRequestModalProps): JSX.Element {
  return (
    <FullScreenModal open={open} onClose={onClose} title="Reload Generation Request">
      <div className="p-4">
        {request && (
          <>
            <p className="mb-4">
              How would you like to reload the generation request for{' '}
              <strong>
                {request.ticker.symbol} <span className="text-blue-400">({request.ticker.exchange})</span>
              </strong>
              ?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Button variant="contained" onClick={onReloadFailedPartsOnly} className="w-full">
                Reload Failed Parts Only ({request.failedSteps?.length || 0} steps)
              </Button>

              <Button variant="outlined" onClick={onReloadFullRequest} className="w-full">
                Reload Full Request
              </Button>
            </div>
          </>
        )}
      </div>
    </FullScreenModal>
  );
}
