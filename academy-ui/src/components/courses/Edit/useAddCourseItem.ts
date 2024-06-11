import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useI18 } from '@/hooks/useI18';
import { useState } from 'react';

export function useAddCourseItem<T>(doAdd: (form: T) => Promise<boolean>) {
  const { showNotification } = useNotificationContext();
  const [adding, setAdding] = useState(false);
  const { $t } = useI18();

  async function addItem(form: T) {
    setAdding(true);
    try {
      const updated = await doAdd(form);
      if (updated) {
        showNotification({ type: 'success', message: $t('notify.saved'), heading: 'Success 🎉' });
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
      setAdding(false);
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      setAdding(false);
    }
  }

  return {
    adding,
    addItem,
  };
}
