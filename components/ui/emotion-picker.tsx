import {
  ALL_QUADRANTS,
  EMOTION_MAP,
  EMOTION_PICKER_QUADRANTS,
  EmotionPoint,
  QuadrantKey,
} from "@/constants/appConstants";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ──────────────────────────────────────────────────────────────────────────
// Quadrant setup — computed from valence/arousal, not hardcoded per emotion,
// so this stays correct if EMOTION_MAP changes.
// ──────────────────────────────────────────────────────────────────────────

const VALENCE_MID = 5;
const AROUSAL_MID = 5;
const QUADRANTS = EMOTION_PICKER_QUADRANTS;

function getQuadrant(e: EmotionPoint): QuadrantKey {
  const highV = e.valence >= VALENCE_MID;
  const highA = e.arousal >= AROUSAL_MID;
  if (highV && highA) return "sunny";
  if (!highV && highA) return "stormy";
  if (!highV && !highA) return "rainy";
  return "breezy";
}

const EMOTIONS_BY_QUADRANT: Record<QuadrantKey, EmotionPoint[]> = (() => {
  const grouped: Record<QuadrantKey, EmotionPoint[]> = {
    sunny: [],
    stormy: [],
    rainy: [],
    breezy: [],
  };
  EMOTION_MAP.forEach((e) => grouped[getQuadrant(e)].push(e));
  return grouped;
})();

type EmotionListItem = { emotion: string; isCustom?: boolean };
type Stage = "quadrant" | "emotions";

