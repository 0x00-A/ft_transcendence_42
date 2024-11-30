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


interface LoginFormData {
  username: string;
  password: string;
}

const Login = () => {

  const {register, handleSubmit, errors, mutation, reset} = useLogin();
  const navigate = useNavigate()
  const {setIsLoggedIn} = useAuth()
  const loadingBarRef = useLoadingBar();
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpRequired, setOtpRequired] = useState(false);


  useEffect(() => {
    if (mutation.isSuccess) {
      if (mutation.data?.data?.status && mutation.data?.data.status === '2FA_REQUIRED') {
        // console.log(mutation.data.data);
        reset();
        setOtpRequired(true);
        return ;
      }
      toast.success(mutation.data?.data?.message);
      reset();
      setIsLoggedIn(true);
      navigate('/');
    }
  }, [mutation.isSuccess])

  useEffect(() => {
    if (errors.root) {
      toast.error(errors.root?.message?.at(0)??'something went wrong!');
    }
    return () => {
      loadingBarRef.current?.complete();
    }
  }, [mutation.isError])

  const handleLogin = (data: LoginFormData) => {
    loadingBarRef.current?.continuousStart();
    mutation.mutate(data);
  };

  return (
    <div className={css.loginContainer}>
      { isOtpRequired ? <OtpAuth setOtpRequired={setOtpRequired} username={mutation.data?.data.username} /> :
        <>
          <div className={css.authFormHeader}>
            <h1>Welcome back</h1>
          </div>
          <form className={css.entryArea} onSubmit={ handleSubmit(handleLogin) }>
              <div className={css.inputContainer}>
                <FaRegUser className={css.inputIcon}/>
                <input type="text" required placeholder="username" {...register('username')}/>
                {errors.username && <span className={css.fieldError}>{errors.username.message}</span>}
              </div>
              <div className={css.inputContainer}>
                <MdLockOutline className={css.inputIcon} />
                <input type={showPassword ? "text" : "password"} required placeholder="password" {...register('password')}/>
                { showPassword ?  <BiShow className={css.showPassIcon} onClick={() => setShowPassword(!showPassword)}/> :
                  <BiHide className={css.showPassIcon} onClick={() => setShowPassword(!showPassword)}/>}
                {errors.password && <span className={css.fieldError}>{errors.password.message}</span>}
              </div>
              {/* {errors.root && <span className={css.loginError}>{errors.root.message}</span>} */}
              <p>Forgot password?</p>
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
