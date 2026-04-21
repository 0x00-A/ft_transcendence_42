// React
import { useEffect, useState } from 'react';
// Styles
import css from './ResetPassword.module.css';
import { BiHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";
import useResetPass from '@/hooks/auth/useResetPass';
import { ResetPasswordForm } from '@/types/apiTypes';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { LOGO } from '@/config/constants';


type ShowPasswordFields = 'new_pass' | 'confirm_pass';

const ResetPassword = () => {

    const { token } = useParams();
    const {register, mutation, handleSubmit, errors} = useResetPass();
    const [showPassword, setShowPassword] = useState({
        new_pass: false,
        confirm_pass: false,
    });
    const navigate = useNavigate();

    const togglePasswordVisibility = (field: ShowPasswordFields) => {
        setShowPassword((prevState) => ({
          ...prevState,
          [field]: !prevState[field],
        }));
    };

    const handleResetPass = (data: ResetPasswordForm) => {
        if (token) {
            data.token = token;
        }
        mutation.mutate(data);
    }

    useEffect(() => {
        if (mutation.isSuccess) {
            toast.success(mutation.data?.data?.message);
            navigate('/auth');
        }
   }, [mutation.isSuccess]);

   useEffect(() => {
        if (mutation.isError) {
            if (axios.isAxiosError(mutation.error)) {
                toast.error(mutation.error?.response?.data.error);
            }
        }
   }), [mutation.isError, errors];

  return (
    <div className={css.resetPassContainer}>
        <div className={css.resetPassBox}>
            <div className={css.boxHeader}>
                <img src={LOGO} alt="" className={css.logo}/>
                <h1>Reset Password</h1>
            </div>
            <form action="" className={css.resetPassForm} onSubmit={ handleSubmit(handleResetPass) }>
                <div className={css.containerFiled}>
                  <label htmlFor="" className={css.label}>New Password</label>
                  <div className={css.inputContainer}><input type={ showPassword.new_pass ? "text" : "password"} className={css.input} {...register('new_password')}/>
                  {showPassword.new_pass ?
                    <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("new_pass")}/> :
                    <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("new_pass")}/>
                  }</div>
                { errors.new_password && <span className={css.fieldError}>{errors.new_password.message}</span> }
                </div>
                <div className={css.containerFiled}>
                    <label htmlFor="" className={css.label}>Confirm New Password</label>
                    <div className={css.inputContainer}><input type={ showPassword.confirm_pass ? "text" : "password"} className={css.input} {...register('confirm_password')}/>
                    {showPassword.confirm_pass ?
                      <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("confirm_pass")}/> :
                      <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("confirm_pass")}/>
                    }</div>
                    { errors.confirm_password && <span className={css.fieldError}>{errors.confirm_password.message}</span> }
                </div>
                <div className={css.ConfirmButtons}>
                    <button type='reset' className={css.closeBtn} onClick={() => navigate('/auth')}>Cancel</button>
                    <button type='submit' className={css.confirmBtn}>Save</button>
                </div>
            </form>

        </div>
    </div>
  )
}

export default ResetPassword
