// React
import { useEffect, useState } from 'react';
// Hooks
import useSetPassword from '@/hooks/auth/useSetPassword';
// Types
import { SetPasswordForm } from '@/types/apiTypes';
type PasswordFields = "new_pass" | "confirm_pass";
// Styles
import css from '@/pages/Profile/Profile.module.css';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { BiHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";
import { toast } from 'react-toastify';
// Contexts
import { useUser } from '@/contexts/UserContext';


const SetPassword = ({setEditProfile}:{setEditProfile:React.Dispatch<React.SetStateAction<boolean>>}) => {

    const { register, handleSubmit, errors, mutation, reset } = useSetPassword();
    const { refetch } = useUser();
    const [showPassword, setShowPassword] = useState({
      new_pass: false,
      confirm_pass: false,
    });
    const handleOutsideClick = (event: React.MouseEvent) => {
        if ((event.target as HTMLElement).classList.contains(css.bluredBg)) {
          setEditProfile(false);
        }
    };
    const togglePasswordVisibility = (field:PasswordFields) => {
      setShowPassword((prevState) => ({
        ...prevState,
        [field]: !prevState[field],
      }));
    };
    const handleSetPassword = (data: SetPasswordForm) => {
        mutation.mutate(data);
    }
    useEffect(() => {
    if (mutation.isSuccess) {
        refetch();
        if (mutation?.data?.data?.message) {
          toast.success(mutation?.data?.data?.message);
        } else {
          toast.success('Password set successfully');
        }
        setEditProfile(false);
      }
    }, [mutation.isSuccess]);

    useEffect(() => {
      if (mutation.isError) {
        if (errors?.root) {
          toast.error(errors.root?.message);
        } else {
          toast.error('Something went wrong!');
        }
      }
    }, [mutation.isError]);

  return (
    <div className={css.bluredBg} onClick={handleOutsideClick}>
          <div className={css.setPassContainer}>
            <button className={css.exitBtn} onClick={() => setEditProfile(false)}>
              <IoMdCloseCircleOutline />
            </button>
            <form action="submit" onSubmit={handleSubmit(handleSetPassword)}>
              <div className={css.formHeader}>
                <h1>Set Password</h1>
                <p>Your account has no password, Please set a password so you can login and edit your profile.</p>
              </div>
              <div className={css.inputFields}>
                <div className={css.containerFiled}>
                  <label htmlFor="" className={css.label}>New Password</label>
                  <div className={css.inputContainer}><input type={ showPassword.new_pass ? "text" : "password"} className={css.input} {...register('password')}/>
                  {showPassword.new_pass ?
                    <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("new_pass")}/> :
                    <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("new_pass")}/>
                  }</div>
                { errors.password && <span className={css.fieldError}>{errors.password.message}</span> }
                </div>
                <div className={css.containerFiled}>
                  <label htmlFor="" className={css.label}>Confirm New Password</label>
                  <div className={css.inputContainer}><input type={ showPassword.confirm_pass ? "text" : "password"} className={css.input} {...register('password2')}/>
                  {showPassword.confirm_pass ?
                    <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("confirm_pass")}/> :
                    <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("confirm_pass")}/>
                  }</div>
                { errors.password2 && <span className={css.fieldError}>{errors.password2.message}</span> }
                </div>
                <div className={css.ConfirmButtons}>
                  <button type='reset' className={css.closeBtn} onClick={() => reset()}>Reset</button>
                  <button type='submit' className={css.confirmBtn}>Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
  )
}

export default SetPassword
