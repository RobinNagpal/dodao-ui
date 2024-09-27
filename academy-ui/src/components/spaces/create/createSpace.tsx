'use client';
import { useRouter } from 'next/navigation';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { Space } from '@prisma/client';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useSession } from 'next-auth/react';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface CreateSpaceProps {
  space: Space;
}

function CreateSpace({ space }: CreateSpaceProps) {
  const [project, setProject] = useState('');
  const [upserting, setUpserting] = useState(false);
  const [isSpaceCreated, setIsSpaceCreated] = useState(false);
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  const { data: clientSession } = useSession() as { data: Session | null };

  console.log('cleint session', clientSession);
  console.log('dawood space', space);

  const upsertSpaceParams: Space = {
    id: slugify(project) + '-' + uuidv4().toString().substring(0, 4),
    adminUsernamesV1: space?.adminUsernamesV1!,
    authSettings: space?.authSettings!,
    avatar: space?.avatar!,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: clientSession?.username!,
    domains: space?.domains!,
    features: [],
    name: project,
    themeColors: null,
    verified: true,
    type: 'TidbitsSite',
    skin: '',
    admins: [],
    adminUsernames: [],
    inviteLinks: null,
    discordInvite: null,
    telegramInvite: null,
    botDomains: [],
    guideSettings: {},
    socialSettings: {},
    byteSettings: {},
    tidbitsHomepage: null,
  };

  const upsertSpace = async () => {
    console.log('dawood upsert space params: ', upsertSpaceParams);
    console.log('dawood cleint session: ', clientSession);
    try {
      setUpserting(true);
      const response = await fetch('/api/spaces/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...upsertSpaceParams }),
      });
      setUpserting(false);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('Space created Successful', response);
      showNotification({ type: 'success', message: 'Space created successfully' });
    } catch (error: any) {
      console.error('Space creation Failed:', error);
      showNotification({ type: 'error', message: 'Error while creating the space' });
    }
  };

  const updateSpaceOfUser = async () => {
    try {
      const response = await fetch('/api/user/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: clientSession?.userId, spaceId: upsertSpaceParams.id }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('User Space update Successful', response);
      showNotification({ type: 'success', message: 'User Space updated successfully' });
      setIsSpaceCreated(true);
      // router.push('/');
    } catch (error: any) {
      console.error('User Space updation Failed:', error);
      showNotification({ type: 'error', message: 'Error while updating the user space' });
    }
  };

  const onSubmit = async () => {
    try {
      await upsertSpace();
      await updateSpaceOfUser();
    } catch (error) {
      console.error('Error during space creation:', error);
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
                  href={`http://${upsertSpaceParams.id}-${window.location.hostname}:${window.location.port}/spaces/setup`}
                  className="text-blue-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>{' '}
                to go to you space
              </p>
            </div>
          </div>
        </FullPageModal>
      )}
    </section>
  );
}

export default CreateSpace;
