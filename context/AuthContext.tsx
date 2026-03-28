import { login as apiLogin, signup as apiSignup } from "@/api/auth";
import { setApiToken, setUnauthorizedHandler } from "@/api/client";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

const TOKEN_KEY = "auth_token";

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((t) => {
      if (t) setAuth(t);
    });
  }, []);

  const setAuth = (t: string) => {
    setToken(t);
    setApiToken(t);
    SecureStore.setItemAsync(TOKEN_KEY, t);
  };

  const login = async (email: string, password: string) => {
    console.log("[auth] login attempt: ", { email });
    try {
      const data = await apiLogin(email, password);
      console.log("[auth] login response: ", data);
      setAuth(data.token);
      console.log("[auth] login success, token set");
    } catch (e: any) {
      console.log(
        "[auth] login error: ",
        e?.response?.status,
        e?.response?.data ?? e?.message,
      );
      throw e;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    console.log("[auth] signup attempt →", { name, email });
    try {
      const data = await apiSignup(name, email, password);
      console.log("[auth] signup response ←", data);
      if (data.token) {
        setAuth(data.token);
        console.log("[auth] signup success, token set");
      } else {
        console.log("[auth] signup success, no token in response");
      }
    } catch (e: any) {
      console.log(
        "[auth] signup error ←",
        e?.response?.status,
        e?.response?.data ?? e?.message,
      );
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setApiToken(null);
    SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
