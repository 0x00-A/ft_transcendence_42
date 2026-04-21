// REACT
import { useMutation } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
// API
import apiClient from "@/api/apiClient";
import { API_LOGIN_URL } from '@/api/apiConfig';
import axios from 'axios';
// Types
import { LoginFormData } from '@/types/apiTypes';
import { LoginSchema } from '@/types/formSchemas';


// const loginUser = async (user: LoginData) => {
//   try {
//     return await apiClient.post(API_LOGIN_URL, user);
//   }
//   catch (error) {
//     return error;
//   }
//   // return await apiClient.post(API_LOGIN_URL, user);
// };

const useLogin = () => {

  const {
    register,
    handleSubmit,
    formState: {errors},
    setError,
    reset,
    watch
  } = useForm<LoginFormData>({
    resolver: yupResolver(LoginSchema()),
    reValidateMode: 'onChange',
    mode: 'onChange'
  });

  const mutation = useMutation({
    mutationFn: async (user: LoginFormData) => await apiClient.post(API_LOGIN_URL, user),
    onError(error: unknown) {
      if (axios.isAxiosError(error)) {
        const errs = error?.response?.data;
        errs?.username && setError("username", {type: 'manual', message: errs.username}, {shouldFocus:true})
        errs?.password && setError("password", {type: 'manual', message: errs.password}, {shouldFocus:true})
        errs?.error && setError("root", {type: 'manual', message: errs?.error});
      } else {
        setError("root", {type: 'manual', message: 'Something went wrong!'});
      }

    },
  });

  return {
    register,
    handleSubmit,
    errors,
    setError,
    reset,
    mutation,
    watch
  };
}

export default useLogin
