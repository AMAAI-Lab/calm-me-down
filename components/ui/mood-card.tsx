import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const C = {
  surface: "#16161F",
  border: "#2A2A3A",
  calm: "#4A9EFF",
  calmDim: "#0E2540",
  joyful: "#FFB830",
  joyfulDim: "#3A2900",
  textMuted: "#7070A0",
  textDim: "#404060",
} as const;

export default function MoodCard({
  mood,
  selected,
  locked,
  onPress,
}: {
  mood: "calm" | "joyful";
  selected: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  const isCalm = mood === "calm";
  const color = isCalm ? C.calm : C.joyful;
  const dimBg = isCalm ? C.calmDim : C.joyfulDim;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (locked) return;
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.moodCard,
          selected && { borderColor: color, backgroundColor: dimBg },
          locked && !selected && { opacity: 0.38 },
        ]}
      >
        {selected && (
          <View style={[styles.moodGlow, { backgroundColor: color }]} />
        )}

        <Text style={styles.moodEmoji}>{isCalm ? "🌊" : "☀️"}</Text>
        <Text
          style={[styles.moodTitle, { color: selected ? color : C.textMuted }]}
        >
          {isCalm ? "Calm" : "Joyful"}
        </Text>
        <Text style={styles.moodArrow}>→ {isCalm ? "Joyful" : "Calm"}</Text>

        {selected && (
          <View style={[styles.moodCheckBadge, { backgroundColor: color }]}>
            <FontAwesome5 name="check" size={9} color="#000" />
          </View>
        )}
        {locked && (
          <View style={styles.moodLockOverlay}>
            <FontAwesome5 name="lock" size={16} color={C.textDim} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  moodCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: C.surface,
    overflow: "hidden",
    position: "relative",
  },
  moodGlow: {
    position: "absolute",
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.08,
  },
  moodEmoji: { fontSize: 36, marginBottom: 10 },
  moodTitle: { fontSize: 19, fontWeight: "800", letterSpacing: -0.3 },
  moodArrow: {
    color: C.textDim,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  moodCheckBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  moodLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,13,20,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
