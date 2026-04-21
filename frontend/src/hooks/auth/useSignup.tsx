// React
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// API
import apiClient from '@/api/apiClient';
import { API_SIGNUP_URL } from '@/api/apiConfig';
import axios from 'axios';
// Types
import { SignupFormData } from '@/types/apiTypes';
import { SignupSchema } from '@/types/formSchemas';

// const signupApi = async (data: SignupFormData) : Promise<ApiResponse<SignupFormData> | undefined> => {
//   try {
//     const response = await apiClient.post<ApiResponse<SignupFormData>>(
//       API_REGISTER_URL,
//       data
//     );
//     return response.data
//   } catch (error) {
//   }
// }

const useSignup = () => {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm<SignupFormData>({
    resolver: yupResolver(SignupSchema()),
    reValidateMode:'onChange',
    mode: 'onChange',
  });
  const mutation = useMutation({
    mutationFn: async (data: SignupFormData) => await apiClient.post(API_SIGNUP_URL, data),
    onError: (error:unknown) => {
      if (axios.isAxiosError(error)) {
          const errs = error?.response?.data;
          errs?.username && setError("username", {type: 'manual', message: errs.username as string}, {shouldFocus:true})
          errs?.email && setError("email", {type: 'manual', message: errs.email as string}, {shouldFocus:true})
          if (errs?.password) {
            if (Array.isArray(errs.password)) {
              setError("password", {type: 'manual', message: errs.password.join("-")}, {shouldFocus:true})
            } else {
              setError("password", {type: 'manual', message: errs.password as string}, {shouldFocus:true})
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
    watch,
    setError,
    clearErrors,
  };
};

export default useSignup
