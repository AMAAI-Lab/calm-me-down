import { useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import EmotionInput from "../components/ui/emotion-input";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "@/constants/appConstants";

export default function LoginScreen() {
  const { login } = useAuth();

  const [form, setForm] = useState<UserProfile>({
    name: "",
    age: "",
    email: "",
    favoriteGenre: "",
    favoriteBand: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof UserProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isComplete = useMemo(
    () => Object.values(form).every((v) => v.trim() !== ""),
    [form],
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await login(form);
      // navigation handled automatically by RootNavigator
    } catch (err: any) {
      Alert.alert("Login failed", "Please try again.");
      console.error("Error while loggin in: ", err?.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Emotion to Lyric Generator 🎧</Text>

        <EmotionInput
          label="Your name"
          placeholder="e.g. Alex"
          icon={<FontAwesome5 name="user" size={16} color="#fff" />}
          value={form.name}
          onChange={(t) => handleChange("name", t)}
        />
        <EmotionInput
          label="Your age"
          placeholder="e.g. 24"
          icon={<FontAwesome5 name="birthday-cake" size={16} color="#fff" />}
          value={form.age}
          onChange={(t) => handleChange("age", t)}
        />
        <EmotionInput
          label="Email"
          placeholder="e.g. alex@gmail.com"
          icon={<FontAwesome5 name="envelope" size={16} color="#fff" />}
          value={form.email}
          onChange={(t) => handleChange("email", t)}
        />
        <EmotionInput
          label="Favorite genre"
          placeholder="Pop, Rock, Indie, EDM..."
          icon={<FontAwesome5 name="music" size={16} color="#fff" />}
          value={form.favoriteGenre}
          onChange={(t) => handleChange("favoriteGenre", t)}
        />
        <EmotionInput
          label="Favorite band / artist"
          placeholder="Coldplay, Arctic Monkeys, Imagine Dragons..."
          icon={<FontAwesome5 name="headphones" size={16} color="#fff" />}
          value={form.favoriteBand}
          onChange={(t) => handleChange("favoriteBand", t)}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={!isComplete}
          style={[styles.button, !isComplete && !loading && { opacity: 0.4 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size={30} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#171A1F",
  },
  container: {
    flex: 1,
    backgroundColor: "#171A1F",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#9b5cff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
