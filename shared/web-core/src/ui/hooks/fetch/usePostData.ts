import { UpdateDataOptions } from '@dodao/web-core/ui/hooks/fetch/UpdateDataOptions';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';

export interface UsePostDataResponse<T, R> {
  postData: (url: string, request?: R) => Promise<T | undefined>;
  loading: boolean;
  data: T | undefined;
  error: string | undefined;
}

export const usePostData = <RESPONSE_TYPE, REQUEST_TYPE>(
  updateOptions: UpdateDataOptions,
  options: RequestInit = {}
): UsePostDataResponse<RESPONSE_TYPE, REQUEST_TYPE> => {
  const { updateData, data, loading, error } = useUpdateData<RESPONSE_TYPE, REQUEST_TYPE>(options, updateOptions, 'POST');

  return {
    postData: updateData,
    loading: loading,
    data,
    error,
  };
};
