// React
import { useEffect, useState } from 'react';
// Components
import ProfileHeader from '../../components/Profile/ProfileHeader'
import ProfileFriends from "@/components/Profile/ProfileFriends";
import ProfileGamesHistory from '@/components/Profile/ProfileGamesHistory';
import EditInfosProfile from '@/components/Profile/EditInfosProfile'
import EditSecurityProfile from '@/components/Profile/EditSecurityProfile';
import SetPassword from '@/components/Profile/SetPassword';
import ProfileAchievements from '@/components/Profile/ProfileAchievements';
// Styles
import css from './Profile.module.css';
import { IoMdCloseCircleOutline } from "react-icons/io";
import { toast } from 'react-toastify';
// import { RiDeleteBin6Line } from "react-icons/ri";
// Api
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import useDeleteAccount from '@/hooks/profile/useDeleteAccount';
// import { PasswordForm } from '@/types/apiTypes';


const Profile = () => {

  const [isEditProfile, setEditProfile] = useState(false);
  const [activeBtn, setActiveBtn] = useState(true);
  // const [isDeleteAcc, setDeleteAcc] = useState(false);
  const { user: currentUser, error, refetch, isLoading } = useUser();
  // const { register, handleSubmit, errors, mutation, reset } = useDeleteAccount();
  const { t } = useTranslation();
  const navigate = useNavigate();


  useEffect(() => {
    refetch();
  }, []);

  // useEffect(() => {
  //   if (error) {
  //     if (axios.isAxiosError(error)) {
  //       toast.error(error.response?.data?.message || 'Something went wrong, try again!');
  //     } else {
  //       toast.error('Something went wrong, try again!');
  //     }
  //     navigate('/');
  //   }
  // }, [error]);


  const handleOutsideClick = (event: React.MouseEvent) => {
    // if (isConfirmSave) {
    //   return;
    // }
    if ((event.target as HTMLElement).classList.contains(css.bluredBg)) {
      setEditProfile(false);
    }
  };

  // useEffect(() => {
  //   if (mutation.isSuccess) {
  //     toast.success('Account deleted successfully!');
  //     reset();
  //     navigate('/auth');
  //   }
  // }, [mutation.isSuccess]);

  // useEffect(() => {
  //   if (mutation.isError) {
  //     if (errors.root) {
  //       toast.error(errors.root.message);
  //     }
  //   }
  // }, [mutation.isError]);

  if (isLoading) {
    return
    // return <div className={css.profileContainer}>
    //   <h1>Loading...</h1>
    // </div>
  }

  if (error) {
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.message || 'Something went wrong, try again!');
    } else {
      toast.error('Something went wrong, try again!');
    }
    navigate('/');
  }

  return (
    <div className={css.profileContainer}>
      { isEditProfile &&
        (!currentUser?.is_password_set ? <SetPassword setEditProfile={setEditProfile}/>
        :
        <div className={css.bluredBg} onClick={handleOutsideClick}>
          <div className={css.editProfileContainer}>
            <button className={css.exitBtn} onClick={() => setEditProfile(false)}>
              <IoMdCloseCircleOutline />
            </button>
            <div className={css.editProfileForm}>
              <div className={css.buttonsGrp}>
                <button onClick={() => setActiveBtn(true)}
                  className={`${css.button} ${activeBtn  ? css.buttonActive : ''}`}>
                  {t('Profile.informations')}
                </button>
                <button onClick={() => setActiveBtn(false)}
                  className={`${css.button} ${!activeBtn ? css.buttonActive : ''}`}>
                  {t('Profile.security')}
                </button>
              </div>
              { activeBtn ? <EditInfosProfile setEditProfile={setEditProfile} /> :
                <EditSecurityProfile setEditProfile={setEditProfile} /> }
              {/* { !activeBtn &&
                <button className={css.deleteAccBtn} disabled={true} onClick={() => setDeleteAcc(true)}>
                  <RiDeleteBin6Line size='2.2rem' />
                  <span>{t('deleteAccount.btnDelete')}</span>
                </button> } */}
                {/* { isDeleteAcc && <div className={css.bluredBgConfirm}>
                  <form className={css.confirmDelAccContainer} onSubmit={ handleSubmit((data: PasswordForm) => mutation.mutate(data)) }>
                    <h1>{t('deleteAccount.title')}</h1>
                    <p>{t('deleteAccount.description')}</p>
                    <p>{t('deleteAccount.warning')}</p>
                    <div className={css.containerFiled}>
                        <label htmlFor="">{t('Profile.EditInfosProfile.fields.password.label')}</label>
                        <input type="password" className={css.input} {...register('password')}
                        placeholder={t('Profile.EditInfosProfile.fields.password.placeholder')} />
                        {errors.password && <span className={css.fieldError}>{errors.password.message}</span>}
                    </div>
                    <div className={css.ConfirmButtons}>
                        <button type='reset' className={css.closeBtn} onClick={() => { reset(); setDeleteAcc(false)} }>{t('Profile.EditInfosProfile.confirmSave.buttons.close')}</button>
                        <button type='submit' className={css.confirmBtn}>{t('Profile.EditInfosProfile.confirmSave.buttons.confirm')}</button>
                    </div>
                  </form>
                </div>} */}
            </div>
          </div>
        </div>)
      }
      <ProfileHeader setEditProfile={setEditProfile} />
      <div className={css.profileBodyConatiner}>
        <ProfileFriends />
        <div className={css.rightBodyContainer}>
          <ProfileAchievements username={currentUser?.username} />
          <ProfileGamesHistory isOtherUser={false} username={currentUser?.username} />
        </div>
      </div>

    </div>
  )
}

export default Profile
