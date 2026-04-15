import { createContext, useContext, useEffect, useState } from "react";
import { getUserLocal, saveUserLocal } from "../services/LocalUserService";
import { UserProfile } from "@/constants/appConstants";
import { saveUserInDB } from "@/services/DbService";
import { checkForParticipantEmail } from "@/util/commonUtils";

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  isParticipant: boolean;
  login: (user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    (async () => {
      const storedUser = await getUserLocal();
      setUser(storedUser);
      setLoading(false);

      const isParticipantEmail = checkForParticipantEmail(storedUser?.email || "");
      setIsParticipant(isParticipantEmail);
    })();
  }, []);

  const login = async (userData: UserProfile) => {
    await saveUserInDB(userData);
    await saveUserLocal(userData);
    setUser(userData);

    const isParticipantEmail = checkForParticipantEmail(userData?.email || "");
    setIsParticipant(isParticipantEmail);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isParticipant }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
