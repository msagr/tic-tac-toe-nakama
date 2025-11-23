"use client";

import { Session } from "@heroiclabs/nakama-js";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  createElement
} from "react";

// export type User = {
//   user_id: string;
//   username: string;
//   refresh_token: string,
//   refresh_exprires_at: number,
//   token: string,
//   email?: string;
// };

type UserContextValue = {
  user: Session | null;
  setUser: Dispatch<SetStateAction<Session | null>>;
  logout: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);

  const logout = () => {
    setUser(null);
    // TODO: clear Nakama session / tokens if needed
  };

  const value: UserContextValue = {
    user,
    setUser,
    logout,
  };

  return createElement(UserContext.Provider, { value }, children);
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}