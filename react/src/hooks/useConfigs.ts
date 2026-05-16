import useSWR from 'swr';
import api from '../services/api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

/**
 * Hook to consume global configurations.
 */
export const useConfigs = () => {
  const { data, error, isLoading } = useSWR('/admin/configuracion/global', fetcher);

  const getConfig = (key: string, defaultValue: string = ''): string => {
    if (!data || !Array.isArray(data)) return defaultValue;
    const item = data.find((c: any) => c.key === key);
    return item ? item.value : defaultValue;
  };

  return { configs: data, getConfig, isLoading, error };
};
