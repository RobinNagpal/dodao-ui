import { Space } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

export function useDeleteClickableDemo(space: Space, demoId: string) {
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();
  async function handleDeletion() {
    try {
      const response = await fetch(`/api/${space.id}/clickable-demos/${demoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          demoId: demoId,
        }),
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Clickable Demo Deleted successfully!',
        });
      } else {
        console.log(response.body);
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      console.error(e);

      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    }
  }
  return {
    handleDeletion,
  };
}
