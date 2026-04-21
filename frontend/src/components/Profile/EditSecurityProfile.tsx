// React
import { useEffect, useState } from 'react'
import * as Yup from 'yup';
// Styles
import css from './EditSecurityProfile.module.css';
import { BiHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";
import { TbDeviceMobileMessage } from "react-icons/tb";
import { toast } from 'react-toastify';
// Hooks
import useChangePass from '@/hooks/profile/useChangePass';
import apiClient from '@/api/apiClient';
import { useUser } from '@/contexts/UserContext';
import axios from 'axios';
// Types
import { ChangePasswordForm } from '@/types/apiTypes';
import { API_DISABLE_2FA_URL, API_ENABLE_2FA_REQUEST_URL, API_ENABLE_2FA_URL } from '@/api/apiConfig';
import { otpSchema } from '@/types/formSchemas';
import { useTranslation } from 'react-i18next';
import { APP_ANDROID_QRCODE, APP_ANDROID_URL, APP_APPLE_QRCODE, APP_IOS_URL } from '@/config/constants';

type ShowPasswordFields = 'current_pass' | 'new_pass' | 'confirm_pass' | 'pass2fa';

const EditSecurityProfile = ({setEditProfile}:{setEditProfile:React.Dispatch<React.SetStateAction<boolean>>}) => {

    const { register, handleSubmit, errors, mutation, reset } = useChangePass();
    const [qrcode, setQrcode] = useState(null);
    const [otp, setOtp] = useState<string | null>(null);
    const [errorOtp, setErrorOtp] = useState<string | null>(null);
    const [confiPass2fa, setConfirPass2fa] = useState<string | null>(null);
    const { user: profileData, isLoading, refetch } = useUser();


    const [showDownloadPopup, setShowDownloadPopup] = useState(false);
    const [selectedOS, setSelectedOS] = useState<string>('');

    const { t } = useTranslation();


    const handleOpenDownloadPopup = () => setShowDownloadPopup(true);
    const handleClosePopup = () => {
        setShowDownloadPopup(false);
        setSelectedOS('');
    };
    const handleSelectOS = (os: string) => setSelectedOS(os);



    if (isLoading) {
        return
        // return <div>Loading...</div>
    }

    const [showPassword, setShowPassword] = useState({
        current_pass: false,
        new_pass: false,
        confirm_pass: false,
        pass2fa: false,
    });

    const handleDisable2fa = async () => {
        try{
            const response = await apiClient.post(API_DISABLE_2FA_URL, {password: confiPass2fa})
            toast.success(response.data.message);
            setEditProfile(false);
            refetch();
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.error);
            } else {
                toast.error(t('Profile.EditSecurity.errors.defaultError'));
            }
        }
    }

    const handleEnable2fa = async () => {
        try {
            await otpSchema(t).validate({otp: otp});
        }
        catch (error) {
            if (error instanceof Yup.ValidationError) {
                setErrorOtp(error.message);
            } else {
                setErrorOtp('Error otp, try again!');
            }
            return ;
        }
        try{
            const response = await apiClient.post(API_ENABLE_2FA_URL, {otp: otp})
            toast.success(response.data.message);
            setEditProfile(false);
            refetch();
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.error);
            } else {
                toast.error(t('Profile.EditSecurity.errors.defaultError'));
            }
        }
    }

    const handleGetQrcode = async () => {
        try {
            const response = await apiClient.post(API_ENABLE_2FA_REQUEST_URL, {})
            setQrcode(response.data.qr_code);
        }
        catch(error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.error);
            } else {
                toast.error(t('Profile.EditSecurity.errors.defaultError'));
            }
            setQrcode(null);
        }
    };

    const togglePasswordVisibility = (field: ShowPasswordFields) => {
        setShowPassword((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };
    useEffect(() => {
        if (mutation.isSuccess) {
            toast.success(mutation.data?.data?.message);
            setEditProfile(false);
        }
    }, [mutation.isSuccess]);
    useEffect(() => {
        // if (mutation.isError) {
        //     toast.error(mutation.error.response.data.error);
        // }
    }), [mutation.isError];

    const handleChangePassword = (data: ChangePasswordForm) => {
        mutation.mutate(data);
    };

    return (
        <div className={css.securityContainer}>
            <div className={css.UpdatePassContainer}>
                <h1 className={css.title}>{t('Profile.EditSecurity.changePassword.title')}</h1>
                <form action="submit" className={css.changePassForm} onSubmit={handleSubmit(handleChangePassword)}>
                    <div className={css.entryArea}>
                        <div className={css.containerFiled}>
                            <label htmlFor="" className={css.label}>{t('Profile.EditSecurity.changePassword.currentPassword')}</label>
                            <div className={css.passContainer}><input type={ showPassword.current_pass ? "text" : "password"} className={css.input} {...register('current_password')}/>
                            {showPassword.current_pass ?
                              <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("current_pass")}/> :
                              <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("current_pass")}/>
                            }</div>
                            {errors.current_password && <span className={css.fieldError}>{errors.current_password.message}</span>}
                        </div>
                        <div className={css.containerFiled}>
                            <label htmlFor="" className={css.label}>{t('Profile.EditSecurity.changePassword.newPassword')}</label>
                            <div className={css.passContainer}><input type={ showPassword.new_pass ? "text" : "password"} className={css.input} {...register('new_password')}/>
                            {showPassword.new_pass ?
                              <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("new_pass")}/> :
                              <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("new_pass")}/>
                            }</div>
                            {errors.new_password && <span className={css.fieldError}>{errors.new_password.message}</span>}
                        </div>
                        <div className={css.containerFiled}>
                            <label htmlFor="" className={css.label}>{t('Profile.EditSecurity.changePassword.confirmPassword')}</label>
                            <div className={css.passContainer}><input type={ showPassword.confirm_pass ? "text" : "password"} className={css.input} {...register('confirm_password')}/>
                            {showPassword.confirm_pass ?
                              <BiShow className={css.showPassIcon} onClick={() => togglePasswordVisibility("confirm_pass")}/> :
                              <BiHide className={css.showPassIcon} onClick={() => togglePasswordVisibility("confirm_pass")}/>
                            }</div>
                            {errors.confirm_password && <span className={css.fieldError}>{errors.confirm_password.message}</span>}
                        </div>
                    </div>
                    <div className={css.ConfirmButtons}>
                        <button type='reset' className={css.closeBtn} onClick={() => reset()}>{t('Profile.EditSecurity.changePassword.buttons.reset')}</button>
                        <button type='submit' className={css.confirmBtn}>{t('Profile.EditSecurity.changePassword.buttons.save')}</button>
                    </div>
                </form>
            </div>
            <div className={css.twoFacForm}>
                <h1 className={css.title}>{t('Profile.EditSecurity.twoFactorAuth.title')}</h1>
                {!profileData?.is2fa_active ? (
                    <div className={css.twoFacContainer}>
                        <div className={css.inputContainer}>
                            <p className={css.description}>{t('Profile.EditSecurity.twoFactorAuth.description')}</p>
                            <div className={css.otpAndInput}>
                                <div className={css.labelIcon}>
                                    <TbDeviceMobileMessage className={css.mobileMsgIcon} />
                                    <label>{t('Profile.EditSecurity.twoFactorAuth.mobileMessageLabel')}</label>
                                </div>
                                <div className={css.inputBtn}>
                                    <input
                                        type="text"
                                        className={css.verifCode}
                                        placeholder={t('Profile.EditSecurity.twoFactorAuth.otpPlaceholder')}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    <button
                                        disabled={!qrcode}
                                        className={css.enableBtn}
                                        onClick={handleEnable2fa}
                                    >
                                        {t('Profile.EditSecurity.twoFactorAuth.buttons.enable2FA')}
                                    </button>
                                </div>
                                {errorOtp && <span className={css.fieldError}>{errorOtp}</span>}
                            </div>
                        </div>
                        <div className={css.qrCodeContainer}>
                            <button className={css.downloadBtn} onClick={handleOpenDownloadPopup}>
                                {t('Profile.EditSecurity.twoFactorAuth.buttons.downloadApp')}
                            </button>
                            {!qrcode ? (
                                <button onClick={handleGetQrcode}>{t('Profile.EditSecurity.twoFactorAuth.buttons.getQrCode')}</button>
                            ) : (
                                <img className={css.qrCode} src={qrcode} alt="QR Code" />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={css.disable2faContainer}>
                        <p>{t('Profile.EditSecurity.twoFactorAuth.enabled.status')}</p>
                        <p>{t('Profile.EditSecurity.twoFactorAuth.ask_disable')}</p>
                        <div className={css.containerFiled2}>
                            <label htmlFor="" className={css.label}>{t('Profile.EditSecurity.twoFactorAuth.enabled.confirmPasswordLabel')}</label>
                            <div className={css.passContainer}>
                                <input
                                    type={showPassword.pass2fa ? "text" : "password"}
                                    className={css.input}
                                    onChange={(e) => setConfirPass2fa(e.target.value)}
                                />
                                {showPassword.pass2fa ? (
                                    <BiShow
                                        className={css.showPassIcon}
                                        onClick={() => togglePasswordVisibility("pass2fa")}
                                    />
                                ) : (
                                    <BiHide
                                        className={css.showPassIcon}
                                        onClick={() => togglePasswordVisibility("pass2fa")}
                                    />
                                )}
                            </div>
                        </div>
                        <button
                            disabled={!confiPass2fa || confiPass2fa?.length === 0}
                            className={css.disableBtn}
                            onClick={handleDisable2fa}
                        >
                            {t('Profile.EditSecurity.twoFactorAuth.enabled.buttons.disable2FA')}
                        </button>
                    </div>
                )}
                {showDownloadPopup && (
                    <div className={css.popupOverlay}>
                        <div className={css.popup}>
                            <h2>{t('Profile.EditSecurity.downloadAppPopup.title')}</h2>
                            <div className={css.osButtons}>
                                <button
                                    onClick={() => handleSelectOS("android")}
                                    className={`${selectedOS === "android" ? css.selected : ""}`}
                                >
                                    {t('Profile.EditSecurity.downloadAppPopup.osButtons.android')}
                                </button>
                                <button
                                    onClick={() => handleSelectOS("ios")}
                                    className={`${selectedOS === "ios" ? css.selected : ""}`}
                                >
                                    {t('Profile.EditSecurity.downloadAppPopup.osButtons.ios')}
                                </button>
                            </div>
                            {selectedOS && (
                                <div className={css.qrCodeContainerApp}>
                                    <p>{t('Profile.EditSecurity.downloadAppPopup.qrCodeInstructions')}</p>
                                    <img
                                        src={selectedOS === "android" ? APP_ANDROID_QRCODE : APP_APPLE_QRCODE }
                                        alt={`${selectedOS} QR Code`}
                                    />
                                    <a className={css.appLink} href={selectedOS === "android" ? APP_ANDROID_URL : APP_IOS_URL} target='_blank'>{selectedOS === "android" ? APP_ANDROID_URL : APP_IOS_URL}</a>
                                </div>
                            )}
                            <button className={css.closePopup} onClick={handleClosePopup}>{t('Profile.EditSecurity.downloadAppPopup.buttons.close')}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
  )
}

export default EditSecurityProfile
