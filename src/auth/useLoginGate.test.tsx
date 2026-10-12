import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoginGate } from './useLoginGate';

const mockAuth = { isLoggedIn: false };

vi.mock('./AuthContext', () => ({
  useAuth: () => mockAuth
}));

vi.mock('../components/shared/LoginModal', () => ({
  LoginModal: () => null
}));

interface GateProps {
  open: boolean;
  onClose: () => void;
}

describe('useLoginGate', () => {
  beforeEach(() => {
    mockAuth.isLoggedIn = false;
    localStorage.clear();
  });

  function gateProps(result: { current: { loginGate: React.ReactNode } }): GateProps {
    return (result.current.loginGate as React.ReactElement<GateProps>).props;
  }

  it('resolves true immediately when already logged in', async () => {
    mockAuth.isLoggedIn = true;
    const { result } = renderHook(() => useLoginGate());
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.requireLogin();
    });
    expect(outcome).toBe(true);
    expect(gateProps(result).open).toBe(false);
  });

  it('shows the login dialog and resolves false when dismissed without login', async () => {
    const { result } = renderHook(() => useLoginGate());
    let promise!: Promise<boolean>;
    act(() => {
      promise = result.current.requireLogin();
    });
    expect(gateProps(result).open).toBe(true);
    act(() => {
      gateProps(result).onClose();
    });
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await promise;
    });
    expect(outcome).toBe(false);
    expect(gateProps(result).open).toBe(false);
  });

  it('resolves true after a successful login and closes the dialog', async () => {
    const { result, rerender } = renderHook(() => useLoginGate());
    let promise!: Promise<boolean>;
    act(() => {
      promise = result.current.requireLogin();
    });
    expect(gateProps(result).open).toBe(true);
    mockAuth.isLoggedIn = true;
    rerender();
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await promise;
    });
    expect(outcome).toBe(true);
    expect(gateProps(result).open).toBe(false);
  });
});
