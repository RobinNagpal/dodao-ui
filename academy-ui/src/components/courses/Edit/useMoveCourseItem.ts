import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useI18 } from '@/hooks/useI18';
import { MoveCourseItemDirection } from '@dodao/web-core/types/deprecated/models/enums';
import { useState } from 'react';

export function useMoveCourseItem<
  T extends {
    direction: MoveCourseItemDirection | string;
  }
>(doMove: (form: T) => Promise<Response>) {
  const { showNotification } = useNotificationContext();
  const [movingUp, setMovingUp] = useState(false);
  const [movingDown, setMovingDown] = useState(false);
  const { $t } = useI18();

  async function moveItem(form: T) {
    if (form.direction === MoveCourseItemDirection.Up) {
      setMovingUp(true);
    } else {
      setMovingDown(true);
    }
    try {
      const updated = await doMove(form);
      if (updated) {
        showNotification({ type: 'success', message: $t('notify.saved'), heading: 'Success 🎉' });
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
      setMovingUp(false);
      setMovingDown(false);
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      setMovingUp(false);
      setMovingDown(false);
    }
  }

  return {
    movingUp,
    movingDown,
    moveItem,
  };
}
