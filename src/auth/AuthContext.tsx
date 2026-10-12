import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { authorizeForm, basicProfileGetSingle, setAccessToken } from '../api/client';
import type { components } from '../api/schema';
import { storageDelete, storageGet, storageSet } from '../utils/storage';

type S = components['schemas'];
export type BasicProfile = S['BasicProfileResponse']['basicProfile'] & { profile_picture: string };

interface AuthMessage {
  source: string;
  action: 'delete' | 'refresh';
  session?: S['AuthResponse'];
}

interface AuthContextValue {
  user: BasicProfile | null | undefined;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BROADCAST_CHANNEL = 'ksi-login';

function getProfilePictureUrl(profile: { profile_picture?: string; gender?: string }): string {
  if (profile.profile_picture) return profile.profile_picture;
  return `/assets/img/avatar/default${profile.gender === 'male' ? '' : '-woman'}.svg`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [loggedIn, setLoggedIn] = useState(false);
  const refreshTimer = useRef<number | null>(null);
  const instanceId = useRef(uuidv4());
  const channelRef = useRef<BroadcastChannel | null>(null);

  const clearTimer = () => {
    if (refreshTimer.current !== null) {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  };

  const broadcast = useCallback((action: 'delete' | 'refresh', session?: S['AuthResponse']) => {
    const message: AuthMessage = { source: instanceId.current, action, session };
    channelRef.current?.postMessage(message);
  }, []);

  const applySession = useCallback((session: S['AuthResponse']) => {
    setAccessToken(session.access_token);
    setLoggedIn(true);
    clearTimer();
    refreshTimer.current = window.setTimeout(() => {
      void handleRefreshToken(session.refresh_token);
    }, Math.floor(session.expires_in * 1000 * 0.9));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteSession = useCallback(() => {
    clearTimer();
    setAccessToken(undefined);
    if (storageGet('auth', 'session')) {
      storageDelete('auth', 'session');
      broadcast('delete');
    }
    setLoggedIn(false);
  }, [broadcast]);

  const saveSession = useCallback((session: S['AuthResponse']) => {
    storageSet('auth', 'session', { ...session, expires_in: Date.now() + session.expires_in * 1000 });
    broadcast('refresh', session);
    applySession(session);
  }, [applySession, broadcast]);

  const handleRefreshToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const resp = await authorizeForm('refresh_token', '', '', token);
      saveSession(resp);
      return true;
    } catch {
      deleteSession();
      return false;
    }
  }, [saveSession, deleteSession]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const resp = await authorizeForm('password', username, password);
      saveSession(resp);
      return true;
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 400 || status === 401) {
        deleteSession();
        return false;
      }
      throw e;
    }
  }, [saveSession, deleteSession]);

  const logout = useCallback(() => {
    deleteSession();
    queryClient.clear();
  }, [deleteSession, queryClient]);

  const refreshUser = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['basicProfile'] });
  }, [queryClient]);

  useEffect(() => {
    // load saved session
    const sessionAbsolute = storageGet<S['AuthResponse'] & { expires_in: number }>('auth', 'session');
    if (!sessionAbsolute) {
      setLoggedIn(false);
    } else {
      const expiresIn = Math.floor((sessionAbsolute.expires_in - Date.now()) / 1000);
      if (expiresIn > 0) {
        applySession({ ...sessionAbsolute, expires_in: expiresIn });
      } else {
        void handleRefreshToken(sessionAbsolute.refresh_token);
      }
    }
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (message: MessageEvent<AuthMessage>) => {
      if (message.data.source === instanceId.current) return;
      if (message.data.action === 'delete') {
        deleteSession();
      } else if (message.data.action === 'refresh' && message.data.session) {
        applySession(message.data.session);
      }
    };
    return () => {
      channel.close();
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userQuery = useQuery({
    queryKey: ['basicProfile', loggedIn],
    queryFn: async (): Promise<BasicProfile | null> => {
      if (!loggedIn) return null;
      const resp = await basicProfileGetSingle();
      if (resp?.basicProfile && (resp.basicProfile.signed_in as unknown as string)) {
        return { ...resp.basicProfile, profile_picture: getProfilePictureUrl(resp.basicProfile) };
      }
      deleteSession();
      return null;
    },
    staleTime: 60_000
  });

  const value = useMemo<AuthContextValue>(() => ({
    user: userQuery.data,
    isLoggedIn: loggedIn && !!userQuery.data,
    login,
    logout,
    refreshUser
  }), [userQuery.data, loggedIn, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
