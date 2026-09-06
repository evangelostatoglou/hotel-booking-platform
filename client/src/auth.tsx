import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "./api";
import type { User } from "./api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (values: Record<string, unknown>) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedUser = useRef(false);

  useEffect(() => {
    // React StrictMode can run effects twice in development.
    // This guard prevents two initial /auth/me requests.
    if (hasCheckedUser.current) return;
    hasCheckedUser.current = true;

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem("hotelTatoliUser", JSON.stringify(currentUser));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await loginUser(email, password);
    setUser(data.user);
    localStorage.setItem("hotelTatoliUser", JSON.stringify(data.user));
    return data.user;
  }

  async function register(values: Record<string, unknown>) {
    const data = await registerUser(values);
    setUser(data.user);
    localStorage.setItem("hotelTatoliUser", JSON.stringify(data.user));
    return data.user;
  }

  async function logout() {
    await logoutUser().catch(() => undefined);
    setUser(null);
    localStorage.removeItem("hotelTatoliUser");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// This hook belongs with the provider because it reads the provider's context.
// The lint rule is meant for files that export unrelated non-components.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
