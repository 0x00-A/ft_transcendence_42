// React
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// API
import apiClient from '@/api/apiClient';
import { API_RESET_PASSWORD_URL } from '@/api/apiConfig';
import axios from 'axios';
// Types
import { ResetPasswordForm } from '@/types/apiTypes';
import { ResetPasswordSchema } from '@/types/formSchemas';


const useResetPass = () => {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    setValue,
  } = useForm<ResetPasswordForm>({
    resolver: yupResolver(ResetPasswordSchema()),
    reValidateMode:'onChange',
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => await apiClient.post( API_RESET_PASSWORD_URL, data),
    onError: (error:unknown) => {
      if (axios.isAxiosError(error)) {
        const errs = error?.response?.data;
        if (errs?.new_password) {
          if (Array.isArray(errs.new_password)) {
            setError("new_password", {type: 'manual', message: errs.new_password.join("-")}, {shouldFocus:true})
          } else {
            setError("new_password", {type: 'manual', message: errs.new_password as string}, {shouldFocus:true})
          }
        }
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
    setValue,
    watch,
    setError,
  };
};

export default useResetPass;
