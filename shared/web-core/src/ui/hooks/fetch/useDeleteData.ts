import { UpdateDataOptions } from '@dodao/web-core/ui/hooks/fetch/UpdateDataOptions';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';

export interface UseDeleteDataResponse<T, R> {
  deleteData: (url: string, request?: R) => Promise<T | undefined>;
  loading: boolean;
  data: T | undefined;
  error: string | undefined;
}

export const useDeleteData = <RESPONSE_TYPE, REQUEST_TYPE>(
  updateOptions: UpdateDataOptions,
  options: RequestInit = {}
): UseDeleteDataResponse<RESPONSE_TYPE, REQUEST_TYPE> => {
  const { updateData, data, loading, error } = useUpdateData<RESPONSE_TYPE, REQUEST_TYPE>(options, updateOptions, 'DELETE');

  return {
    deleteData: updateData,
    loading: loading,
    data,
    error,
  };
};
