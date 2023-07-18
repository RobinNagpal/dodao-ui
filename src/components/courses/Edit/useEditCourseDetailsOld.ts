import { useNotificationContext } from '@/contexts/NotificationContext';
import { CourseDetailsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { useState } from 'react';

export function useEditCourseDetailsOld<T>(
  course: CourseDetailsFragment,
  form: T,
  initialize: (course: CourseDetailsFragment) => void,
  doSave: (form: T) => Promise<boolean>,
) {
  const { showNotification } = useNotificationContext();
  const [editMode, setEditMode] = useState(false);
  const [upserting, setUpserting] = useState(false);
  const { $t } = useI18();
  function showEdit() {
    initialize(course);
    setEditMode(true);
  }

  function updateField(field: keyof T, content: string) {
    form = {
      ...form,
      [field]: content && Array.isArray(content) ? [...content] : (content as any),
    };
  }

  function cancel() {
    setEditMode(false);
  }

  async function save() {
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
    updateField,
    cancel,
    save,
  };
}
