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

interface HtmlCapture {
  id: string;
  clickable_demo_id: string;
  fileName: string;
  fileUrl: string;
  fileImageUrl: string;
  created_at: string;
}

interface SelectHtmlCaptureModalProps {
  showSelectHtmlCaptureModal: boolean;
  onClose: () => void;
  addHtmlCaptures: (htmlCaptures: HtmlCapture[]) => void;
  demoId: string;
  spaceId: string;
}

export default function SelectHtmlCaptureModal(props: SelectHtmlCaptureModalProps) {
  const { addHtmlCaptures, demoId, showSelectHtmlCaptureModal, onClose, spaceId } = props;
  const [htmlCapturesResponse, setHtmlCapturesResponse] = useState<HtmlCapture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [tempSelectedHtmlCaptureIds, setTempSelectedHtmlCaptureIds] = useState<string[]>([]);
  const [tempSelectedHtmlCaptures, setTempSelectedHtmlCaptures] = useState<HtmlCapture[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios.get(`${getBaseUrl()}/api/${spaceId}/html-captures/${demoId}`);
      setHtmlCapturesResponse(response.data);
      setLoading(false);
    }
    fetchData();
  }, [demoId]);
  console.log(htmlCapturesResponse);
  const availableHtmlCaptures = htmlCapturesResponse || [];
  console.log(availableHtmlCaptures);
  const handleCardClick = (htmlCapture: HtmlCapture) => {
    console.log(htmlCapture);
    if (tempSelectedHtmlCaptureIds.includes(htmlCapture.id)) {
      setTempSelectedHtmlCaptureIds(tempSelectedHtmlCaptureIds.filter((id) => id !== htmlCapture.id));
      setTempSelectedHtmlCaptures(tempSelectedHtmlCaptures.filter((capture) => capture.id !== htmlCapture.id));
    } else {
      setTempSelectedHtmlCaptureIds([...tempSelectedHtmlCaptureIds, htmlCapture.id]);
      setTempSelectedHtmlCaptures([...tempSelectedHtmlCaptures, htmlCapture]);
    }
  };

  return (
    <FullPageModal open={showSelectHtmlCaptureModal} onClose={onClose} title={'Select HTML Captures'}>
      {loading ? (
        <FullPageLoader />
      ) : (
        <>
          <Grid4Cols className="p-16 text-color">
            {availableHtmlCaptures.map((htmlCapture) => (
              <Card key={htmlCapture.id} onClick={() => handleCardClick(htmlCapture)}>
                <div className="cursor-pointer">
                  <div className="p-2 text-center">
                    <img src={htmlCapture.fileImageUrl} className="w-32 h-32" alt={htmlCapture.fileName}></img>
                    <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(htmlCapture.fileName, 32)}</h2>
                    <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(htmlCapture.fileUrl, 300)}</p>
                  </div>
                </div>
                {tempSelectedHtmlCaptureIds.includes(htmlCapture.id) && (
                  <div className="flex flex-wrap absolute justify-end top-1 right-1">
                    <div className={`m-auto rounded-full text-2xl bg-primary w-6 h-6 text-white flex items-center font-bold justify-center`}>
                      <CheckCircleIcon height={30} width={30} />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </Grid4Cols>

          <Button
            variant="contained"
            primary
            onClick={() => {
              addHtmlCaptures(tempSelectedHtmlCaptures);
              onClose();
            }}
          >
            Select HTML Captures
          </Button>
        </>
      )}
    </FullPageModal>
  );
}
