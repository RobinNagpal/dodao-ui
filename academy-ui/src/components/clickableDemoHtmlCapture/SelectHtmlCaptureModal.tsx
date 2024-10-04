import Button from '@dodao/web-core/components/core/buttons/Button';
import Card from '@dodao/web-core/components/core/card/Card';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { shorten } from '@dodao/web-core/utils/utils';
import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';

interface SelectHtmlCaptureModalProps {
  showSelectHtmlCaptureModal: boolean;
  onClose: () => void;
  selectHtmlCapture: (htmlCapture: ClickableDemoHtmlCaptureDto) => void;
  demoId: string;
  spaceId: string;
}

export default function SelectHtmlCaptureModal(props: SelectHtmlCaptureModalProps) {
  const { selectHtmlCapture, demoId, showSelectHtmlCaptureModal, onClose, spaceId } = props;
  const [htmlCapturesResponse, setHtmlCapturesResponse] = useState<ClickableDemoHtmlCaptureDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedHtmlCaptureId, setSelectedHtmlCaptureId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios.get(`${getBaseUrl()}/api/${spaceId}/html-captures/${demoId}`);
      setHtmlCapturesResponse(response.data);
      setLoading(false);
    }
    fetchData();
  }, [demoId]);

  const availableHtmlCaptures = htmlCapturesResponse || [];

  const handleCardClick = (htmlCapture: ClickableDemoHtmlCaptureDto) => {
    // When a new capture is clicked, deselect the previous one
    if (selectedHtmlCaptureId === htmlCapture.id) {
      setSelectedHtmlCaptureId(null);
    } else {
      setSelectedHtmlCaptureId(htmlCapture.id);
    }
  };

  return (
    <FullPageModal open={showSelectHtmlCaptureModal} onClose={onClose} title={'Select HTML Capture'}>
      {loading ? (
        <FullPageLoader />
      ) : (
        <>
          <Grid4Cols className="p-16 text-color">
            {availableHtmlCaptures.map((htmlCapture) => (
              <div key={htmlCapture.id}>
                <Card onClick={() => handleCardClick(htmlCapture)}>
                  <div className="cursor-pointer">
                    <div className="p-2 text-center">
                      <img src={htmlCapture.fileImageUrl} alt={htmlCapture.fileName} />
                    </div>
                  </div>
                  {selectedHtmlCaptureId === htmlCapture.id && (
                    <div className="flex flex-wrap absolute justify-end top-1 right-1">
                      <div className={`m-auto rounded-full text-2xl bg-primary w-6 h-6 text-white flex items-center font-bold justify-center`}>
                        <CheckCircleIcon height={30} width={30} />
                      </div>
                    </div>
                  )}
                </Card>
                <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis mt-2">{shorten(htmlCapture.fileName, 32)}</h2>
              </div>
            ))}
          </Grid4Cols>

          <Button
            variant="contained"
            primary
            onClick={() => {
              const selectedCapture = availableHtmlCaptures.find((capture) => capture.id === selectedHtmlCaptureId);
              if (selectedCapture) {
                selectHtmlCapture(selectedCapture);
              }
              onClose();
            }}
            disabled={!selectedHtmlCaptureId}
          >
            Select HTML Capture
          </Button>
        </>
      )}
    </FullPageModal>
  );
}
