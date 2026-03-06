import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/constants/appConstants";

const USER_KEY = "@user_profile";

export const saveUserLocal = async (user: UserProfile) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUserLocal = async (): Promise<UserProfile | null> => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

// export const clearUserLocal = async () => {
//   await AsyncStorage.removeItem(USER_KEY);
// };