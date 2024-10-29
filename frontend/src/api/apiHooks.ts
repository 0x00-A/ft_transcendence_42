import { useQuery } from '@tanstack/react-query';
import APIClient from './apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';


const useGetData = <T>(endpoint: string) => {
  return useQuery({
    queryKey: [endpoint],          // You can use endpoint as a unique key for this query
    queryFn: () => APIClient.get<T>(`${endpoint}/`),  // Specify the function to fetch data
    staleTime: 1000,      // Optional: Configure additional options like staleTime
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });
};

export { useGetData };
