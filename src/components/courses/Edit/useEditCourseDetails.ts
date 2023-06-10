import { useNotificationContext } from '@/contexts/NotificationContext';
import { useI18 } from '@/hooks/useI18';
import { useState } from 'react';

export function useEditCourseDetails<T>(doSave: (form: T) => Promise<boolean>) {
  const { showNotification } = useNotificationContext();
  const [editMode, setEditMode] = useState(false);
  const [upserting, setUpserting] = useState(false);
  const { $t } = useI18();

  function showEdit() {
    setEditMode(true);
  }

  function cancel() {
    setEditMode(false);
  }

  async function save(form: T) {
    setUpserting(true);
    try {
      const updated = await doSave(form);
      if (updated) {
        showNotification({ type: 'success', message: $t('notify.saved'), heading: 'Success 🎉' });
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
      setEditMode(false);
      setUpserting(false);
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      setUpserting(false);
    }
  }
  return {
    editMode,
    upserting,
    showEdit,
    cancel,
    save,
  };
}
