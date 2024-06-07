import { useNotificationContext } from '@/contexts/NotificationContext';
import { useI18 } from '@/hooks/useI18';
import { useState } from 'react';

export function useDeleteCourseItem<T>(doDelete: (form: T) => Promise<boolean>) {
  const { showNotification } = useNotificationContext();
  const [deleting, setDeleting] = useState(false);
  const { $t } = useI18();

  async function deleteItem(form: T) {
    setDeleting(true);
    try {
      const updated = await doDelete(form);
      if (updated) {
        showNotification({ type: 'success', message: $t('notify.saved'), heading: 'Success 🎉' });
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
      setDeleting(false);
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      setDeleting(false);
    }
  }

  return {
    deleting,
    deleteItem,
  };
}
