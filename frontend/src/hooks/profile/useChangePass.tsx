// React
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// API
import apiClient from '@/api/apiClient';
import { API_UPDATE_PASSWORD_URL } from '@/api/apiConfig';
import axios from 'axios';
// Types
import { ChangePasswordForm } from '@/types/apiTypes';
import { ChangePasswordSchema } from '@/types/formSchemas';


// const changePassApi = async (data: ChangePasswordForm) => {
//   // try {
//     const response = await apiClient.put(
//         API_CHANGE_PASSWORD_URL,
//         data,
//     );
//     return response.data
// }

const useChangePass = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    setValue,
  } = useForm<ChangePasswordForm>({
    resolver: yupResolver(ChangePasswordSchema()),
    reValidateMode:'onChange',
    mode: 'onChange',
  });
  const mutation = useMutation({
    mutationFn: async (data: ChangePasswordForm) => await apiClient.put( API_UPDATE_PASSWORD_URL, data),
    onError: (error:unknown) => {
      if (axios.isAxiosError(error)) {
        const errs = error?.response?.data;
        errs?.current_password && setError("current_password", {type: 'manual', message: errs.current_password}, {shouldFocus:true})
        if (errs?.new_password) {
          if (Array.isArray(errs.password)) {
            setError("new_password", {type: 'manual', message: errs.new_password.join("-")}, {shouldFocus:true})
          } else {
            setError("new_password", {type: 'manual', message: errs.new_password as string}, {shouldFocus:true})
          }
        }
        errs?.error && setError("root", {type: 'manual', message: errs.error as string});
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
    setValue,
    watch,
    setError,
  };
};

export default useChangePass
