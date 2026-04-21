//React
import { useState } from 'react';
// Components
import AuthPongBox from '../../components/Auth/AuthPongBox';
import Login from './Login';
import Signup from './Signup';

import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
// Styles
import css from './Auth.module.css';


const Auth = () => {
    const [isLoginBox, setIsloginBox] = useState(true);
    const {isLoggedIn, isLoading} = useAuth();

    if (isLoading) {
      return
      // return <p>Loadding...</p>;
    }
    if (isLoggedIn) {
      return <Navigate to={'/'}/>
    }

    return (
      <div className={css.authContainer}>
          <div className={`${css.authFormBox} ${!isLoginBox ? css.authFormSwitch : ''}`}>
            {isLoginBox ? <Login /> : <Signup setIslogin={setIsloginBox} /> }
            <div className={css.authFooter}>
              <p>{isLoginBox ? "Don't have an account?" : 'Already have an account?'}</p>
              <button onClick={() => { setIsloginBox(!isLoginBox);}}>
                {isLoginBox ? 'Signup' : 'Login'}
              </button>
            </div>
          </div>
        <AuthPongBox isLogin={isLoginBox} />
      </div>
    );
}

export default Auth
