import { createContext, useContext, useEffect, useState } from "react";
import { getUserLocal, saveUserLocal } from "../services/LocalUserService";
import { UserProfile } from "@/constants/appConstants";
import { saveUserInDB } from "@/services/DbService";

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await getUserLocal();
      setUser(storedUser);
      setLoading(false);
    })();
  }, []);

  const login = async (userData: UserProfile) => {
    await saveUserInDB(userData);
    await saveUserLocal(userData);
    setUser(userData);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);