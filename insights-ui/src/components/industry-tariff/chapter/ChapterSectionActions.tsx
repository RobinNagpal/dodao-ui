'use client';

import type { InitTariffUpdatesResponse } from '@/app/api/industry-tariff-reports/chapters/[chapterSlug]/init-tariff-updates/route';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// One-shot regenerate action: fire-and-refresh against a single chapter
// generate route. The `apiPath` is the path segment under
// `/api/industry-tariff-reports/chapters/<slug>/`.
interface SimpleChapterAction {
  kind: 'simple';
  key: string;
  label: string;
  apiPath: string;
  modalTitle: string;
  confirmationText: string;
  successMessage: string;
  // Optional JSON body to POST; defaults to `{}`. Use when the target route
  // expects a discriminator like `{ section: ReportType.X }`.
  body?: Record<string, unknown>;
}

// Special case for the tariff-updates regenerate. The bundled
// `generate-tariff-updates` chain blew past Vercel's function timeout when
// run server-side, so admin-triggered regeneration calls `init-tariff-updates`
// (top-5 country lookup via trade-analytics aggregation, no LLM) and then
// fans out one POST to `generate-tariff-updates` per country. Each fan-out
// request is a single LLM call.
interface TariffFanoutChapterAction {
  kind: 'tariff-updates-fanout';
  key: string;
  label: string;
  modalTitle: string;
  confirmationText: string;
  successMessage: string;
}

export type ChapterSectionAction = SimpleChapterAction | TariffFanoutChapterAction;

interface ChapterSectionActionsProps {
  chapterSlug: string;
  actions: ChapterSectionAction[];
}

export default function ChapterSectionActions({ chapterSlug, actions }: ChapterSectionActionsProps): JSX.Element | null {
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const [pendingAction, setPendingAction] = useState<ChapterSectionAction | null>(null);

  const { postData, loading: isPosting } = usePostData<unknown, unknown>({
    successMessage: '',
    errorMessage: 'Regeneration failed. Check the server logs.',
  });
  const { postData: postInit, loading: isInitting } = usePostData<InitTariffUpdatesResponse, { date?: string }>({
    successMessage: '',
    errorMessage: 'Failed to initialise tariff updates.',
  });
  const { postData: postCountry, loading: isPostingCountry } = usePostData<unknown, { countryName: string }>({
    successMessage: '',
    errorMessage: 'Failed to regenerate one or more country tariffs.',
  });

  const isWorking = isPosting || isInitting || isPostingCountry;

  if (actions.length === 0) return null;

  const handleConfirm = async (): Promise<void> => {
    if (!pendingAction) return;

    if (pendingAction.kind === 'simple') {
      const result = await postData(`${getBaseUrl()}/api/industry-tariff-reports/chapters/${chapterSlug}/${pendingAction.apiPath}`, pendingAction.body ?? {});
      setPendingAction(null);
      if (result !== undefined) {
        showNotification({ type: 'success', message: pendingAction.successMessage });
        router.refresh();
      }
      return;
    }

    // tariff-updates-fanout
    const initUrl = `${getBaseUrl()}/api/industry-tariff-reports/chapters/${chapterSlug}/init-tariff-updates`;
    const init = await postInit(initUrl, {});
    if (!init) {
      setPendingAction(null);
      return;
    }

    const countryUrl = `${getBaseUrl()}/api/industry-tariff-reports/chapters/${chapterSlug}/generate-tariff-updates`;
    const failures: string[] = [];
    for (const country of init.countries) {
      const result = await postCountry(countryUrl, { countryName: country });
      if (result === undefined) failures.push(country);
    }

    setPendingAction(null);
    if (failures.length === init.countries.length) {
      showNotification({ type: 'error', message: `All countries failed: ${failures.join(', ')}` });
      return;
    }
    if (failures.length > 0) {
      showNotification({ type: 'info', message: `Partial success — failed for: ${failures.join(', ')}` });
    } else {
      showNotification({ type: 'success', message: pendingAction.successMessage });
    }
    router.refresh();
  };

  const items: EllipsisDropdownItem[] = actions.map((a) => ({ key: a.key, label: a.label }));

  return (
    <>
      <EllipsisDropdown
        items={items}
        onSelect={async (key) => {
          const action = actions.find((a) => a.key === key);
          if (action) setPendingAction(action);
        }}
      />
      {pendingAction && (
        <ConfirmationModal
          open={true}
          onClose={() => setPendingAction(null)}
          onConfirm={handleConfirm}
          title={pendingAction.modalTitle}
          confirmationText={pendingAction.confirmationText}
          confirming={isWorking}
          askForTextInput={false}
        />
      )}
    </>
  );
}
