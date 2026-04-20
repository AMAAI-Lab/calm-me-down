import { useAuth } from "@/context/AuthContext";
import { storeFeedback } from "@/services/DbService";
import { saveFeedbackSubmitted } from "@/services/LocalUserService";
import { useNavigation } from "expo-router";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  PanResponder,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TRACK_WIDTH = SCREEN_WIDTH - 40 - 40;
const THUMB_SIZE = 28;
const STEPS = 5; // 1–5

function ScaleRating({
  value,
  onChange,
  lowLabel = "Not at all",
  highLabel = "Very much",
}: {
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}) {
  const positionForValue = (v: number) =>
    v > 0 ? ((v - 1) / (STEPS - 1)) * (TRACK_WIDTH - THUMB_SIZE) : 0;

  const pan = useRef(
    new Animated.Value(value > 0 ? positionForValue(value) : 0),
  ).current;
  const isDragging = useRef(false);

  const snapToStep = (x: number): number => {
    const clamped = Math.max(0, Math.min(x, TRACK_WIDTH - THUMB_SIZE));
    const ratio = clamped / (TRACK_WIDTH - THUMB_SIZE);
    return Math.round(ratio * (STEPS - 1)) + 1;
  };

  const snapAnimTo = (v: number) => {
    Animated.spring(pan, {
      toValue: positionForValue(v),
      useNativeDriver: false,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gs) => {
        isDragging.current = true;
        // @ts-ignore
        pan.setOffset(pan._value);
        pan.setValue(0);
      },
      onPanResponderMove: (_, gs) => {
        // @ts-ignore
        const raw = pan._offset + gs.dx;
        const clamped = Math.max(0, Math.min(raw, TRACK_WIDTH - THUMB_SIZE));
        pan.setValue(clamped - (pan as any)._offset);
        const stepped = snapToStep(clamped);
        onChange(stepped);
      },
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        // @ts-ignore
        const stepped = snapToStep((pan as any)._value);
        onChange(stepped);
        snapAnimTo(stepped);
        isDragging.current = false;
      },
    }),
  ).current;

  // Tap directly on the track to jump
  const handleTrackTap = (e: any) => {
    const tapX = e.nativeEvent.locationX - THUMB_SIZE / 2;
    const stepped = snapToStep(tapX);
    onChange(stepped);
    snapAnimTo(stepped);
  };

  const STEP_LABELS = ["1", "2", "3", "4", "5"];

  const fillWidth = pan.interpolate({
    inputRange: [0, TRACK_WIDTH - THUMB_SIZE],
    outputRange: [THUMB_SIZE / 2, TRACK_WIDTH - THUMB_SIZE / 2],
    extrapolate: "clamp",
  });

  return (
    <View style={sliderStyles.wrapper}>
      <View style={sliderStyles.trackContainer} onTouchEnd={handleTrackTap}>
        <View style={sliderStyles.trackBg} />

        {value > 0 && (
          <Animated.View
            style={[sliderStyles.trackFill, { width: fillWidth }]}
          />
        )}

        {/* Step dots */}
        {STEP_LABELS.map((_, i) => {
          const dotX =
            (i / (STEPS - 1)) * (TRACK_WIDTH - THUMB_SIZE) + THUMB_SIZE / 2 - 4;
          const isActive = value > 0 && i < value;
          return (
            <View
              key={i}
              style={[
                sliderStyles.stepDot,
                { left: dotX },
                isActive && sliderStyles.stepDotActive,
              ]}
            />
          );
        })}

        {/* Thumb */}
        <Animated.View
          style={[
            sliderStyles.thumb,
            { left: pan, opacity: value > 0 ? 1 : 0.35 },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={sliderStyles.thumbInner} />
        </Animated.View>
      </View>

      {/* Step number labels */}
      <View style={sliderStyles.stepLabelsRow}>
        {STEP_LABELS.map((lbl, i) => (
          <Text
            key={i}
            style={[
              sliderStyles.stepLabel,
              value === i + 1 && sliderStyles.stepLabelActive,
            ]}
          >
            {lbl}
          </Text>
        ))}
      </View>

      {/* Axis labels */}
      <View style={sliderStyles.axisRow}>
        <Text style={sliderStyles.axisLabel}>{lowLabel}</Text>
        <Text style={sliderStyles.axisLabel}>{highLabel}</Text>
      </View>

      {/* Hint */}
      {value > 0 && (
        <Text style={sliderStyles.hint}>
          {
            [
              "1 — Not at all",
              "2 — Slightly",
              "3 — Somewhat",
              "4 — Quite",
              "5 — Very much",
            ][value - 1]
          }
        </Text>
      )}
    </View>
  );
}
const sliderStyles = StyleSheet.create({
  wrapper: { gap: 8, paddingTop: 8 },
  trackContainer: {
    width: TRACK_WIDTH,
    height: 40,
    justifyContent: "center",
  },
  trackBg: {
    position: "absolute",
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1E1535",
  },
  trackFill: {
    position: "absolute",
    left: THUMB_SIZE / 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C4417A",
  },
  stepDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2A1F40",
    top: 16,
  },
  stepDotActive: {
    backgroundColor: "#C4417A",
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#C4417A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C4417A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  stepLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: THUMB_SIZE / 2 - 4,
  },
  stepLabel: {
    color: "#3D2F5A",
    fontSize: 12,
    fontWeight: "600",
    width: 16,
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#C4417A",
  },
  axisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  axisLabel: {
    color: "#4A3860",
    fontSize: 11,
  },
  hint: {
    color: "#C4417A",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 2,
  },
});

