import { StyleSheet, Text, TextInput, View } from "react-native";

export default function EmotionInput({
  label,
  placeholder,
  icon,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.emotionLabel}>{label}</Text>
      <View style={styles.emotionInput}>
        {icon}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#fff"
          style={styles.emotionTextInput}
          value={value}
          onChangeText={onChange}
          keyboardType={label === "Your age" ? "number-pad" : "default"}

          // keyboardType={label === "Your age" ? "number-pad" : "default"}
        />
      </View>
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
});
