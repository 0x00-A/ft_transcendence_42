// React
import { useEffect, useState } from 'react';
// Hooks
import useSignup from '../../hooks/auth/useSignup';
// Styles
import css from './AuthForm.module.css';
import { toast } from 'react-toastify';
// Icons
import { FaRegUser } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { MdLockOutline } from "react-icons/md";
import { BiHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";

// Contexts
import { useLoadingBar } from '../../contexts/LoadingBarContext';
// Types
import { SignupFormData } from '@/types/apiTypes';
import Oauth2 from '@/components/Auth/Oauth2';

type PasswordFields = "password" | "confirm_pass";

const Signup = ({setIslogin}: {setIslogin:React.Dispatch<React.SetStateAction<boolean>>}) => {

  const { register, handleSubmit, errors, mutation, reset} = useSignup();
  const loadingBarRef = useLoadingBar();
  const [showPassword, setShowPassword] = useState({
        password: false,
        confirm_pass: false
  });

   useEffect(() => {
     if (mutation.isSuccess) {
        toast.success(mutation?.data?.data?.message);
        reset();
        setIslogin(true);
     }
     return () => {
        loadingBarRef.current?.complete();
     }
   }, [mutation.isSuccess, setIslogin]);

    useEffect(() => {
      if (errors.root) {
        toast.error(errors.root.message);
      }
      return () => {
        loadingBarRef.current?.complete();
      }
  }, [mutation.isError])

   const handleSignup = (data: SignupFormData, event: any) => {
      event.preventDefault();
      loadingBarRef.current?.continuousStart();
      mutation.mutate(data);
   };

   const togglePasswordVisibility = (field: PasswordFields) => {
        setShowPassword((prevState) => ({
          ...prevState,
          [field]: !prevState[field],
        }));
    };

  return (
      <div className={css.loginContainer}>
        <h1 className={css.authTitle}>Welcome</h1>
        <p>Join us and enjoy the game</p>
        <form noValidate={true} className={css.entryArea} onSubmit={ handleSubmit(handleSignup) }>
          <div className={css.inputContainer}>
            <FaRegUser className={css.inputIcon}/>
            <input type="text" placeholder="username" className={css.inputText} {...register('username')} />
            {errors.username && <span className={css.fieldError}>{errors.username.message}</span>}
          </div>
          <div className={css.inputContainer}>
            <MdOutlineEmail className={css.inputIcon}/>
            <input type="email" placeholder="email" className={css.inputText} {...register('email')}/>
            {errors.email && <span className={css.fieldError}>{errors.email.message}</span>}
          </div>
          <div className={css.inputContainer}>
            <MdLockOutline className={css.inputIcon} />
            <input type={showPassword.password ? "text" : "password"} className={css.inputPassword} placeholder="password" {...register('password')}/>
            { showPassword.password ?  <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("password")}/> :
              <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("password")}/>}
            {errors.password && <span className={css.fieldError}>{errors.password.message}</span>}
          </div>
          <div className={css.inputContainer}>
            <MdLockOutline className={css.inputIcon} />
            <input type={showPassword.confirm_pass ? "text" : "password"} className={css.inputPassword} placeholder="password confirmation" {...register('password2')}/>
            { showPassword.confirm_pass ?  <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("confirm_pass")}/> :
              <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("confirm_pass")}/>}
            {errors.password2 && <span className={css.fieldError}>{errors.password2.message}</span>}
          </div>
          <button type="submit" className={css.authBtn}>
            Sign up
          </button>
        </form>
        <Oauth2 />
      </div>
  );
};

export default Signup
