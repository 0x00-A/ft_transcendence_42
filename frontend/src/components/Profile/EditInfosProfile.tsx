// React
import { useEffect, useState } from 'react';
import { Controller } from "react-hook-form";
// Styles
import css from './EditInfosProfile.module.css'
import { toast } from 'react-toastify';
// Hooks
import useEditProfile from '@/hooks/profile/useEditInfosProfile'
// Contexts
import { useUser } from '@/contexts/UserContext';
// Types
import { EditProfileFormData } from '@/types/apiTypes';
import apiClient from '@/api/apiClient';
import axios from 'axios';
import { API_UPDATE_EMAIL_REQUEST_URL } from '@/api/apiConfig';
import { useTranslation } from 'react-i18next';
import { EmailSchema } from '@/types/formSchemas';
import * as Yup from 'yup';
import { DEFAULT_AVATAR } from '@/config/constants';


const EditInfosProfile = ({setEditProfile}:{setEditProfile:React.Dispatch<React.SetStateAction<boolean>>}) => {

    const { register, control, handleSubmit, mutation, reset, errors, resetField, watch}  = useEditProfile();
    const [isConfirmSave, setConfirmSave] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [isEditEmail, setEditEmail] = useState(false);
    // const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { user: profileData, refetch } = useUser();
    const formValues = watch(['username', 'first_name', 'last_name']);
    const [emailValue, setEmailValue] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const { t } = useTranslation();


    const handleEditProfile = (data: EditProfileFormData) => {

        const formData = new FormData();
        if (data.avatar) formData.append('avatar', data.avatar);
        if (selectedAvatar === 'remove') formData.append('removeAvatar', "true");
        if (data.username) formData.append('username', data.username);
        formData.append('first_name', data.first_name);
        formData.append('last_name', data.last_name);
        if (data.password) formData.append('password', data.password);
        mutation.mutate(formData);
    };

    // const handleChangeAvatar = (event: { preventDefault: () => void; }) => {
    //     event.preventDefault();
    //     fileInputRef.current?.click();
    // };

    // const handleChangeAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (file) {
    //         console.log('---------file ', file.name);

    //       setValue('avatar', file);
    //       const url = URL.createObjectURL(file);
    //       setSelectedAvatar(url);
    //     //   if (errors.avatar) {
    //     //       clearErrors('avatar');
    //     //   }
    //     }
    // };

    // const handleSubmitForm = (e:FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     setConfirmSave(true);
    // }
    // const handleSaveBtn = () => {
    //     const hasValue = formValues.some((value:any) => value !== undefined && value !== null && value?.trim() !== '');
    //     if (!hasValue && (selectedAvatar === 'null' || selectedAvatar === undefined)) {
    //         toast.error(t('Profile.EditInfosProfile.errors.emptyForm'));
    //         return;
    //     } else if (errors){
    //         return;
    //     }
    //     setConfirmSave(true)
    // }

   const handleDisbaleSave = () => {
        if (formValues[0] === undefined && formValues[1] === undefined && formValues[2] === undefined && selectedAvatar === null) {
            return true;
        }
        if (errors.username || errors.first_name || errors.last_name || errors.avatar) {
            return true;
        }
        return formValues[0] === profileData?.username && formValues[1] === profileData?.first_name && formValues[2] === profileData?.last_name && !selectedAvatar
    }

   const handleVerifyEmail = async () => {
        try {
            await EmailSchema().validate({email: emailValue});
        }
        catch (error) {
            if (error instanceof Yup.ValidationError) {
                setEmailError(error.message);
                return;
            } else {
                setEmailError('Invalid email');
            }
            return;
        }
        try {
            const response = await apiClient.post(API_UPDATE_EMAIL_REQUEST_URL, {
                email: emailValue,
                // redirect_url: REDIRECT_URL_UPDATE_EMAIL
            });
            toast.success(response.data.message);
            setEditProfile(false);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.error);
            } else {
                toast.error(t('Profile.EditInfosProfile.errors.defaultError'));
            }
        }
   }
   useEffect(() => {
        if (mutation.isSuccess) {
            refetch();
            toast.success(mutation.data?.data?.message);
            reset();
            setEditProfile(false);
        }
   }, [mutation.isSuccess]);

   useEffect(() => {
        if (mutation.isError && errors.password) {
            return ;
        }
        if (mutation.isError && !errors.password) {
            toast.error(errors?.root?.message);
            mutation.reset();
            // reset();
            setConfirmSave(false);
        }
   }), [mutation.isError];


    return (
        <div className={css.editInfosContainer}>
            <h1 className={css.title}>{t('Profile.EditInfosProfile.title')}</h1>
            <form className={css.editInfosForm} onSubmit={ handleSubmit(handleEditProfile) }>
                <div className={css.editAvatar}>
                    <div className={css.avatarContainer}>
                        <img src={!selectedAvatar ? profileData?.profile.avatar :
                            selectedAvatar === 'remove' ? DEFAULT_AVATAR : selectedAvatar} alt="" />
                    </div>
                    <div className={css.avatarButtons}>
                        <Controller name='avatar' control={control} render={({ field: { onChange, ref } }) => (
                            <>
                                <input
                                    type="file"
                                    id="avatar"
                                    accept='image/*'
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setSelectedAvatar(file ? URL.createObjectURL(file) : null);
                                        onChange(file);
                                    }}
                                    ref={ref}
                                    style={{ display: "none" }} />
                                <button
                                    className={css.avatarBtn}
                                    type='button'
                                    onClick={ () => document.getElementById("avatar")?.click() }>
                                    {t('Profile.EditInfosProfile.avatar.changeButton')}
                                </button>
                                <button
                                    className={css.removeAvatarBtn}
                                    disabled={selectedAvatar === 'remove'}
                                    type='button'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedAvatar('remove');
                                        onChange(null);
                                    }}>
                                    {t('Profile.EditInfosProfile.avatar.removeButton')}
                                </button>
                            </>
                        )} />
                        {errors.avatar && <span className={css.fieldError}>{errors.avatar.message}</span>}
                    </div>
                </div>
                <div className={css.editInfos}>
                    <div className={css.containerField}>
                        <div className={css.field}>
                            <label htmlFor="" className={css.label}>{t('Profile.EditInfosProfile.fields.firstName.label')}</label>
                            <input className={css.input} defaultValue={profileData?.first_name}
                                placeholder={!profileData?.first_name ? t('Profile.EditInfosProfile.fields.firstName.placeholder') : ''}
                                {...register('first_name')}/>
                        </div>
                        {errors.first_name && <span className={css.fieldError}>{errors.first_name.message}</span>}
                    </div>
                    <div className={css.containerField}>
                        <div className={css.field}>
                            <label htmlFor="" className={css.label}>{t('Profile.EditInfosProfile.fields.lastName.label')}</label>
                            <input type="text" className={css.input} defaultValue={profileData?.last_name}
                                placeholder={!profileData?.last_name ? t('Profile.EditInfosProfile.fields.lastName.placeholder') : ''}
                                {...register('last_name')}/>
                        </div>
                        {errors.last_name && <span className={css.fieldError}>{errors.last_name.message}</span>}
                    </div>
                    <div className={css.containerField}>
                        <div className={css.field}>
                            <label htmlFor="" className={css.label}>{t('Profile.EditInfosProfile.fields.username.label')}</label>
                            <input type="text" className={css.input} defaultValue={profileData?.username}
                                placeholder={!profileData?.username ? t('Profile.EditInfosProfile.fields.username.placeholder') : ''}
                                {...register('username')}/>
                        </div>
                        {errors.username && <span className={css.fieldError}>{errors.username.message}</span>}
                    </div>
                    <button type='button' disabled={handleDisbaleSave()} onClick={() => setConfirmSave(true)} className={css.saveBtn}>{t('Profile.EditInfosProfile.saveButton')}</button>
                    {/* {errors.at_least_one_field && <span className={css.fieldError}>{errors.at_least_one_field.message}</span>} */}
                </div>
                { isConfirmSave && <div className={css.bluredBgConfirm}>
                <div className={css.saveConfirmContainer}>
                    <h1>{t('Profile.EditInfosProfile.confirmSave.title')}</h1>
                    <p>{t('Profile.EditInfosProfile.confirmSave.description')}</p>
                    <div className={css.containerFiled}>
                        <label htmlFor="">{t('Profile.EditInfosProfile.fields.password.label')}</label>
                        <input type="password" className={css.input}
                        placeholder={t('Profile.EditInfosProfile.fields.password.placeholder')} {...register('password')}/>
                        {errors.password && <span className={css.fieldError}>{errors.password.message}</span>}
                    </div>
                    <div className={css.ConfirmButtons}>
                        <button type='reset' className={css.closeBtn} onClick={() => { setConfirmSave(false); resetField('password')}}>{t('Profile.EditInfosProfile.confirmSave.buttons.close')}</button>
                        <button type='submit' className={css.confirmBtn}>{t('Profile.EditInfosProfile.confirmSave.buttons.confirm')}</button>
                    </div>
                </div>
                {/* </form> */}
                </div>}
            </form>

            {/* <div className={`${isConfirmSave ? css.bluredBgConfirm : ''}`}>
                { isConfirmSave &&
                <form className={css.saveConfirmContainer} onSubmit={handleSubmit(handleEditProfile)} encType="multipart/form-data">
                    <h1>{t('Profile.EditInfosProfile.confirmSave.title')}</h1>
                    <p>{t('Profile.EditInfosProfile.confirmSave.description')}</p>
                    <div className={css.containerFiled}>
                        <label htmlFor="">{t('Profile.EditInfosProfile.fields.password.label')}</label>
                        <input required={true} type="password" className={css.input}
                        placeholder={t('Profile.EditInfosProfile.fields.password.placeholder')} {...register('password')}/>
                        {errors.password && <span className={css.fieldError}>{errors.password.message}</span>}
                    </div>
                    <div className={css.ConfirmButtons}>
                        <button type='reset' className={css.closeBtn} onClick={() => setConfirmSave(false)}>{t('Profile.EditInfosProfile.confirmSave.buttons.close')}</button>
                        <button type='submit' className={css.confirmBtn}>{t('Profile.EditInfosProfile.confirmSave.buttons.confirm')}</button>
                    </div>
                </form>}
            </div> */}
                <div className={css.emailContainer}>
                    <label htmlFor="" className={css.label}>{t('Profile.EditInfosProfile.fields.email.label')}</label>
                    <div className={css.emailField}>
                        <p>{profileData?.email}</p>
                        <button className={css.editEmailBtn} type='button' onClick={() => setEditEmail(true)}>
                            {/* {t('Profile.EditInfosProfile.fields.email.verifyButton')} */}
                            {t('editEmail.btnEdit')}
                        </button>
                    </div>
                { emailError && <span className={css.fieldError}>{emailError}</span> }
                </div>

            <div className={`${isEditEmail ? css.bluredBgConfirm : ''}`}>
                { isEditEmail && <div className={css.editEmailContainer}>
                    <h1>{t('editEmail.editEmail')}</h1>
                    <p>{t('editEmail.description')}</p>
                    <div className={css.field}>
                        <label className={css.label}>{t('editEmail.label')}</label>
                        <input type="email" className={css.emailInput}
                        placeholder={t('Profile.EditInfosProfile.fields.email.placeholder')} onChange={(e) => setEmailValue(e.target.value)} />
                        { emailError && <span className={css.fieldError}>{emailError}</span> }
                    </div>
                    <div className={css.ConfirmButtons}>
                      <button className={css.closeBtn} type='reset' onClick={() => setEditEmail(false)}>{t('editEmail.btnCancel')}</button>
                      <button type='button' className={css.confirmBtn} onClick={handleVerifyEmail}>{t('editEmail.btnSubmit')}</button>
                    </div>
                </div> }
            </div>
        </div>
    )
}

export default EditInfosProfile
