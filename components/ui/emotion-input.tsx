import { FontAwesome5 } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function EmotionInput({
  label,
  placeholder,
  icon,
  value,
  hint,
  error,
  onChange,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  hint?: string;
  error?: string;
  onChange: (t: string) => void;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.emotionLabel}>{label}</Text>
      <View style={[styles.emotionInput, error && styles.inputError]}>
        {icon}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#fff"
          style={styles.emotionTextInput}
          value={value}
          onChangeText={onChange}
        />
      </View>

      {hint && <Text style={styles.hint}>{hint}</Text>}
      {error && (
        <Text style={styles.errorText}>
          <FontAwesome5 name="exclamation-circle" size={11} color="#ff6b6b" />
          {"  "}
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emotionLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },
  emotionInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#575d6d",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  emotionTextInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    outlineWidth: 0,
  },
  hint: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    marginLeft: 2,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
