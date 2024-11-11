'use client';

import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import getSubdomainUrl from '@dodao/web-core/utils/api/getSubdomainUrl';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormFooter } from '@dodao/web-core/components/app/Form/FormFooter';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Contexts } from '@dodao/web-core/utils/constants/constants';

interface CreateSpaceProps {
  upserting: boolean;
  onSubmit: (spaceData: { id: string; name: string }) => Promise<void>;
  createdSpace?: WebCoreSpace;
}

function CreateNewSpace({ upserting, onSubmit, createdSpace }: CreateSpaceProps) {
  const [project, setProject] = useState('');
  const router = useRouter();

  const { postData } = usePostData(
    {
      errorMessage: 'Failed to create token for space',
    },
    {}
  );

  const handleLinkClick = async () => {
    const projectSlug = slugify(project);
    const url = getSubdomainUrl(projectSlug);

    const verificationPath = await postData(`${getBaseUrl()}/api/${project}/verification-tokens`);
    router.push(`${url}${verificationPath}&context=${Contexts.finishSetup}`);
  };

  return (
    <div>
      {createdSpace ? (
        <FullPageModal
          open={true}
          onClose={() => {
            router.push(`/spaces/space-collections?updated=${Date.now()}`);
          }}
          title={''}
        >
          <div className="flex flex-col items-center p-8 rounded-lg shadow-md pb-16">
            <div className="text-center">
              <h1 className="text-xl font-semibold">Space Created Successfully</h1>
              <p className="mt-4 text-md">
                Your space is created. Click{' '}
                <span onClick={handleLinkClick} className="link-color underline cursor-pointer">
                  here
                </span>{' '}
                to go to your space
              </p>
            </div>
          </div>
        </FullPageModal>
      ) : (
        <section className="h-full flex items-center justify-center pt-36" style={{ backgroundColor: 'var(--bg-color)' }}>
          <div className="w-[600px] pt-12">
            <div className="space-y-12 text-left ">
              <h2 className="font-semibold leading-7 text-3xl text-center pb-8">Create Space</h2>
              <Input label="Project Name" modelValue={project} onUpdate={(value) => setProject(value?.toString() || '')} />
            </div>
            <FormFooter
              saveButtonText="Create Space"
              onSave={async () => {
                await onSubmit({
                  id: slugify(project),
                  name: project,
                });
              }}
              onSaveLoading={upserting}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default CreateNewSpace;
