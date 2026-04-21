// React
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// API
import apiClient from '@/api/apiClient';
import { API_DELETE_ACCOUNT_URL } from '@/api/apiConfig';
import axios from 'axios';
import { PasswordForm } from '@/types/apiTypes';
import { PasswordSchema } from '@/types/formSchemas';
// Types



const useDeleteAccount = () => {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<PasswordForm>({
    resolver: yupResolver(PasswordSchema()),
    mode: 'onSubmit',
  });
  const mutation = useMutation({
    mutationFn: async (data: PasswordForm) => await apiClient.post(API_DELETE_ACCOUNT_URL, data),
    onError: (error:unknown) => {
      if (axios.isAxiosError(error)) {
          const errs = error?.response?.data;
          errs?.password && setError("password", {type: 'manual', message: errs.password as string}, {shouldFocus:true})
          errs?.error && setError("root", {type: 'manual', message: errs.error as string});
        } else {
          setError("root", {type: 'manual', message: 'Something went wrong!'});
        }
    }
  });
  return {
    register,
    handleSubmit,
    errors,
    mutation,
    reset,
  };
};

export default useDeleteAccount