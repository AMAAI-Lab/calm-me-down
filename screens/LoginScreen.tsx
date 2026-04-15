import { useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  View,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import EmotionInput from "../components/ui/emotion-input";
import { useAuth } from "../context/AuthContext";
import {
  ARTISTS_BY_GENRE,
  GENRES,
  UserProfile,
} from "@/constants/appConstants";
import EmotionDropdown from "@/components/ui/emotion-dropdown";

export default function LoginScreen() {
  const { login } = useAuth();

  const [form, setForm] = useState<UserProfile>({
    name: "",
    nickName: "",
    age: "",
    email: "",
    favoriteGenre: "",
    favoriteBand: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserProfile, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof UserProfile, boolean>>
  >({});

  const FIELD_VALIDATORS: Partial<
    Record<
      keyof UserProfile,
      {
        required?: boolean;
        validate?: (value: string) => string | undefined;
      }
    >
  > = {
    name: {
      required: true,
      validate: (v) =>
        v.trim().length < 1 ? "Please enter the name." : undefined,
    },
    age: {
      required: true,
      validate: (v) => {
        if (v.trim().length < 1) {
          return "Please enter the age.";
        }
        const n = Number(v);
        if (isNaN(n) || !Number.isInteger(n)) return "Age must be a number.";
        return undefined;
      },
    },
    email: {
      required: true,
      validate: (v) => {
        if (v.trim().length < 1) {
          return "Please enter your email.";
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
          ? undefined
          : "Please enter a valid email.";
      },
    },
    nickName: {
      required: false,
    },
    favoriteGenre: {
      required: true,
      validate: (v) =>
        v.trim() === "" ? "Please select at least one genre." : undefined,
    },
    favoriteBand: {
      required: true,
      validate: (v) =>
        v.trim() === "" ? "Please select at least one artist." : undefined,
    },
  };

  const validateField = (
    key: keyof UserProfile,
    value: string,
  ): string | undefined => {
    const rule = FIELD_VALIDATORS[key];
    if (!rule) return undefined;
    return rule.validate?.(value);
  };

  const handleChange = (key: keyof UserProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
  };

  const isComplete = useMemo(() => {
    const errorKeys = Object.keys(errors) as (keyof UserProfile)[];
    return errorKeys.every((key) => !errors[key]);
  }, [errors]);

  const artistList: string[] = useMemo(() => {
    const selectedGenres = form.favoriteGenre
      ? form.favoriteGenre
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (selectedGenres.length === 0) {
      return Object.values(ARTISTS_BY_GENRE).flat();
    }

    const merged = selectedGenres.flatMap(
      (genre) => ARTISTS_BY_GENRE[genre] ?? [],
    );

    return [...new Set(merged)];
  }, [form.favoriteGenre]);

  const handleGenreChange = (genre: string) => {
    handleChange("favoriteGenre", genre);

    if (form.favoriteBand) {
      const newGenres = genre
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const validArtists = newGenres.flatMap((g) => ARTISTS_BY_GENRE[g] ?? []);
      const stillValid = form.favoriteBand
        .split(",")
        .map((s) => s.trim())
        .filter((a) => validArtists.includes(a))
        .join(", ");
      handleChange("favoriteBand", stillValid);
    }
    setErrors((prev) => ({
      ...prev,
      favoriteBand: validateField("favoriteBand", form.favoriteBand),
    }));
  };

  const validateAll = (): boolean => {
    type keyType = keyof UserProfile;
    const newErrors: Partial<Record<keyType, string>> = {};
    let valid = true;

    (Object.keys(FIELD_VALIDATORS) as keyType[]).forEach((key) => {
      const error = validateField(key, form[key] || "");
      if (error) {
        newErrors[key] = error;
        valid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.fromEntries(Object.keys(FIELD_VALIDATORS).map((k) => [k, true])),
    );
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;

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

  const populateForm = (isP: boolean = false) => {
    const form = {
      age: "23",
      favoriteGenre: "Pop, Indie",
      favoriteBand: "Dua Lipa, The Weeknd",
      nickName: "Mike",
    };

    if (isP) {
      setForm({
        ...form,
        name: "P 10",
        email: "p10@gmail.com",
      });
    } else {
      setForm({
        ...form,
        name: "Mike",
        email: "mike@gmail.com",
      });
    }

    setTouched({});
    setErrors({});
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{
        padding: 20,
        paddingTop: 60,
        paddingBottom: 100,
      }}
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
        error={touched.name ? errors.name : undefined}
      />
      <EmotionInput
        label="Nickname (optional)"
        placeholder="e.g. Gee, Star, Luna..."
        icon={<FontAwesome5 name="smile-beam" size={16} color="#fff" />}
        value={form?.nickName || ""}
        onChange={(t) => handleChange("nickName", t)}
        hint="Enter a name or nickname — this is how your lyrics will address you."
      />
      <EmotionInput
        label="Your age"
        placeholder="e.g. 24"
        icon={<FontAwesome5 name="birthday-cake" size={16} color="#fff" />}
        value={form.age}
        onChange={(t) => handleChange("age", t)}
        error={touched.age ? errors.age : undefined}
      />
      <EmotionInput
        label="Email"
        placeholder="e.g. alex@gmail.com"
        icon={<FontAwesome5 name="envelope" size={16} color="#fff" />}
        value={form.email}
        onChange={(t) => handleChange("email", t)}
        error={touched.email ? errors.email : undefined}
      />

      <EmotionDropdown
        label="Favorite genre"
        placeholder="Select a genre"
        icon={<FontAwesome5 name="music" size={16} color="#fff" />}
        value={form.favoriteGenre}
        moods={GENRES}
        onChange={handleGenreChange}
        multiple={true}
        error={touched.favoriteGenre ? errors.favoriteGenre : undefined}
      />
      <EmotionDropdown
        label="Favorite artist / band"
        placeholder={
          form.favoriteGenre
            ? `Artists in ${form.favoriteGenre}`
            : "Select a genre first"
        }
        icon={<FontAwesome5 name="headphones" size={16} color="#fff" />}
        value={form.favoriteBand}
        moods={artistList}
        onChange={(t) => handleChange("favoriteBand", t)}
        multiple={true}
        error={touched.favoriteBand ? errors.favoriteBand : undefined}
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

      {process.env?.EXPO_PUBLIC_APP_ENV === "development" && (
        <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <Pressable onPress={() => populateForm()} style={[styles.button]}>
            <Text style={styles.buttonText}>Regular User</Text>
          </Pressable>

          <Pressable onPress={() => populateForm(true)} style={[styles.button]}>
            <Text style={styles.buttonText}>Participant</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#171A1F",
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
