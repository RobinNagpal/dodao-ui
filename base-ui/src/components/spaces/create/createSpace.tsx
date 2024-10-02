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

interface CreateSpaceProps {
  space: Space;
}

export default function CreateSpace({ space }: CreateSpaceProps) {
  const [project, setProject] = useState('');
  const [upserting, setUpserting] = useState(false);
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  const session = useSession();
  console.log('session', session);
  const { data: clientSession } = session as { data: Session | null };

  const upsertSpaceParams: Space = {
    id: slugify(project) + '-' + uuidv4().toString().substring(0, 4),
    adminUsernamesV1: space?.adminUsernamesV1!,
    authSettings: space?.authSettings!,
    avatar: space?.avatar!,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: clientSession?.username!,
    domains: space?.domains!,
    features: space?.features!,
    name: project,
    themeColors: space?.themeColors!,
    verified: true,
  };

  const upsertSpace = async () => {
    try {
      setUpserting(true);
      const response = await fetch('/api/space/upsert', {
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
      // Process response here
      console.log('Space created Successful', response);
      showNotification({ type: 'success', message: 'Space created successfully' });
      //   router.push('/homepage');
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
      // Process response here
      console.log('User Space update Successful', response);
      showNotification({ type: 'success', message: 'User Space updated successfully' });
      router.push('/homepage');
    } catch (error: any) {
      console.error('User Space updation Failed:', error);
      showNotification({ type: 'error', message: 'Error while updating the user space' });
    }
  };

  const onSubmit = async () => {
    await upsertSpace();
    await updateSpaceOfUser();
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
    </section>
  );
}
