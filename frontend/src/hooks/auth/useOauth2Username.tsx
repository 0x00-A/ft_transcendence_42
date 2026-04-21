// React
// import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
// API
import apiClient from '@/api/apiClient';
import { API_OAUTH2_SETUSERNAME_URL } from '@/api/apiConfig';
import axios from 'axios';
// Types
import { SetUsernameSchema } from '@/types/formSchemas';
import { UsernameFormData } from '../../types/apiTypes';


// const submitUsername = async (data: UsernameFormData) => {
//   // try {
//     const response = await apiClient.post(
//       '/oauth2/set_username/',
//       data,
//     );
//     return response.data
// }


const useOauth2Username = () => {

  const {
    register,
    handleSubmit,
    formState : {errors},
    reset,
    setError,
  } = useForm<UsernameFormData>({
    resolver: yupResolver(SetUsernameSchema()),
    reValidateMode: 'onChange',
    mode: 'onChange',
  });
  const mutation = useMutation({
    mutationFn: async (username: UsernameFormData) => { return await apiClient.post(API_OAUTH2_SETUSERNAME_URL, username) },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const errs = error?.response?.data;
        errs?.username && setError("username", {type: 'manual', message: errs.username}, {shouldFocus:true});
        errs?.error && setError("root", {type: 'manual', message: errs.error});
      } else {
        setError("root", {type: '', message: 'Something went wrong!'});
      }
    },
  });
  return {
    register,
    handleSubmit,
    reset,
    errors,
    setError,
    mutation
  }
}

export default useOauth2Username
