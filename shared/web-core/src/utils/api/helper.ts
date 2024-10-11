import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

export const useFetchUtils = () => {
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  
  const fetchData = async (
    url:string, 
    options = {}, 
    message = 'Error when fetching data'
  ) => {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message });
      throw error;
    }
  };

  const updateData = async (
    url:string, 
    options = {}, 
    successMessage = 'Data updated successfully', 
    errorMessage = 'Error when updating data', 
    redirectPath?: string
  ) => {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      showNotification({ type: 'success', message:successMessage });
      if (redirectPath) {
        router.push(redirectPath);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message:errorMessage });
      throw error;
    }
  };

  return { fetchData, updateData };
};
