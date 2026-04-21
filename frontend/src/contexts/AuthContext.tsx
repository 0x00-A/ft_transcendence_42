// React
import {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
  SetStateAction,
  Dispatch,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
// API
import apiClient from '../api/apiClient';
import { API_LOGOUT_URL, API_CONFIRM_LOGIN_URL } from '@/api/apiConfig';
import axios from 'axios';


interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    if (!isLoggedIn) {
      return;
    }
    try {
      const response = await apiClient.post(API_LOGOUT_URL);
      response;
      setIsLoggedIn(false);
      navigate('/auth')
    }
    catch (error) {

    }
  }

  useEffect(() => {
    // if (!isLoggedIn) {
    //   return;
    // }
    apiClient.get(API_CONFIRM_LOGIN_URL)
    .then(() => {
      setIsLoggedIn(true);
    })
    .catch(() => {
      logout();
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isLoggedIn && error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [isLoggedIn, setIsLoggedIn]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
