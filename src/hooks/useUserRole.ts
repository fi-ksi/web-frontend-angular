import { useAuth } from '../auth/AuthContext';
import type { components } from '../api/schema';

type S = components['schemas'];

export interface UserRoleFlags {
  role: S['UserRole'] | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isOrg: boolean;
  isTester: boolean;
  isParticipant: boolean;
  isParticipantHidden: boolean;
}

/**
 * Port of UserService role observables. Role hierarchy:
 * admin > org > tester > participant > participant_hidden
 */
export function useUserRole(): UserRoleFlags {
  const { user, isLoggedIn } = useAuth();
  const role = user?.role ?? null;

  const isAdmin = role === 'admin';
  const isOrg = isAdmin || role === 'org';
  const isTester = isOrg || role === 'tester';
  const isParticipant = isTester || role === 'participant';
  const isParticipantHidden = isParticipant || role === 'participant_hidden';

  return { role, isLoggedIn, isAdmin, isOrg, isTester, isParticipant, isParticipantHidden };
}
