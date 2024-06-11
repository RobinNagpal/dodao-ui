import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { SpaceWithIntegrationsFragment, useUpdateTidbitsHomepageMutation, TidbitsHomepage } from '@/graphql/generated/generated-types';
import { TidbitsHomepageError } from '@dodao/web-core/types/errors/error';
import { useI18 } from '@/hooks/useI18';
import { useState } from 'react';

export type UpdateTidbitsHompageHelper = {
  tidbitsHomepage: TidbitsHomepage;
  updating: boolean;
  tidbitsHomepageErrors: TidbitsHomepageError;
  updateHeading: (heading: string) => void;
  updateShortDescription: (shortDescription: string) => void;
  updateTidbitsHomepage: () => Promise<boolean>;
  validateTidbitsHomepage: () => boolean;
};

const tidbitHP: TidbitsHomepage = {
  heading: '',
  shortDescription: '',
};

export function useEditTidbitsHomepage(space: SpaceWithIntegrationsFragment): UpdateTidbitsHompageHelper {
  const [tidbitsHomepage, setTidbitsHomepage] = useState<TidbitsHomepage>(space.tidbitsHomepage || tidbitHP);
  const [updateTidbitsHomepageMutation] = useUpdateTidbitsHomepageMutation();
  const [updating, setUpdating] = useState(false);

  const [tidbitsHomepageErrors, setTidbitsHomepageErrors] = useState<TidbitsHomepageError>({});
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();

  function validateTidbitsHomepage() {
    const errors: TidbitsHomepageError = { ...tidbitsHomepageErrors };

    errors.heading = undefined;
    if (!tidbitsHomepage.heading) {
      errors.heading = true;
    }
    errors.shortDescription = undefined;
    if (!tidbitsHomepage.shortDescription) {
      errors.shortDescription = true;
    }

    setTidbitsHomepageErrors(errors);
    return Object.values(errors).filter((v) => !!v).length === 0;
  }

  const updateHeading = (heading: string) => {
    setTidbitsHomepage((prevTidbitsHomepage) => ({ ...prevTidbitsHomepage, heading }));
  };
  const updateShortDescription = (shortDescription: string) => {
    setTidbitsHomepage((prevTidbitsHomepage) => ({ ...prevTidbitsHomepage, shortDescription }));
  };

  async function updateTidbitsHomepage() {
    const valid = validateTidbitsHomepage();
    if (!valid) {
      console.log('Byte Collection Category invalid', tidbitsHomepageErrors);
      showNotification({ type: 'error', message: $t('notify.validationFailed') });
      return false;
    }
    try {
      console.log('here: ', tidbitsHomepage);
      setUpdating(true);
      const updatedSpace = await updateTidbitsHomepageMutation({
        variables: {
          spaceId: space.id,
          tidbitsHomepage: {
            heading: tidbitsHomepage.heading,
            shortDescription: tidbitsHomepage.shortDescription,
          },
        },
        refetchQueries: ['ExtendedSpace'],
      });
      if (updatedSpace.data?.payload) {
        setTidbitsHomepage({
          ...updatedSpace.data?.payload.tidbitsHomepage!,
        });
        showNotification({ type: 'success', message: 'Tidbits Homepage updated' });
      } else {
        showNotification({ type: 'error', message: 'Failed to update Tidbits Homepage' });
      }
      setUpdating(false);
      return true;
    } catch (e) {
      console.log(e);
      showNotification({ type: 'error', message: 'Failed to update Tidbits Homepage' });
      setUpdating(false);
      return false;
    }
  }

  return {
    tidbitsHomepage,
    updating,
    tidbitsHomepageErrors,
    updateHeading,
    updateShortDescription,
    updateTidbitsHomepage,
    validateTidbitsHomepage,
  };
}
