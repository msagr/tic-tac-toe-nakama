"use client";

import { Session } from "@heroiclabs/nakama-js";
import {
  createContext,
  useContext,
  useState,
  useEffect,
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

const STORAGE_KEY = "nakamaSession";

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Start with no user on both server and client so the initial HTML matches.
  const [user, setUser] = useState<Session | null>(() => {
  if (typeof window === "undefined") {
    // During SSR / initial render on server
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as Session;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
});



  // Keep localStorage in sync with the latest user state.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
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