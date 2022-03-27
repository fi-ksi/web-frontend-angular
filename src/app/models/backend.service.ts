import { AuthResponse } from "../../api";

export interface AuthMessage {
  source: string;
  action: AuthMessageAction;
  session?: AuthResponse;
}

export type AuthMessageAction = 'delete' | 'refresh';
