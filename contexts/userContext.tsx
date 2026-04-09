"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserContextType {
  user: any;
  updateUser: (newUserData: any) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: any;
}) {
  const [user, setUser] = useState(initialUser);
  const supabase = createClient();

  const updateUser = (newUserData: any) => {
    setUser((prev: any) => ({
      ...prev,
      user: {
        ...prev.user,
        user_metadata: {
          ...prev.user.user_metadata,
          ...newUserData.user_metadata,
        },
      },
    }));
  };

  const refreshUser = async () => {
    const {
      data: { user: freshUser },
    } = await supabase.auth.getUser();
    if (freshUser) {
      setUser((prev: any) => ({
        ...prev,
        user: freshUser,
      }));
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
