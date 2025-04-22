import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { SaveTickerInfoRequest } from '@/types/public-equity/ticker-request-response';
import { parseMarkdown } from '@/util/parse-markdown';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface TickerInfoButtonProps {
  tickerKey: string;
  tickerInfoContent?: string;
  onUpdate: () => Promise<void>;
}

export default function TickerInfoButton({ tickerKey, tickerInfoContent: tickerInfoContentRaw, onUpdate }: TickerInfoButtonProps) {
  const [showTickerInfoModal, setShowTickerInfoModal] = useState(false);
  const [tickerInfoContent, setTickerInfoContent] = useState(tickerInfoContentRaw);
  const [showPreview, setShowPreview] = useState(false);
  const getMarkdownContent = (content?: string) => {
    return content ? parseMarkdown(content) : 'No Information';
  };

  const {
    putData: saveTickerInfo,
    loading: tickerInfoLoading,
    error: tickerInfoError,
  } = usePutData<string, SaveTickerInfoRequest>({
    errorMessage: 'Failed to save Ticker Info',
    successMessage: 'Ticker Info saved successfully',
    redirectPath: ``,
  });

  const handleSaveTickerInfo = async () => {
    await saveTickerInfo(`${getBaseUrl()}/api/tickers/${tickerKey}/ticker-info`, {
      tickerInfo: tickerInfoContent ?? '',
    });
    await onUpdate();
  };

  return (
    <div>
      <div className="flex justify-end">
        <Button primary onClick={() => setShowTickerInfoModal(true)}>
          Upsert Ticker Info
        </Button>
      </div>
      <FullPageModal open={showTickerInfoModal} onClose={() => setShowTickerInfoModal(false)} title={''}>
        <div className="min-h-[70vh]">
          <div className="flex justify-around items-center">
            <div>Ticker Info</div>
            <Button primary onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Editor' : 'Preview'}
            </Button>
            <Button loading={tickerInfoLoading} primary variant="contained" onClick={() => handleSaveTickerInfo()} disabled={tickerInfoLoading}>
              Save Ticker Info
            </Button>
          </div>
          <div>{tickerInfoError && <div className="text-red-500">{tickerInfoError}</div>}</div>
          <hr className="m-5" />
          <div className="max-h-[80vh] w-full text-left">
            {showPreview ? (
              <div className="p-5 h-full">
                <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(tickerInfoContent) }} />
              </div>
            ) : (
              <div className="p-5">
                <MarkdownEditor
                  label={``}
                  modelValue={tickerInfoContent}
                  placeholder="Event content"
                  onUpdate={(value) => setTickerInfoContent(value || '')}
                  objectId={'ticker-info'}
                  maxHeight={'70vh'}
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      </FullPageModal>
    </div>
  );
}