const THREE_OPTIONS = [
  { label: "Not really", icon: "✕" },
  { label: "Somewhat", icon: "〜" },
  { label: "Yes!", icon: "✓" },
];
const TAP_COLORS = ["#E05C8A", "#9B59B6", "#4ECDC4"];

function ThreeTap({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const t0 = useRef(new Animated.Value(1)).current;
  const t1 = useRef(new Animated.Value(1)).current;
  const t2 = useRef(new Animated.Value(1)).current;
  const anims = [t0, t1, t2];

  const handlePress = (i: number) => {
    onChange(i);
    Animated.sequence([
      Animated.spring(anims[i], {
        toValue: 1.06,
        useNativeDriver: true,
        speed: 50,
        bounciness: 10,
      }),
      Animated.spring(anims[i], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();
  };

  return (
    <View style={tapStyles.row}>
      {THREE_OPTIONS.map((opt, i) => (
        <Animated.View
          key={i}
          style={{ flex: 1, transform: [{ scale: anims[i] }] }}
        >
          <TouchableOpacity
            onPress={() => handlePress(i)}
            activeOpacity={0.8}
            style={[
              tapStyles.btn,
              value === i && {
                backgroundColor: TAP_COLORS[i] + "22",
                borderColor: TAP_COLORS[i],
              },
            ]}
          >
            <Text
              style={[tapStyles.icon, value === i && { color: TAP_COLORS[i] }]}
            >
              {opt.icon}
            </Text>
            <Text
              style={[
                tapStyles.label,
                value === i && { color: TAP_COLORS[i], fontWeight: "700" },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}
const tapStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  btn: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#2A1F40",
    backgroundColor: "#1A1030",
    paddingVertical: 14,
    alignItems: "center",
    gap: 5,
  },
  icon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A3860",
  },
  label: {
    color: "#6A5580",
    fontSize: 12,
    fontWeight: "500",
  },
});

function Card({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// Main Screen Component
export default function FeedbackScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [moodNow, setMoodNow] = useState(0);
  const [moodShift, setMoodShift] = useState(0);
  const [engaging, setEngaging] = useState(0);
  const [personal, setPersonal] = useState(0);
  const [targetMood, setTargetMood] = useState(-1);
  const [review, setReview] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const canSubmit =
    moodNow > 0 &&
    moodShift > 0 &&
    engaging > 0 &&
    personal > 0 &&
    targetMood >= 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
      }),
    ]).start();
    setSubmitted(true);

    storeFeedback(user?.email!, {
      moodNow,
      moodShift,
      engaging,
      personal,
      targetMood: targetMood + 1,
      review,
    });

    await saveFeedbackSubmitted();
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Participants" as never);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0818" />
        <Animated.View
          style={[
            styles.successContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successSub}>
            Your feedback helps us tune{"\n"}every emotion perfectly.
          </Text>
          <View style={styles.successDots}>
            {[0.3, 0.6, 1].map((op, i) => (
              <View key={i} style={[styles.dot, { opacity: op }]} />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleGoBack}
            activeOpacity={0.75}
            style={styles.goBackBtn}
          >
            <Text style={styles.goBackText}>← Go Back</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0818" />

      <View
        style={[
          styles.blob,
          { top: -80, left: -80, backgroundColor: "#6B3FA0" },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            top: 180,
            right: -90,
            backgroundColor: "#C4417A",
            width: 230,
            height: 230,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            bottom: 80,
            left: -50,
            backgroundColor: "#3A56B0",
            width: 190,
            height: 190,
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>FEEDBACK</Text>
            </View>
            <Text style={styles.headerTitle}>How are{"\n"}you feeling?</Text>
            <Text style={styles.headerSub}>
              Share your experience with emotionapp
            </Text>
          </View>

          {/* Q1 */}
          <Card label="How do you feel right now?" icon="🧠">
            <ScaleRating
              value={moodNow}
              onChange={setMoodNow}
              lowLabel="Very low"
              highLabel="Very good"
            />
          </Card>

          {/* Q2 */}
          <Card label="Did the music help shift your mood?" icon="🎵">
            <ScaleRating
              value={moodShift}
              onChange={setMoodShift}
              lowLabel="Not at all"
              highLabel="Absolutely"
            />
          </Card>

          {/* Q3 */}
          <Card label="How engaging were the songs?" icon="🎧">
            <ScaleRating
              value={engaging}
              onChange={setEngaging}
              lowLabel="Boring"
              highLabel="Captivating"
            />
          </Card>

          {/* Q4 */}
          <Card label="Did the songs feel personal?" icon="💜">
            <ScaleRating
              value={personal}
              onChange={setPersonal}
              lowLabel="Generic"
              highLabel="Just for me"
            />
          </Card>

          {/* Q5 */}
          <Card label="Did you reach your target mood?" icon="🎯">
            <ThreeTap value={targetMood} onChange={setTargetMood} />
          </Card>

          {/* Q6 */}
          <Card label="Tell us more (optional)" icon="💬">
            <TextInput
              style={styles.textInput}
              value={review}
              onChangeText={setReview}
              placeholder="What moved you? What could be better..."
              placeholderTextColor="#3D2F5A"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{review.length} / 500</Text>
          </Card>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={canSubmit ? 0.75 : 1}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          >
            <Text
              style={[
                styles.submitText,
                !canSubmit && styles.submitTextDisabled,
              ]}
            >
              {canSubmit
                ? "Submit Feedback  ✦"
                : "Please rate all the required sections"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0818",
  },
  blob: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    opacity: 0.1,
  },
  scroll: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: { marginBottom: 24 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#1E1235",
    borderWidth: 1,
    borderColor: "#6B3FA0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },
  badgeText: {
    color: "#B07FE0",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#F0E6FF",
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  headerSub: {
    color: "#6A5580",
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: "#120C22",
    borderWidth: 1,
    borderColor: "#1E1535",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardIcon: { fontSize: 18 },
  cardLabel: {
    color: "#D0C0F0",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    flex: 1,
  },
  textInput: {
    color: "#E8DCFF",
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    padding: 0,
  },
  charCount: {
    color: "#3D2F5A",
    fontSize: 12,
    alignSelf: "flex-end",
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: "#C4417A",
    shadowColor: "#C4417A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#1E1235",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  submitTextDisabled: { color: "#3D2F5A" },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  successEmoji: { fontSize: 72, marginBottom: 8 },
  successTitle: {
    fontSize: 44,
    fontWeight: "800",
    color: "#F0E6FF",
    letterSpacing: -0.5,
  },
  successSub: {
    color: "#6A5580",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  successDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C4417A",
  },
  goBackBtn: {
    marginTop: 32,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1.5,
    borderColor: "#3D2F5A",
    backgroundColor: "#120C22",
  },
  goBackText: {
    color: "#B07FE0",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
