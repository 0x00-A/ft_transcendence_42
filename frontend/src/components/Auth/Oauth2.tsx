// Styles
import css from './Oauth2.module.css';
// Logos
// import IntraLogo from '/assets/42Logo.svg';
import { IconContext } from 'react-icons';
import { FcGoogle } from 'react-icons/fc';
// import DiscordIcon from '/assets/discordIcon.svg';
// API URL
import { API_OAUTH2_URL } from '../../api/apiConfig';

const Oauth2 = () => {
  const handleOauth2 = (provider: string) => {
    // const link = `${API_OAUTH2_URL}/${provider}&redirect_url=${OAUTH2_CALLBACK_URL}` ;
    const link = `${API_OAUTH2_URL}/${provider}/`;
    window.location.href = link;
  };

  return (
    <div className={css.oauth2Container}>
      <div className={css.or}>
        <div />
        <p>OR</p>
        <div />
      </div>
      <div className={css.oauth2Buttons}>
        <button
          className={css.oauthBtn}
          type="submit"
          onClick={() => handleOauth2('intra')}
        >
          <img src="/assets/42Logo.svg" alt="?" className={css.oauth2Icon} />
        </button>
        <button
          className={css.oauthBtn}
          type="submit"
          onClick={() => handleOauth2('google')}
        >
          <IconContext.Provider value={{ size: '2em' }}>
            <FcGoogle className={css.oauth2Icon} />
          </IconContext.Provider>
        </button>
        <button
          className={css.oauthBtn}
          type="submit"
          onClick={() => handleOauth2('discord')}
        >
          <img
            src="/assets/discordIcon.svg"
            alt="?"
            className={css.oauth2Icon}
          />
        </button>
      </div>
    </div>
  );
};

export default Oauth2;
