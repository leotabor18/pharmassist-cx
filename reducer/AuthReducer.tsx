import { getLocalStorageItem } from '@/util';
import { User } from '@/util/types';

export type initialStateTypes = {
  user: any | null;
  token: any | null;
};

export enum AuthAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
}

export type AuthActionPayload = {
  type: AuthAction;
  payload?: Partial<initialStateTypes>;
};

export const initialState: initialStateTypes = {
  user: null,
  token: null
};

const AuthReducer = (state: initialStateTypes, action: AuthActionPayload): initialStateTypes => {
  switch (action.type) {
    case AuthAction.LOGIN:
      return {
        ...state,
        user: action.payload?.user || null,
        token: action.payload?.token || null,
      };
    case AuthAction.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
      };
    case AuthAction.UPDATE_ACCOUNT:
      return {
        ...state,
        user: action.payload?.user || state.user,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default AuthReducer;
