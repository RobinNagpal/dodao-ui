import ViewCriteriaModal from '@/components/criteria/ViewCriteriaModal';
import { CriteriaLookupItem, CreateCustomCriteriaRequest } from '@/types/criteria/criteria';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useState } from 'react';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { PlusIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';

interface UpsertCustomCriteriaProps {
  item: CriteriaLookupItem;
  onPostUpsertCustomCriteria: () => void;
}

export default function UpsertCustomCriteria({ item, onPostUpsertCustomCriteria }: UpsertCustomCriteriaProps) {
  const [updating, setUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showViewCriteriaModal, setShowViewCriteriaModal] = useState(false);
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
  const router = useRouter();

  const { data, loading, postData } = usePostData<{ message: string }, CreateCustomCriteriaRequest>({
    errorMessage: 'Failed to copy AI criteria',
  });
  const handleCopyAICriteria = async () => {
    setUpdating(true);
    setShowConfirmModal(false);
    await postData(`${baseURL}/api/public-equities/US/copy-ai-criteria`, {
      industryGroupId: item.industryGroupId,
      sectorId: item.sectorId,
    });
    setUpdating(false);
    onPostUpsertCustomCriteria();
  };

  return (
    <div className="flex items-center gap-2">
                   
       {!item.customCriteriaFileUrl ? (
                      <div className="flex justify-center items-center gap-2">
                        <Link href={`/public-equities/industry-group-criteria/${slugify(item.sectorName)}/${slugify(item.industryGroupName)}/create`}>
                          <PlusIcon width={20} height={20} className="ml-2 link-color cursor-pointer" />
                        </Link>
                        {
                          item.aiCriteriaFileUrl && (
                            <span
                          onClick={() => {
                            setShowConfirmModal(true);
                          }}
                          className="link-color cursor-pointer mt-2"
                        >
                          Copy AI Criteria
                        </span>
                          )
                        }
                        
                      </div>
                    ) : (
                      <>
                      <span
                        onClick={() => {
                          setShowViewCriteriaModal(true);
                        }}
                        className="link-color cursor-pointer mt-2"
                      >
                        View Custom Criteria
                    </span>
                    <IconButton className="link-color pointer-cursor" onClick={() => router.push(`/public-equities/industry-group-criteria/${slugify(item.sectorName)}/${slugify(item.industryGroupName)}/create`)} iconName={IconTypes.Edit} removeBorder={true} />
                    
                      </>
                    )}

      {showViewCriteriaModal && (
        <ViewCriteriaModal
          open={showViewCriteriaModal}
          onClose={() => setShowViewCriteriaModal(false)}
          title={item.industryGroupName}
          url={item.customCriteriaFileUrl!}
        />
      )}
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => handleCopyAICriteria()}
          confirming={updating}
          title="Copy AI Criteria"
          confirmationText="Are you sure you want to copy the AI criteria for this industry group?"
          askForTextInput={true}
        />
      )}
    </div>
  );
}
