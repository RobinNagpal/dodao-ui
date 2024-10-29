import Button from '@dodao/web-core/components/core/buttons/Button';
import Card from '@dodao/web-core/components/core/card/Card';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { shorten } from '@dodao/web-core/utils/utils';
import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon';
import TrashIcon from '@heroicons/react/20/solid/TrashIcon';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';
import LoadingIcon from '@dodao/web-core/components/core/loaders/LoadingIcon';
import { useDeleteData } from '@dodao/web-core/ui/hooks/useFetchUtils';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { DeleteClickableDemoHtmlCaptureRequest } from '@/types/request/ClickableDemoHtmlCaptureRequests';

interface SelectHtmlCaptureModalProps {
  showSelectHtmlCaptureModal: boolean;
  onClose: () => void;
  selectHtmlCapture: (htmlCapture: ClickableDemoHtmlCaptureDto) => void;
  demoId: string;
  spaceId: string;
}

interface DeleteItemModalState {
  isVisible: boolean;
  itemId: string | null;
  itemType: ClickableDemoHtmlCaptureDto | null;
  deleting: boolean;
}

export default function SelectHtmlCaptureModal(props: SelectHtmlCaptureModalProps) {
  const { selectHtmlCapture, demoId, showSelectHtmlCaptureModal, onClose, spaceId } = props;
  const [htmlCapturesResponse, setHtmlCapturesResponse] = useState<ClickableDemoHtmlCaptureDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotificationContext();

  const [selectedHtmlCaptureId, setSelectedHtmlCaptureId] = useState<string | null>(null);
    const [deleteItemModalState, setDeleteItemModalState] = React.useState<DeleteItemModalState>({
      isVisible: false,
      itemId: null,
      itemType: null,
      deleting: false,
    });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios.get(`${getBaseUrl()}/api/${spaceId}/html-captures/${demoId}`);
      setHtmlCapturesResponse(response.data);
      setLoading(false);
    }
    fetchData();
  }, [demoId]);

    const { deleteData } = useDeleteData<
      void,
      {
        itemId: string;
        itemType: ClickableDemoHtmlCaptureDto;
      }
    >(
      {},
      {
        successMessage: 'Item Archived Successfully',
        errorMessage: 'Failed to archive the item. Please try again.',
      }
    );

  const availableHtmlCaptures = htmlCapturesResponse || [];

  function openItemDeleteModal(itemId: string, itemType: ClickableDemoHtmlCaptureDto | null) {
    setDeleteItemModalState({ isVisible: true, itemId: itemId, itemType: itemType, deleting: false });
  }

  function closeItemDeleteModal() {
    setDeleteItemModalState({ isVisible: false, itemId: null, itemType: null, deleting: false });
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
                    <button onClick={(e) => openItemDeleteModal(htmlCapture.id, htmlCapture)} className="text-gray-500 hover:text-red-600" aria-label="Delete">
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

      {deleteItemModalState.isVisible && (
        <DeleteConfirmationModal
          title={`Delete HTML Capture`}
          open={deleteItemModalState.isVisible}
          onClose={closeItemDeleteModal}
          deleting={deleteItemModalState.deleting}
          onDelete={async () => {
            if (!deleteItemModalState.itemId || !deleteItemModalState.itemType) {
              showNotification({ message: 'Some Error occurred', type: 'error' });
              closeItemDeleteModal();
              return;
            }

            const deleteRequest: DeleteClickableDemoHtmlCaptureRequest = {
              itemId: deleteItemModalState.itemId,
              itemType: deleteItemModalState.itemType,
            };
            await deleteData(`${getBaseUrl()}/api/${spaceId}/html-captures`, deleteRequest);
            setHtmlCapturesResponse(htmlCapturesResponse.filter((item) => item.id !== deleteItemModalState.itemId));
            closeItemDeleteModal();
          }}
        />
      )}
    </FullPageModal>
  );
}
