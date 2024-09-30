'use client';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { CreateSpaceRequest } from '@/types/request/CreateSpaceRequest';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CreateSpaceProps {
  space: SpaceWithIntegrationsFragment;
}

function CreateSpace({ space }: CreateSpaceProps) {
  const [project, setProject] = useState('');
  const [upserting, setUpserting] = useState(false);
  const [isSpaceCreated, setIsSpaceCreated] = useState(false);
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  const { data: clientSession } = useSession() as { data: Session | null };

  const createSpaceParams: CreateSpaceRequest = {
    // id: slugify(project) + '-' + uuidv4().toString().substring(0, 4),
    id: slugify(project),
    name: project,
  };

  const onSubmit = async () => {
    try {
      setUpserting(true);
      const response = await fetch(`/api/${createSpaceParams.id}/actions/spaces/new-tidbit-space`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceData: createSpaceParams,
          userId: clientSession?.userId!,
        }),
      });
      setUpserting(false);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('Space created and user space updated successfully', response);
      setIsSpaceCreated(true);
      showNotification({ type: 'success', message: 'Space created and user space updated successfully' });
    } catch (error: any) {
      console.error('Space creation and user space updation failed:', error);
      showNotification({ type: 'error', message: 'Error while creating the space or updating user space' });
    }
  };

  return (
    <section className="h-full flex items-center justify-center pt-36" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="w-[600px]">
        <div className="p-6">
          <div className="space-y-12 text-left p-6">
            <div className="">
              <h2 className="font-semibold leading-7 text-3xl text-center pb-8">Create Space</h2>

              <Input label="Project Name" modelValue={project} onUpdate={(value) => setProject(value?.toString() || '')} />
            </div>
          </div>
          <div className="p-6 flex items-center justify-end gap-x-6">
            <Button
              variant="contained"
              primary
              loading={upserting}
              onClick={async () => {
                await onSubmit();
              }}
            >
              Create Space
            </Button>
          </div>
        </div>
      </div>
      {isSpaceCreated && (
        <FullPageModal open={true} onClose={() => {}} title={''}>
          <div className="flex flex-col items-center p-8 rounded-lg shadow-md pb-16">
            <div className="text-center">
              <h1 className="text-xl font-semibold">Space Created Successfully</h1>
              <p className="mt-4 text-md">
                Your space is created. Click{' '}
                <a
                  href={`http://${createSpaceParams.id}.${window.location.hostname}:${window.location.port}/spaces/finish-space-setup`}
                  className="text-blue-500 underline"
                  rel="noopener noreferrer"
                >
                  here
                </a>{' '}
                to go to your space
              </p>
            </div>
          </div>
        </FullPageModal>
      )}
    </section>
  );
}

export default CreateSpace;
