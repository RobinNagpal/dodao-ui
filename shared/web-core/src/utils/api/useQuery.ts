import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { useState, useEffect } from 'react';

type FetchState<T> = {
  data: T | null;
  error: any;
  loading: boolean;
};

export default function useQuery<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setState({ data: null, error: null, loading: true });

      try {
        const response = await fetch(url, {
          headers: {
            'dodao-auth-token': localStorage.getItem(DODAO_ACCESS_TOKEN_KEY) || '',
            ContentType: 'application/json',
          },
          cache: 'no-cache',
          credentials: 'include',
        });
        if (!response.ok) {
          console.error(`An error occurred while fetching the data. Status: ${response.status}`);
          console.error(await response.text());
          throw new Error(`An error occurred while fetching the data. Status: ${response.status}`);
        }
        const data = await response.json();
        setState({ data, error: null, loading: false });
      } catch (error) {
        setState({ data: null, error, loading: false });
      }
    };

    fetchData();
  }, [url]); // Dependency array, re-run the effect when URL changes

  return state;
}
