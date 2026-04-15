import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function EmotionDropdown({
  label,
  value,
  placeholder,
  moods,
  icon,
  onChange,
  multiple = false,
  disableSearch = false,
  error,
}: {
  label: string;
  value: string;
  placeholder: string;
  moods: string[];
  icon: React.ReactNode;
  onChange: (value: string) => void;
  multiple?: boolean;
  disableSearch?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected: string[] = useMemo(
    () =>
      value
        ? value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    [value],
  );

  const filteredMoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return moods;
    // return moods.filter((m) => m.toLowerCase().includes(q));

    const match = (m: string) => m.toLowerCase().includes(q);
    const list = moods.filter(match);
    const isExist = moods.some(match);

    if (isExist) return list;
    return [...list, query];
  }, [query, moods]);

  const handleSelect = (item: string) => {
    if (!multiple) {
      onChange(item);
      setOpen(false);
      setQuery("");
      return;
    }

    const alreadySelected = selected.includes(item);
    const next = alreadySelected
      ? selected.filter((s) => s !== item)
      : [...selected, item];

    onChange(next.join(", "));
  };

  const removeChip = (item: string) => {
    onChange(selected.filter((s) => s !== item).join(", "));
  };

  const displayValue = selected.join(", ");

  return (
    <View style={{ marginBottom: 16 }}>
      <Pressable onPress={() => setOpen(true)}>
        <Text style={styles.label}>{label}</Text>
        <View
          pointerEvents="none"
          style={[
            styles.input,
            { marginBottom: 0 },
            error && styles.inputError,
          ]}
        >
          {icon}

          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.placeholder, { flex: 1, paddingVertical: 10 }]}
          >
            {displayValue || placeholder}
          </Text>
        </View>
      </Pressable>

      {error && (
        <Text style={styles.errorText}>
          <FontAwesome5 name="exclamation-circle" size={11} color="#ff6b6b" />
          {"  "}
          {error}
        </Text>
      )}

      {multiple && selected.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {selected.map((item) => (
            <Pressable
              key={item}
              style={styles.chip}
              onPress={() => removeChip(item)}
            >
              <Text style={styles.chipText}>{item}</Text>
              <FontAwesome5
                name="times"
                size={10}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>

            {!disableSearch && (
              <View style={styles.input}>
                <FontAwesome5 name="search" size={16} color="#fff" />
                <TextInput
                  autoFocus
                  placeholder="Search..."
                  placeholderTextColor="#fff"
                  style={styles.placeholder}
                  value={query}
                  onChangeText={setQuery}
                />
              </View>
            )}

            {filteredMoods.length ? (
              <FlatList
                data={filteredMoods}
                keyExtractor={(item, idx) => item + idx}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = selected.includes(item);
                  return (
                    <Pressable
                      style={[
                        styles.option,
                        isSelected && styles.optionSelected,
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                      {multiple && isSelected && (
                        <FontAwesome5 name="check" size={14} color="#fff" />
                      )}
                    </Pressable>
                  );
                }}
              />
            ) : (
              <Text style={[styles.placeholder, { marginTop: 10 }]}>
                No results found
              </Text>
            )}

            {multiple && (
              <Pressable
                style={styles.doneButton}
                onPress={() => {
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Text style={styles.doneText}>
                  Done {selected?.length ? `(${selected.length} selected)` : ""}
                </Text>
              </Pressable>
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
    marginBottom: 10,
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
    marginBottom: 50,
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
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
  },
  optionSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ffffff47",
  },
  doneButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },
  doneText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
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
