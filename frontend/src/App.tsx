import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// import PageNotFound from './pages/PageNotFound/PageNotFound';
// import Auth from './pages/Auth/Auth';
// import Profile from './pages/Profile/Profile';
// import Dashboard from './pages/Dashboard/Dashboard';
// import Chat from './pages/Chat/Chat';
// import Friends from './pages/Friends/Friends';
// import Leaderboard from './pages/Leaderboard/Leaderboard';
// import Game from './pages/Game/Game';
// import Oauth2Callback from './pages/Auth/Oauth2Callback';
// import UsersProfile from './pages/Profile/UsersProfile';
// import VerifyEmail from './pages/Auth/VerifyEmail';
// import ResetPassword from './pages/Auth/ResetPassword';

import { LoadingBarProvider } from './contexts/LoadingBarContext';
import PreLoader from './components/PreLoader/PreLoader';
// import Sidebar from './components/Sidebar/Sidebar';
// import Topbar from './components/Topbar/Topbar';
// import Footer from './components/Footer';
const Sidebar = React.lazy(() => import('./components/Sidebar/Sidebar'));
const Topbar = React.lazy(() => import('./components/Topbar/Topbar'));
const Footer = React.lazy(() => import('./components/Footer'));
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import { Suspense, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { UserProvider } from './contexts/UserContext';
import {
  GameInviteProvider,
  useGameInvite,
} from './contexts/GameInviteContext';
import ConnectionStatus from './components/ConnectionStatus';
import { SelectedConversationProvider } from './contexts/SelectedConversationContext';
import EditEmailVerification from './components/Profile/EditEmailVerification';

const PageNotFound = React.lazy(
  () => import('./pages/PageNotFound/PageNotFound')
);
const Auth = React.lazy(() => import('./pages/Auth/Auth'));
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Chat = React.lazy(() => import('./pages/Chat/Chat'));
const Friends = React.lazy(() => import('./pages/Friends/Friends'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard/Leaderboard'));
const Game = React.lazy(() => import('./pages/Game/Game'));
const Oauth2Callback = React.lazy(() => import('./pages/Auth/Oauth2Callback'));
const UsersProfile = React.lazy(() => import('./pages/Profile/UsersProfile'));
const VerifyEmail = React.lazy(() => import('./pages/Auth/VerifyEmail'));
const ResetPassword = React.lazy(() => import('./pages/Auth/ResetPassword'));

function App() {
  return (
    <Router>
      <LoadingBarProvider>
        <AuthProvider>
          <UserProvider>
            <GameInviteProvider>
              <WebSocketProvider>
                <SelectedConversationProvider>
                  <ConnectionStatus />
                  <ToastContainer
                    position="top-center"
                    autoClose={2000}
                    hideProgressBar={true}
                    // newestOnTop={true}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}
                    // draggable
                    // pauseOnHover
                    // theme="colored"
                    toastClassName="toastStyle"
                  />
                  <Suspense fallback={<PreLoader />}>
                    <AppContent />
                  </Suspense>
                </SelectedConversationProvider>
              </WebSocketProvider>
            </GameInviteProvider>
          </UserProvider>
        </AuthProvider>
      </LoadingBarProvider>
    </Router>
  );
}

function AppContent() {
  const showSidebarRoutes = [
    '/',
    '/test',
    '/play',
    '/chat',
    '/friends',
    '/search',
    '/store',
    '/leaderboard',
    // '/auth/2factor',
    '/profile',
    /^\/profile\/[^/]+\/?$/,
    '/auth/email-verification',
    '/auth/reset-password',
  ];
  const location = useLocation();
  const shouldShowSidebar = showSidebarRoutes.some((route) => {
    return typeof route === 'string'
      ? route === location.pathname || route + '/' === location.pathname
      : route.test(location.pathname);
  });
  const { isLoggedIn } = useAuth();
  // const loading = usePreLoader();

  // if (loading) {
  //   return <PreLoader />;
  // }
  const { gameAccepted, gameInvite } = useGameInvite();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameAccepted && gameInvite) {
      navigate(`/play`);
    }
  }, [gameAccepted, gameInvite]);

  return (
    <div className="app-container ">
      {/* <PreLoader /> */}
      {shouldShowSidebar && isLoggedIn && <Sidebar />}
      <div className={`main-content ${shouldShowSidebar ? '' : 'w-full'}`}>
        {shouldShowSidebar && isLoggedIn && <Topbar />}
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/oauth2/callback" element={<Oauth2Callback />} />
          <Route
            path="/auth/email-verification/:token"
            element={<VerifyEmail />}
          />
          <Route
            path="/auth/reset-password/:token"
            element={<ResetPassword />}
          />
          <Route path="*" element={<PageNotFound />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/play" element={<Game />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<UsersProfile />} />
            <Route
              path="/profile/update-email/:token"
              element={<EditEmailVerification />}
            />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
        {shouldShowSidebar && isLoggedIn && <Footer />}
      </div>
    </div>
  );
}

export default App;