function EmotionPickerModal({
  visible,
  title,
  allowedQuadrants,
  allowCustomEmotion,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  allowedQuadrants: QuadrantKey[];
  allowCustomEmotion: boolean;
  onClose: () => void;
  onSelect: (emotion: string, quadrant: QuadrantKey) => void;
}) {
  const [stage, setStage] = useState<Stage>("quadrant");
  const [activeQuadrant, setActiveQuadrant] = useState<QuadrantKey | null>(
    null,
  );
  const [query, setQuery] = useState("");

  const reset = () => {
    setStage("quadrant");
    setActiveQuadrant(null);
    setQuery("");
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  const handleQuadrantPress = (key: QuadrantKey) => {
    setActiveQuadrant(key);
    setStage("emotions");
  };
  const handleEmotionPress = (emotion: string) => {
    if (!activeQuadrant) return;
    onSelect(emotion, activeQuadrant);
    reset();
    onClose();
  };

  const displayList: EmotionListItem[] = useMemo(() => {
    if (!activeQuadrant) return [];
    const base = EMOTIONS_BY_QUADRANT[activeQuadrant].filter((e) =>
      e.emotion.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const list: EmotionListItem[] = base.map((e) => ({ emotion: e.emotion }));

    const trimmed = query.trim();
    const exactMatch = EMOTIONS_BY_QUADRANT[activeQuadrant].some(
      (e) => e.emotion.toLowerCase() === trimmed.toLowerCase(),
    );
    if (allowCustomEmotion && trimmed.length > 0 && !exactMatch) {
      list.push({ emotion: trimmed, isCustom: true });
    }
    return list;
  }, [activeQuadrant, query, allowCustomEmotion]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <SafeAreaView
        style={[styles.sheet, stage === "emotions" && { minHeight: "80%" }]}
      >
        <View style={styles.sheetHeader}>
          {stage === "emotions" && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setStage("quadrant");
                setQuery("");
              }}
              hitSlop={10}
            >
              <Text style={styles.backChevron}>{"‹"}</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}

          <Text
            style={[
              styles.sheetTitle,
              // stage === "emotions" && { marginRight: 35 },
            ]}
          >
            {stage === "quadrant" ? title : QUADRANTS[activeQuadrant!].label}
          </Text>

          <TouchableOpacity onPress={handleClose} hitSlop={10}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {stage === "quadrant" ? (
          <>
            <Text style={styles.helperText}>
              Pick the one that feels closest
            </Text>
            <View style={styles.quadrantGrid}>
              {allowedQuadrants.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.quadrantTile,
                    { backgroundColor: QUADRANTS[key].bg },
                  ]}
                  onPress={() => handleQuadrantPress(key)}
                >
                  <Text style={styles.quadrantEmoji}>
                    {QUADRANTS[key].emoji}
                  </Text>
                  <Text style={styles.quadrantLabel}>
                    {QUADRANTS[key].label}
                  </Text>
                  <Text style={styles.quadrantSubtitle}>
                    {QUADRANTS[key].subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <TextInput
              style={styles.searchInput}
              placeholder="Search emotions..."
              placeholderTextColor="#777788"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />

            <FlatList
              data={displayList}
              keyExtractor={(item) => item.emotion}
              numColumns={2}
              columnWrapperStyle={{ gap: 10 }}
              contentContainerStyle={{
                gap: 10,
                paddingTop: 14,
                paddingBottom: 24,
              }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.emotionChip,
                    { borderColor: QUADRANTS[activeQuadrant!].bg },
                    item.isCustom && styles.emotionChipCustom,
                  ]}
                  onPress={() => handleEmotionPress(item.emotion)}
                >
                  <Text style={styles.emotionChipText}>
                    {item.isCustom ? `Use "${item.emotion}"` : item.emotion}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Field trigger — drop one of these in for each input field
// ──────────────────────────────────────────────────────────────────────────

export type EmotionSelection = { emotion: string; quadrant: QuadrantKey };

export function EmotionPicker({
  label,
  placeholderIcon,
  placeholder,
  value,
  onChange,
  allowedQuadrants = ALL_QUADRANTS,
  allowCustomEmotion = false,
}: {
  label: string;
  placeholderIcon: string;
  placeholder: string;
  value: EmotionSelection | null;
  onChange: (v: EmotionSelection | null) => void;
  allowedQuadrants?: QuadrantKey[];
  allowCustomEmotion?: boolean;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity
        style={[
          styles.fieldBox,
          value && {
            borderColor: QUADRANTS[value.quadrant].bg,
            borderWidth: 2.5,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        {value ? (
          <View style={styles.selectedRow}>
            <Text style={styles.selectedEmoji}>
              {QUADRANTS[value.quadrant].emoji}
            </Text>
            <Text style={styles.selectedText}>{value.emotion}</Text>
            <TouchableOpacity onPress={() => onChange(null)} hitSlop={10}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.fieldPlaceholder}>
            {placeholderIcon} {placeholder}
          </Text>
        )}
      </TouchableOpacity>

      <EmotionPickerModal
        visible={modalVisible}
        title={label}
        allowedQuadrants={allowedQuadrants}
        allowCustomEmotion={allowCustomEmotion}
        onClose={() => setModalVisible(false)}
        onSelect={(emotion, quadrant) => onChange({ emotion, quadrant })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#15151c",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backButton: { flexDirection: "row", alignItems: "center", width: 60 },
  backChevron: {
    color: "#a0a0b0",
    fontSize: 26,
    lineHeight: 26,
    marginRight: 3,
    marginBottom: 2,
  },
  backText: { color: "#a0a0b0", fontSize: 15 },
  closeText: { color: "#a0a0b0", fontSize: 18, width: 60, textAlign: "right" },
  sheetTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  helperText: { color: "#8a8a9a", fontSize: 13, marginBottom: 16 },
  searchInput: {
    backgroundColor: "#2a2a35",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  quadrantGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quadrantTile: {
    width: "47%",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  quadrantEmoji: { fontSize: 28, marginBottom: 6 },
  quadrantLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
  quadrantSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  emotionChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  emotionChipCustom: { borderStyle: "dashed" },
  emotionChipText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  fieldLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  fieldBox: {
    backgroundColor: "#575d6d",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  fieldPlaceholder: { color: "#fff", fontSize: 14 },
  selectedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  selectedEmoji: { fontSize: 18 },
  selectedText: { color: "#fff", fontSize: 15, fontWeight: "600", flex: 1 },
  clearIcon: { color: "#fff", fontSize: 16, paddingHorizontal: 4 },
});
