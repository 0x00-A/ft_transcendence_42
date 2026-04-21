import { QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query';
import {getData} from './apiClient';


const useGetData = <T>(endpoint: string,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey'>
) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => getData<T>(`${endpoint}/`),
    staleTime: 5000,
    refetchOnWindowFocus: false,
    // refetchInterval: 5000,
    ...options, // Spread additional options like `enabled`
  });
};

const useGetDataMsg = <T>(endpoint: string,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey'>
) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => getData<T>(`${endpoint}`),
    staleTime: 5000,
    refetchOnWindowFocus: true,
    // refetchInterval: 5000,
    ...options, // Spread additional options like `enabled`
  });
};

// const usePostData = <T, D>(endpoint: string, data: D) => {
//   return useMutation({
//     queryKey: [endpoint],
//     queryFn: () => postData<T, D>(`${endpoint}/`, data),
//   })
//   return useQuery({
//     queryKey: [endpoint],
//     queryFn: () => postData<T, D>(`${endpoint}/`, data),
//   });
// }

export { useGetData, useGetDataMsg };
