import { FontAwesome5 } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EmotionDropdown({
  label,
  value,
  placeholder,
  moods,
  icon,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  moods: string[];
  icon: React.ReactNode;
  onChange: (mood: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredMoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return moods;
    return moods.filter((m) => m.toLowerCase().includes(q));
  }, [query, moods]);

  return (
    <View style={{ marginBottom: 16 }}>
      <Pressable onPress={() => setOpen(true)}>
        <Text style={styles.label}>{label}</Text>
        <View pointerEvents="none" style={styles.input}>
          {icon}

          <TextInput
            placeholder={placeholder}
            value={value}
            placeholderTextColor="#fff"
            editable={false}
            style={styles.placeholder}
          />
        </View>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)} // Android back button
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>

            <View style={styles.input}>
              <FontAwesome5 name="search" size={16} color="#fff" />
              <TextInput
                autoFocus
                placeholder="Search for mood"
                placeholderTextColor="#fff"
                style={styles.placeholder}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            {filteredMoods?.length ? (
              <FlatList
                data={filteredMoods}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </Pressable>
                )}
              />
            ) : (
              <Text style={[styles.placeholder, { marginTop: 10 }]}>
                No results found
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#575d6d",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  placeholder: {
    color: "#fff",
    fontSize: 14,
    outlineWidth: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#171A1F",
    height: "70%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  search: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
});
