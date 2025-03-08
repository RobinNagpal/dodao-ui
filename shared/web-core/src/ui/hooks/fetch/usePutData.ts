import { UpdateDataOptions } from '@dodao/web-core/ui/hooks/fetch/UpdateDataOptions';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';

export interface UsePutDataResponse<T, R> {
  putData: (url: string, request?: R) => Promise<T | undefined>;
  loading: boolean;
  data: T | undefined;
  error: string | undefined;
}

export const usePutData = <RESPONSE_TYPE, REQUEST_TYPE>(
  updateOptions: UpdateDataOptions,
  options: RequestInit = {}
): UsePutDataResponse<RESPONSE_TYPE, REQUEST_TYPE> => {
  const { updateData, data, loading, error } = useUpdateData<RESPONSE_TYPE, REQUEST_TYPE>(options, updateOptions, 'PUT');

  return {
    putData: updateData,
    loading: loading,
    data,
    error,
  };
};
