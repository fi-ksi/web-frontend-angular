import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { LoginModal } from '../components/shared/LoginModal';
import { storageGet } from '../utils/storage';

interface LoginGate {
  /**
   * Ensures the user is signed in before continuing an action. Resolves true
   * immediately when already signed in; otherwise shows the login dialog and
   * resolves true only after a successful login, false when the dialog is
   * dismissed without logging in.
   */
  requireLogin: () => Promise<boolean>;
  /** Render next to the triggering UI; shows the login dialog on demand. */
  loginGate: React.ReactNode;
}

/**
 * Login-then-continue gate for actions that need a signed-in user (discussion
 * replies, new threads). Mirrors the Angular UserService.afterLogin$ behavior:
 * the follow-up UI opens only after the user is authenticated, instead of
 * failing with a 401 on save.
 */
export function useLoginGate(): LoginGate {
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const pendingRef = useRef<Array<(ok: boolean) => void>>([]);
  const isLoggedInRef = useRef(isLoggedIn);
  isLoggedInRef.current = isLoggedIn;

  const settle = useCallback((ok: boolean) => {
    const resolvers = pendingRef.current;
    pendingRef.current = [];
    if (resolvers.length > 0) {
      setOpen(false);
      resolvers.forEach((resolve) => resolve(ok));
    }
  }, []);

  const requireLogin = useCallback((): Promise<boolean> => {
    if (isLoggedInRef.current) {
      return Promise.resolve(true);
    }
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      pendingRef.current.push(resolve);
    });
  }, []);

  // A successful login flips the auth state once the profile loads; settle
  // positively then. This also covers the login dialog closing itself right
  // after a successful login.
  useEffect(() => {
    if (isLoggedIn) {
      settle(true);
    }
  }, [isLoggedIn, settle]);

  const handleClose = useCallback(() => {
    setOpen(false);
    // The login dialog reports a successful login through onClose as well, so
    // the session presence tells the two cases apart: the session is stored
    // synchronously on success, while a dismissal leaves no session behind.
    // On success the effect above settles positively once auth state lands.
    if (!storageGet('auth', 'session')) {
      settle(false);
    }
  }, [settle]);

  const loginGate = (
    <LoginModal
      open={open}
      onClose={handleClose}
      onOpenRegister={() => {}}
      onOpenResetPassword={() => {}}
    />
  );

  return { requireLogin, loginGate };
}
