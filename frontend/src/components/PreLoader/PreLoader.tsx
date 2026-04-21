// import { useEffect, useState } from 'react';
import css from './pong.module.css';
// import { useAuth } from '@/contexts/AuthContext';

const PreLoader = () => {
  // const [hidden, setHidden] = useState(false);
  // const {isLoading} = useAuth()

  // if (!isLoggedIn)
  //   return
  // useEffect(() => {
  //   setTimeout(() => {
  //     setHidden(true);
  //   }, 1500);
  // }, []);

  // useEffect(() => {
  //   window.onload = () => {
  //     setHidden(true);
  //   };

  //   return () => {
  //     window.onload = null;
  //     setHidden(true);
  //   };
  // }, []);

  return (
    <>
      {/* {!hidden || isLoading && ( */}
      <div
        className={css.preloader}
        // style={{ display: hidden ? 'flex' : 'flex' }}
      >
        <div className={css.pong}>
          <div className="bg-white"></div>
          <div className="bg-white"></div>
          <div className="bg-white"></div>
        </div>
      </div>
      {/* )} */}
    </>
  );


};

export default PreLoader;
