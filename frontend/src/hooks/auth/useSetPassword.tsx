import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { API_SET_PASSWORD } from '@/api/apiConfig';
import axios from 'axios';
// Types
import { SetPasswordForm } from '@/types/apiTypes';
import { SetPasswordSchema } from '@/types/formSchemas';

const useSetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm<SetPasswordForm>({
    resolver: yupResolver(SetPasswordSchema()),
    reValidateMode:'onChange',
    mode: 'onChange',
  });
  const mutation = useMutation({
    mutationFn: async (data: SetPasswordForm) => await apiClient.post(API_SET_PASSWORD, data),
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
          const errs = error?.response?.data;
          if (errs?.password) {
            if (Array.isArray(errs.password)) {
              setError("password", {type: 'manual', message: errs.password.join("-")}, {shouldFocus:true})
            } else {
              setError("password", {type: 'manual', message: errs.password as string}, {shouldFocus:true})
            }
          }
          errs?.error && setError("root", {type: 'manual', message: errs.error});
      } else {
        setError("root", {type: '', message: 'Something went wrong!'});
      }
    }
  });
  return {
    register,
    handleSubmit,
    errors,
    mutation,
    reset,
    setError,
    clearErrors,
  };
}

export default useSetPassword
