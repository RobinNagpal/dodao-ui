import Button from '@dodao/web-core/components/core/buttons/Button';
import Card from '@dodao/web-core/components/core/card/Card';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { shorten } from '@dodao/web-core/utils/utils';
import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon';
import TrashIcon from '@heroicons/react/20/solid/TrashIcon';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';
import LoadingIcon from '@dodao/web-core/components/core/loaders/LoadingIcon';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

interface SelectHtmlCaptureModalProps {
  showSelectHtmlCaptureModal: boolean;
  onClose: () => void;
  selectHtmlCapture: (htmlCapture: ClickableDemoHtmlCaptureDto) => void;
  demoId: string;
  spaceId: string;
}

interface DeleteCaptureModalState {
  isVisible: boolean;
  captureId: string | null;
  captureName: string | null;
  deleting: boolean;
}

export default function SelectHtmlCaptureModal(props: SelectHtmlCaptureModalProps) {
  const { selectHtmlCapture, demoId, showSelectHtmlCaptureModal, onClose, spaceId } = props;
  const [htmlCapturesResponse, setHtmlCapturesResponse] = useState<ClickableDemoHtmlCaptureDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotificationContext();

  const [selectedHtmlCaptureId, setSelectedHtmlCaptureId] = useState<string | null>(null);
  const [deleteCaptureModalState, setDeleteCaptureModalState] = React.useState<DeleteCaptureModalState>({
    isVisible: false,
    captureId: null,
    captureName: null,
    deleting: false,
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios.get(`${getBaseUrl()}/api/${spaceId}/html-captures`, {
        params: { clickableDemoId: demoId },
      });
      setHtmlCapturesResponse(response.data);
      setLoading(false);
    }
    fetchData();
  }, [demoId]);

  const { deleteData } = useDeleteData<void, {}>(
    {},
    {
      successMessage: 'Capture Archived Successfully',
      errorMessage: 'Failed to archive the capture. Please try again.',
    }
  );

  const availableHtmlCaptures = htmlCapturesResponse || [];

  function openCaptureDeleteModal(captureId: string, captureName: string) {
    setDeleteCaptureModalState({ isVisible: true, captureId: captureId, captureName, deleting: false });
  }

  function closeCaptureDeleteModal() {
    setDeleteCaptureModalState({ isVisible: false, captureId: null, captureName: null, deleting: false });
  }

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
        <div className="text-center min-h-[40vh] flex justify-center items-center">
          <LoadingIcon />
        </div>
      ) : (
        <div className="min-h-[40vh]">
          <Grid4Cols className="p-16 text-color">
            {availableHtmlCaptures.map((htmlCapture) => (
              <div key={htmlCapture.id}>
                <Card onClick={() => handleCardClick(htmlCapture)}>
                  <div className="cursor-pointer">
                    <div className="p-2 text-center">
                      <img src={htmlCapture.fileImageUrl} alt={htmlCapture.fileName} />
                    </div>
                  </div>
                  {/* Delete Icon */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => openCaptureDeleteModal(htmlCapture.id, htmlCapture.fileName)}
                      className="text-gray-500 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <TrashIcon height={24} width={24} />
                    </button>
                  </div>
                  {selectedHtmlCaptureId === htmlCapture.id && (
                    <div className="flex flex-wrap absolute justify-end top-1 left-1">
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
        </div>
      )}

      {deleteCaptureModalState.isVisible && (
        <DeleteConfirmationModal
          title={`Delete Capture - ${deleteCaptureModalState.captureName}`}
          open={deleteCaptureModalState.isVisible}
          onClose={closeCaptureDeleteModal}
          deleting={deleteCaptureModalState.deleting}
          onDelete={async () => {
            if (!deleteCaptureModalState.captureId) {
              showNotification({ message: 'Some Error occurred', type: 'error' });
              closeCaptureDeleteModal();
              return;
            }
            await deleteData(`${getBaseUrl()}/api/${spaceId}/html-captures/${deleteCaptureModalState.captureId}`);
            setHtmlCapturesResponse(htmlCapturesResponse.filter((capture) => capture.id !== deleteCaptureModalState.captureId));
            closeCaptureDeleteModal();
          }}
        />
      )}
    </FullPageModal>
  );
}
