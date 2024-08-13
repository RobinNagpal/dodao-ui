'use client';

import withSpace from '@/contexts/withSpace';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment, ByteCollectionFragment, Byte } from '@/graphql/generated/generated-types';

import SingleCardLayout from '@/layouts/SingleCardLayout';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

function EditTidbitCollectionSpace(props: { space: SpaceWithIntegrationsFragment; params: { tidbitCollectionId?: string[] } }) {
  const [data, setData] = useState<{ byteCollection?: ByteCollectionSummary }>({});
  const [bytesResponse, setBytesResponse] = useState<{ bytes: Byte[] } | null>(null);

  useEffect(() => {
    async function fetchData() {
      let response = await axios.get(`${getBaseUrl()}/api/byte/bytes`, {
        params: {
          spaceId: props.space.id,
        },
      });
      setBytesResponse(response.data);
      if (byteCollectionId) {
        const response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collection`, {
          params: {
            spaceId: props.space.id,
            byteCollectionId: byteCollectionId,
          },
        });
        setData(response.data);
      }
    }
    fetchData();
  }, [props.space.id]);

  const byteCollectionId = props.params.tidbitCollectionId?.[0] || null;

  async function upsertByteCollectionFn(byteCollection: EditByteCollection, byteCollectionId: string | null) {
    if (!byteCollectionId) {
      await fetch(`${getBaseUrl()}/api/byte-collection/create-byte-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            spaceId: props.space.id,
            name: byteCollection.name,
            description: byteCollection.description,
            byteIds: byteCollection.bytes?.map((byte) => byte.byteId),
            status: byteCollection.status,
            priority: byteCollection.priority,
            videoUrl: byteCollection.videoUrl,
          },
        }),
      });
    } else {
      await fetch(`${getBaseUrl()}/api/byte-collection/update-byte-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            byteCollectionId,
            name: byteCollection.name,
            description: byteCollection.description,
            byteIds: byteCollection.bytes?.map((byte) => byte.byteId),
            status: byteCollection.status,
            spaceId: props.space.id,
            priority: byteCollection.priority,
            videoUrl: byteCollection.videoUrl,
          },
        }),
      });
    }
  }
  const threeDotItems: EllipsisDropdownItem[] = [{ label: 'Delete', key: 'delete' }];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div tw="px-4 md:px-0 overflow-hidden">
          <Link href="/tidbit-collections" className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {'Back to Tidbit collections'}
          </Link>

          {byteCollectionId && (
            <PrivateEllipsisDropdown
              items={threeDotItems}
              onSelect={(key) => {
                if (key === 'delete') {
                  setShowDeleteModal(true);
                }
              }}
              className="float-right mr-0 z-5"
            />
          )}

          {showDeleteModal && (
            <DeleteConfirmationModal
              title={'Delete Byte Collection'}
              open={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onDelete={async () => {
                await fetch(`${getBaseUrl()}/api/byte-collection/delete-byte-collection`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    byteCollectionId: byteCollectionId!,
                  }),
                });
                setShowDeleteModal(false);
                router.push(`/tidbit-collections`);
                router.refresh();
              }}
            />
          )}
        </div>
        {bytesResponse?.bytes && (!byteCollectionId || data) ? (
          <ByteCollectionEditor
            space={props.space}
            byteCollection={data!.byteCollection}
            viewByteCollectionsUrl={'/tidbit-collections'}
            upsertByteCollectionFn={upsertByteCollectionFn}
          />
        ) : (
          <PageLoading />
        )}
      </SingleCardLayout>
    </PageWrapper>
  );
}

export default withSpace(EditTidbitCollectionSpace);
