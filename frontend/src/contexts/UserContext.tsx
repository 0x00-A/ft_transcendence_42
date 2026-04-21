import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '@/types/apiTypes';
import { useGetData } from '@/api/apiHooks';
import { useAuth } from './AuthContext';

interface UserContextType {
  user: User | null | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UserProviderProps {
  children: ReactNode;
}

const defaultContextValue: UserContextType = {
  user: null,
  isLoading: true,
  error: null,
  refetch: () => {},
};

const UserContext = createContext<UserContextType>(defaultContextValue);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();


  // const { data: user, isLoading, error, refetch } = useGetData<UserProfileData>(API_GET_PROFILE_URL,
  // {
  //   enabled: isLoggedIn, // React Query will skip the query if this is false
  // }
  const { data: user, isLoading, error, refetch } = useGetData<User>('matchmaker/current-user/me',
  {
    enabled: isLoggedIn, // React Query will skip the query if this is false
  }
  );

  const contextValue = isLoggedIn
    ? { user, isLoading, error, refetch }
    : { user: null, isLoading: false, error: null, refetch: () => {} };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
