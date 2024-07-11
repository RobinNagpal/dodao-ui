import { Space, useDeleteClickableDemoMutation } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

export function useDeleteClickableDemo(space: Space, demoId: string) {
  const router = useRouter();
  const [deleteClickableDemoMutation] = useDeleteClickableDemoMutation();
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();
  async function handleDeletion() {
    try {
      const response = await deleteClickableDemoMutation({
        variables: {
          spaceId: space.id,
          demoId: demoId,
        },
        errorPolicy: 'all',
      });

      const payload = response?.data?.payload;
      if (payload) {
        showNotification({
          type: 'success',
          message: 'Clickable Demo Deleted successfully!',
        });
        router.push('/clickable-demos');
      } else {
        console.log(response.errors);
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
