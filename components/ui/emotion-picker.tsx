import {
  ALL_QUADRANTS,
  EMOTION_MAP,
  EMOTION_PICKER_QUADRANTS,
  EmotionPoint,
  QuadrantKey,
} from "@/constants/appConstants";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ──────────────────────────────────────────────────────────────────────────
// Quadrant setup — computed from valence/arousal, not hardcoded per emotion,
// so this stays correct if EMOTION_MAP changes.
// ──────────────────────────────────────────────────────────────────────────

const VALENCE_MID = 5;
const AROUSAL_MID = 5;
const QUADRANTS = EMOTION_PICKER_QUADRANTS;

// The active-step pointer sits at the right end of the caption row and is
// rotated so the hand points DOWN at its card (towards the "+" badge).
// Set to "0deg" to leave the icon as-is.
const INDICATOR_ROTATION = "90deg";

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
// Square picker card — place two of these in a row (see parent usage)
// ──────────────────────────────────────────────────────────────────────────

export function EmotionPicker({
  label,
  shortLabel,
  placeholderIcon,
  placeholder,
  emotion,
  quad,
  onChange,
  allowedQuadrants = ALL_QUADRANTS,
  allowCustomEmotion = false,
  indicatorIcon = null,
  style,
}: {
  label: string; // full question: used as the sheet title + accessibility label
  shortLabel?: string; // compact caption shown above the card (falls back to label)
  placeholderIcon: string;
  placeholder: string;
  emotion?: string;
  quad?: QuadrantKey;
  onChange: (
    payload: { emotion: string; quadrant: QuadrantKey } | null,
  ) => void;
  allowedQuadrants?: QuadrantKey[];
  allowCustomEmotion?: boolean;
  indicatorIcon?: React.ReactNode | null;
  style?: StyleProp<ViewStyle>;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const q = emotion && quad ? QUADRANTS[quad] : null; // null = nothing picked yet

  // Press feedback: card shrinks slightly while pressed, springs back on release
  const pressScale = useRef(new Animated.Value(1)).current;
  const animatePress = (to: number) =>
    Animated.spring(pressScale, {
      toValue: to,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();

  // Selection "pop": emoji bounces in, text fades in, tint flashes then settles
  const pop = useRef(new Animated.Value(1)).current;
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true; // don't animate when restoring an existing value
      return;
    }
    if (!q) return;
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      friction: 4,
      tension: 110,
      useNativeDriver: true,
    }).start();
  }, [emotion, quad]); // eslint-disable-line react-hooks/exhaustive-deps

  const emojiScale = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1], // spring overshoot extends past 1 = bounce
  });
  const textOpacity = pop.interpolate({
    inputRange: [0, 0.6],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const tintOpacity = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0.18],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel} numberOfLines={shortLabel ? 1 : 2}>
          {shortLabel ?? label}
        </Text>

        {/* Fixed-size slot: the pointer appearing/disappearing never shifts the caption */}
        <View style={styles.indicatorSlot} pointerEvents="none">
          {indicatorIcon}
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Pressable
          onPress={() => setModalVisible(true)}
          onPressIn={() => animatePress(0.96)}
          onPressOut={() => animatePress(1)}
          accessibilityRole="button"
          accessibilityLabel={`${label} ${q ? `Selected: ${emotion}` : "Not selected"}`}
          style={[styles.card, q && { borderColor: q.bg }]}
        >
          {q ? (
            <>
              {/* Colour tint layer (works with any colour format) */}
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: q.bg, opacity: tintOpacity },
                ]}
              />
              <Animated.Text
                style={[
                  styles.cardEmoji,
                  { transform: [{ scale: emojiScale }] },
                ]}
              >
                {q.emoji}
              </Animated.Text>
              <Animated.Text
                style={[styles.cardEmotion, { opacity: textOpacity }]}
                numberOfLines={2}
              >
                {emotion}
              </Animated.Text>

              <Pressable
                style={styles.badge}
                onPress={() => onChange(null)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Clear selection"
              >
                <Text style={styles.badgeText}>✕</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.cardEmoji}>{placeholderIcon}</Text>
              <Text style={styles.cardPlaceholder} numberOfLines={3}>
                {placeholder}
              </Text>

              <View style={styles.badge} pointerEvents="none">
                <Text style={styles.badgeText}>+</Text>
              </View>
            </>
          )}
        </Pressable>
      </Animated.View>

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
  // ── picker card ──
  container: { flex: 1 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingHorizontal: 15,
    zIndex: 1, // lets the pointer's nudge overlap the card instead of hiding behind it
  },
  fieldLabel: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "600" },
  indicatorSlot: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: INDICATOR_ROTATION }],
    // marginRight: 15,
  },
  card: {
    aspectRatio: 1,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: "#33334a",
    backgroundColor: "#1c1c26",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    overflow: "hidden",
  },
  cardEmoji: { fontSize: 44, lineHeight: 54, marginBottom: 8 },
  cardEmotion: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  cardPlaceholder: {
    color: "#8a8a9a",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 13, lineHeight: 16 },

  // ── modal sheet ──
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
});
