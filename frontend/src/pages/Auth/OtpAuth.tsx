import { useState } from 'react';
import css from './OtpAuth.module.css'
import apiClient from '@/api/apiClient';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_LOGIN_OTP_URL } from '@/api/apiConfig';
import { otpSchema } from '@/types/formSchemas';
import * as Yup from 'yup';
import { LOGO } from '@/config/constants';
import { useTranslation } from 'react-i18next';
import { LoadingBarContextType } from '@/contexts/LoadingBarContext';


const OtpAuth = ({setOtpRequired, username, loadingBarRef}: {setOtpRequired:React.Dispatch<React.SetStateAction<boolean>>, username:string, loadingBarRef:LoadingBarContextType}) => {
  const [otp, setOtp] = useState('');
  const { setIsLoggedIn } = useAuth();
  const [otpError, setOptError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await otpSchema(t).validate({otp: otp});
    }
    catch (error) {
      if (error instanceof Yup.ValidationError) {
        setOptError(error.message);
      } else {
        setOptError('Error otp, try again!');
      }
      return ;
    }
    try {
        const response = await apiClient.post(API_LOGIN_OTP_URL, {otp: otp, username: username});
        toast.success(response.data.message);
        setOtpRequired(false);
        setIsLoggedIn(true);
        navigate('/');
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error?.response?.data.error);
        }
        else {
          toast.error('Something went wrong!');
        }
    }
  }

  return (
    <form action="" className={css.otpForm} onSubmit={handleVerifyOtp}>
      <img src={LOGO} alt="" className={css.logo}/>
      <h1>2FA Required</h1>
      <p>Please enter the one-time-password in your application google authenticator, to login</p>
      <div className={css.inputContainer}>
        <div className={css.fieldContainer}>
          <label htmlFor="" className={css.label}>Enter the Otp</label>
          <input type="text" className={css.input} placeholder="Enter otp" onChange={(e) => setOtp(e.target.value)} />
          {otpError && <span className={css.fieldError}>{otpError}</span>}
        </div>
        <div className={css.otpButtons}>
          <button type='submit' className={css.submitBtn}>Submit</button>
          <button type='reset' className={css.cancelBtn} onClick={() => { loadingBarRef.current?.complete(); setOtpRequired(false); } }>Cancel</button>
        </div>
      </div>
    </form>
  )
}

export default OtpAuth
