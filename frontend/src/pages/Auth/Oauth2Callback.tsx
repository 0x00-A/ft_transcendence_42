// React
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
// Contexts
import { useAuth } from '../../contexts/AuthContext';
// Hooks
import useOauth2Username from '../../hooks/auth/useOauth2Username';
// Styles
import css from './Oauth2Callback.module.css';
import { FaRegUser } from "react-icons/fa";
import { toast } from 'react-toastify';
import { UsernameFormData } from '../../types/apiTypes';
import { LOGO } from '@/config/constants';
import OtpAuth from './OtpAuth';
import { useLoadingBar } from '@/contexts/LoadingBarContext';



const Oauth2Callback = () => {

    const navigate = useNavigate()
    const [isUsernameForm, setUsernameForm] = useState(false);
    const {setIsLoggedIn} = useAuth();
    const [is2faRequired, set2faRequired] = useState(false);
    const [username, setUsername] = useState('');
    const loadingBarRef = useLoadingBar();

    const {register, handleSubmit, errors, mutation, reset} = useOauth2Username()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status')
        if (status && status === '2fa_required') {
          const message = params.get('message')
          if (message) {
            toast.info(message);
          } else {
            toast.info('2fa required, please enter otp');
          }
          set2faRequired(true);
          const username = params.get('username');
          if (username) {
            setUsername(username);
          }
        }
        else if (status && status === 'success') {
          const message = params.get('message')
          if (message) {
            toast.success(message);
          } else {
            toast.success('Login successful, welcome!');
          }
          setIsLoggedIn(true);
          navigate('/');
        }
        else if (status && status === 'set_username') {
          const message = params.get('message')
          if (message) {
            toast.info(message);
          } else {
            toast.info('Please set a username to continue');
          }
          // const status = params.get('message') as string;
          // setFormStatus(status)
          setUsernameForm(true)
        }
        else if (status && status === 'email_exists') {
          const message = params.get('message')
          if (message) {
            toast.error(message);
          } else {
            toast.error('Email already exists, please login');
          }
          navigate('/auth')
        }
        else {
          const error = params.get('error')
          if (status === 'failed' && error) {
            toast.error(error);
          } else {
            toast.error('Something went wrong, please try again');
          }
          navigate('/auth')
        }
    }, [navigate]);

    useEffect(() => {
     if (mutation.isSuccess) {
        reset();
        toast.success(mutation.data?.data?.message);
        setIsLoggedIn(true);
        navigate('/');
     }
   }, [mutation.isSuccess]);
   useEffect(() => {
      if (errors.root) {
        toast.error(errors.root.message);
      }
   }, [mutation.isError]);

    const handleClick = (username: UsernameFormData) => {
      mutation.mutate(username);
    }

  return (
    <div className={css.oauth2Container}>
        { is2faRequired && <OtpAuth setOtpRequired={set2faRequired} username={username} loadingBarRef={loadingBarRef} />}
        { isUsernameForm &&
          <form noValidate={true} className={css.usernameForm} onSubmit={ handleSubmit(handleClick) }>
            <div className={css.FormHeader}>
              <img src={LOGO} alt="" className={css.logo} />
              <h1>Your provider username is not valid, or already exist, please choose new one</h1>
            </div>
            <p>Select new username and continue</p>
            <div className={css.inputContainer}>
              <FaRegUser className={css.userIcon} />
              <input type="text" placeholder="username" {...register('username')} />
            </div>
            {errors.username && <span className={css.fieldError}>{errors.username.message}</span>}
            <button type="submit" className={css.submitBtn}>
              Submit
            </button>
          </form>
        }
    </div>
  )
}

export default Oauth2Callback
