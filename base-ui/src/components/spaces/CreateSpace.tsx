'use client';

import { CreateSpaceRequest } from '@/types/request/CreateSpaceRequest';
import CreateNewSpace from '@dodao/web-core/ui/auth/signup/components/CreateNewSpace';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BaseSpace } from '@prisma/client';
import { useState } from 'react';

interface CreateSpaceProps {
  space: BaseSpace;
}

function CreateSpace({ space }: CreateSpaceProps) {
  const [upserting, setUpserting] = useState(false);
  const [isSpaceCreated, setIsSpaceCreated] = useState(false);
  const { showNotification } = useNotificationContext();

  const onSubmit = async (req: CreateSpaceRequest) => {
    try {
      setUpserting(true);
      const response = await fetch(`${getBaseUrl()}/api/actions/spaces/new-tidbit-space`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
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

  return <CreateNewSpace onSubmit={onSubmit} upserting={upserting} createdSpace={isSpaceCreated ? space : undefined} />;
}

export default CreateSpace;
