import type { Entity } from '@monorise/base';
import { produce } from 'immer';
import type { AuthService } from '../services/auth.service';
import type { MonoriseStore } from '../store/monorise.store';

const initAuthActions = (store: MonoriseStore, authService: AuthService) => {
  const requestLogin = async (
    entityType: Entity,
    payload: { email: string },
  ) => {
    const { data } = await authService.requestLoginMagicLink(
      entityType,
      payload,
    );

    return data;
  };

  const useProfile = <T extends Record<string, unknown>>(): T & {
    displayName: string;
    email: string;
    accountId: string;
    impersonatorId?: string;
  } => {
    const profile = store((state) => state.auth.profile);

    return profile as T & typeof profile;
  };

  const getProfile = async () => {
    try {
      const {
        data: { displayName, email, accountId, ...rest },
      } = await authService.getSessionProfile();

      store.setState(
        produce((state) => {
          state.auth.isUnauthorized = false;
          state.auth.profile = {
            displayName,
            email,
            accountId,
            ...rest,
          };
        }),
        undefined,
        'mr/auth/get-profile',
      );
    } catch (err) {
      store.setState(
        produce((state) => {
          state.auth.isUnauthorized = true;
          state.auth.profile = {};
        }),
        undefined,
        'mr/auth/get-profile',
      );
    }
  };

  const useIsUnauthorized = () => {
    return store((state) => state.auth.isUnauthorized);
  };

  const setIsUnauthorized = (isUnauthorized: boolean) =>
    store.setState(
      produce((state) => {
        state.auth.isUnauthorized = isUnauthorized;
      }),
    );

  const logout = () => {
    authService.logout();
    store.setState(
      produce((state) => {
        state.auth.isUnauthorized = true;
        state.auth.profile = {};
      }),
    );
  };

  return {
    requestLogin,
    useProfile,
    getProfile,
    useIsUnauthorized,
    setIsUnauthorized,
    logout,
  };
};

export { initAuthActions };

export type AuthActions = ReturnType<typeof initAuthActions>;
