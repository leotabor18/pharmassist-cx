import React, { createContext, useReducer, ReactNode, Dispatch, useEffect } from 'react';
import AuthReducer, { initialState, AuthActionPayload, initialStateTypes, AuthAction } from '@/reducer/AuthReducer';
import { getLocalStorageItem } from '@/util';
import { router } from 'expo-router';

interface AuthContextProps {
  state: initialStateTypes;
  dispatch: Dispatch<AuthActionPayload>;
}

export const AuthContext = createContext<AuthContextProps>({
  state: initialState,
  dispatch: () => undefined,
});

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  useEffect(() => {
    const loadInitialState = async () => {
      const user = await getLocalStorageItem('user');
      const token = await getLocalStorageItem('token');
      if (user && token) {
        dispatch({
          type: AuthAction.LOGIN, 
          payload: { user, token },
        });
      } else {
        router.push('/login')
      }
    };

    loadInitialState();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
