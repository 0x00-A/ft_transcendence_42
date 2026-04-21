// React
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// Hooks
import useLogin from '../../hooks/auth/useLogin';
// Contexts
import { useAuth } from '../../contexts/AuthContext';
// Styles
import css from './AuthForm.module.css';
import { FaRegUser } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { BiHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";
import { useLoadingBar } from '../../contexts/LoadingBarContext';
import { toast } from 'react-toastify';
// Components
import OtpAuth from './OtpAuth';
import Oauth2 from '../../components/Auth/Oauth2';
import apiClient from '@/api/apiClient';
import { API_RESET_PASSWORD_REQUEST_URL } from '@/api/apiConfig';
import axios from 'axios';
import { LoginFormData } from '@/types/apiTypes';

const Login = () => {

  const {register, handleSubmit, errors, mutation, reset, watch} = useLogin();
  const navigate = useNavigate()
  const {setIsLoggedIn} = useAuth()
  const loadingBarRef = useLoadingBar();
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpRequired, setOtpRequired] = useState(false);
  const username = watch('username');


  useEffect(() => {
    if (mutation.isSuccess) {
      if (mutation.data?.data?.status && mutation.data?.data.status === '2FA_REQUIRED') {
        reset();
        setOtpRequired(true);
        if (mutation.data?.data?.message) {
          toast.info(mutation.data?.data.message);
        } else {
          toast.info('2FA required, please enter otp');
        }
        return ;
      }
      toast.success(mutation.data?.data?.message);
      reset();
      setIsLoggedIn(true);
      navigate('/');
    }
    return () => {
      loadingBarRef.current?.complete();
    }
  }, [mutation.isSuccess])

  useEffect(() => {
    if (errors.root) {
      toast.error(errors.root.message || 'Something went wrong!');
    }
    return () => {
      loadingBarRef.current?.complete();
    }
  }, [mutation.isError])

  const handleLogin = (data: LoginFormData) => {
    loadingBarRef.current?.continuousStart();
    mutation.mutate(data);
  };

  const handleForgotPass = async () => {

    if (!username) {
      toast.error('Please enter your username!');
      return;
    }
    if (username && !errors.username) {
      try {
        const response = await apiClient.post(API_RESET_PASSWORD_REQUEST_URL, {username: username});
        toast.success(response.data?.message);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.error);
        } else {
          toast.error('Something went wrong!');
        }
      }
      reset();
    }
  }

  return (
    <div className={css.loginContainer}>
      { isOtpRequired ? <OtpAuth setOtpRequired={setOtpRequired} username={mutation.data?.data.username} loadingBarRef={loadingBarRef} /> :
        <>
          <div className={css.authFormHeader}>
            <h1>Welcome back</h1>
          </div>
          <form className={css.entryArea} onSubmit={ handleSubmit(handleLogin) }>
              <div className={css.inputContainer}>
                <FaRegUser className={css.inputIcon}/>
                <input type="text" placeholder="username" className={css.inputText} {...register('username')}/>
                {errors.username && <span className={css.fieldError}>{errors.username.message}</span>}
              </div>
              <div className={css.inputContainer}>
                <MdLockOutline className={css.inputIcon} />
                <input type={showPassword ? "text" : "password"} className={css.inputPassword} placeholder="password" {...register('password')}/>
                { showPassword ?  <BiShow className={css.showPassIcon} onClick={() => setShowPassword(!showPassword)}/> :
                  <BiHide className={css.showPassIcon} onClick={() => setShowPassword(!showPassword)}/>}
                {errors.password && <span className={css.fieldError}>{errors.password.message}</span>}
              </div>
              {/* {errors.root && <span className={css.loginError}>{errors.root.message}</span>} */}
              <div className={css.forgotPass} onClick={ handleForgotPass }>Forgot your password?</div>
              <button type="submit" className={css.authBtn}>
                Sign in
              </button>
          </form>
          <Oauth2 />
        </>
      }
    </div>
  )
}

export default Login
