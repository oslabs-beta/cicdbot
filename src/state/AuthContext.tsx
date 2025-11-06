import React, { createContext, useContext, useState } from "react";
import type { UserRole } from "../types";

interface AuthState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  username: string;
  setUsername: (name: string) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<UserRole>("MARKETER");
  const [username, setUsername] = useState<string>("Alex");

  return (
    <AuthContext.Provider value={{ role, setRole, username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};