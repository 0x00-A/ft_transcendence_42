import Logo from '../Logo/Logo';
import css from './Sidebar.module.css';
import { SidebarMenu } from './components/SidebarMenu/SidebarMenu';
import { useEffect, useRef, useState } from 'react';
// import { IoLogOut } from 'react-icons/io5';
import { TbLogout } from 'react-icons/tb';
import Flag from 'react-world-flags';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { useLoadingBar } from '../../contexts/LoadingBarContext';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import {
  MENU_ICON_COLOR,
  MENU_ICON_SIZE,
  // SIDEBAR_RESIZE_WIDTH,
} from '../../config/constants';
import apiClient from '../../api/apiClient';
import {
  API_GET_LANGUAGE_URL,
  API_LOGOUT_URL,
  API_POST_SET_LANGUAGE_URL,
} from '@/api/apiConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SideBarTooltip from './SideBarTooltip';
import { useWebSocket } from '@/contexts/WebSocketContext';

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const loadingBarRef = useLoadingBar();
  const { setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      loadingBarRef.current?.complete();
    };
  }, []);

  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLangPopup, setShowLangPopup] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const sideBarRef = useRef(null);
  // const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Ref to track the language switcher container
  const languageSwitcherRef = useRef<HTMLDivElement>(null);
  const {
    fetchNotifications
  } = useWebSocket();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageSwitcherRef.current &&
        !languageSwitcherRef.current.contains(event.target as Node)
      ) {
        setShowLangPopup(false);
      }
    };

    if (showLangPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLangPopup]);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    loadingBarRef.current?.continuousStart();
    (async () => {
      loadingBarRef.current?.complete();
      setIsLoggedIn(false);
      const response = await apiClient.post(API_LOGOUT_URL);
      // console.log('apiClient ==> Logout response: ', response.data.message);
      response;
      setShowConfirm(false);
      navigate('/auth');
    })();
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  useEffect(() => {
    const checkWidth = () => {
      if (sideBarRef.current) {
        const computedWidth = parseFloat(
          getComputedStyle(sideBarRef.current).width
        );
        setOpen(computedWidth !== 72);
      }
    };

    checkWidth();

    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const response = await apiClient.get(API_GET_LANGUAGE_URL);
        // console.log('Language fetched successfully:', response.data.language);

        const lang = response.data.language || 'en';
        setSelectedLang(lang);
        i18n.changeLanguage(lang);
      } catch (error) {
        // console.error('Error fetching language:', error);
        setSelectedLang('en');
        i18n.changeLanguage('en');
      }
    };

    fetchLanguage();
  }, [i18n]);

  const changeLanguage = async (lang: string) => {
    try {
      // console.log('Changing language to:', lang);

      const response = await apiClient.post(
        `${API_POST_SET_LANGUAGE_URL}${lang}/`, {}
      );

      setSelectedLang(response.data.language);
      i18n.changeLanguage(response.data.language);

      setShowLangPopup(false);


      fetchNotifications(1, true)
    } catch (error) {
    }
  };

  return (
    <aside className={`${css.sidebar}`} ref={sideBarRef}>
      <div className={css.logoBox}>
        <Logo style={css.logo} />
      </div>
      <div className={css.menuBox}>
        <SidebarMenu open={open} />
        <div className={`${css.bottom}`}>
          <div
            className={css.languageSwitcher}
            onClick={() => setShowLangPopup((prevState) => !prevState)}
            data-tooltip-id={`${!open ? 'language-tooltip' : ''}`}
            ref={languageSwitcherRef}
          >
            <Flag
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              className={css.flagsSelected}
              code={
                selectedLang === 'es'
                  ? 'ES'
                  : selectedLang === 'nl'
                    ? 'NL'
                    : 'US'
              }
              width={32}
              height={32}
            />
            {showLangPopup && (
              <div className={css.languagePopup}>
                <ul>
                  <li onClick={() => changeLanguage('en')}>
                    <Flag
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        width: '26px',
                        height: '26px',
                      }}
                      className={css.flags}
                      code="US"
                    />
                    English
                  </li>
                  <li onClick={() => changeLanguage('es')}>
                    <Flag
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        width: '26px',
                        height: '26px',
                      }}
                      className={css.flags}
                      code="ES"
                    />
                    Español
                  </li>
                  <li onClick={() => changeLanguage('nl')}>
                    <Flag
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        width: '26px',
                        height: '26px',
                      }}
                      className={css.flags}
                      code="NL"
                    />
                    Dutch
                  </li>
                </ul>
              </div>
            )}
            {selectedLang == 'es' ?  <p>Español</p> : selectedLang == 'en' ? <p>English</p> : <p>Dutch</p>}
          </div>
          {!open && !showLangPopup && <SideBarTooltip id="language-tooltip" content="Language" />}
          <div data-tooltip-id={`${!open ? 'theme-tooltip' : ''}`}>
            <ThemeToggle className={css.darkMode}></ThemeToggle>
          </div>
          <div
            className={css.logout}
            onClick={handleLogoutClick}
            data-tooltip-id={`${!open ? 'logout-tooltip' : ''}`}
          >
            <TbLogout size={MENU_ICON_SIZE} color={MENU_ICON_COLOR} />
            <p>{t('sidebar.logout')}</p>
          </div>
          {!open && <SideBarTooltip id="theme-tooltip" content="Theme" />}
          {!open && <SideBarTooltip id="logout-tooltip" content="Logout" />}
        </div>
      </div>
      {showConfirm && (
        <ConfirmationModal
          message={t('ConfirmationModal.message')}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
          show={showConfirm}
        ></ConfirmationModal>
      )}
    </aside>
  );
}
