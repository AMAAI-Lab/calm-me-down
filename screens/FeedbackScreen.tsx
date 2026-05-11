import { ScaleRating } from "@/components/ui/arousal-valence-feedback";
import { useAuth } from "@/context/AuthContext";
import { updateMusicSession } from "@/services/DbService";
import {
  clearSessionFeedback,
  getSessionId,
  saveFeedbackSubmitted,
  saveSessionFeedback,
} from "@/services/LocalUserService";
import { useRoute } from "@react-navigation/native";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Card({
  label,
  icon,
  children,
}: {
  label?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {icon && <Text style={styles.cardIcon}>{icon}</Text>}
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

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

// Main Screen Component
export default function FeedbackScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const route = useRoute();

  const { storeInDb = false, sessionIdx = 0 } = (route?.params || {}) as never;

  const [arousal, setArousal] = useState(0);
  const [valence, setValence] = useState(0);
  const [engaging, setEngaging] = useState(0);
  const [personal, setPersonal] = useState(0);
  const [targetMood, setTargetMood] = useState(-1);
  const [review, setReview] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const canSubmit =
    arousal > 0 &&
    valence > 0 &&
    engaging > 0 &&
    personal > 0 &&
    targetMood >= 0;

  const handleSubmit = async () => {
    try {
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

      const feedbackData = {
        arousal,
        valence,
        engaging,
        personal,
        targetMood: targetMood + 1,
        review,
      };

      if (!storeInDb) {
        await saveSessionFeedback(feedbackData);
        await saveFeedbackSubmitted("pre", sessionIdx || 0);
      } else {
        const sessionId = await getSessionId();
        await updateMusicSession(
          user?.email!,
          sessionId,
          {
            feedbackAfter: feedbackData,
          },
          true,
        );

        await clearSessionFeedback();
        await saveFeedbackSubmitted("post", sessionIdx || 0);
      }
    } catch (err: any) {
      console.error("Error while saving session feedback in DB:", err?.message);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Participants" as never);
    }
  };

  const populateForm = () => {
    setArousal(5);
    setValence(5);
    setEngaging(5);
    setPersonal(5);
    setTargetMood(2);
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
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>FEEDBACK</Text>
            </View>
            <Text style={styles.headerTitle}>How are{"\n"}you feeling?</Text>
            <Text style={styles.headerSub}>
              Share your experience with emotionapp
            </Text>
          </View>

          <Card label="Your Energy & Happiness level right now?">
            <View style={styles.dualSliderRow}>
              <Text style={styles.dualSliderTitle}>⚡ Energy</Text>
              <Text style={styles.dualSliderSub}>Very Low → Very High</Text>
            </View>
            <ScaleRating
              value={arousal}
              onChange={setArousal}
              hints={[
                "1 — Very low",
                "2 ",
                "3 ",
                "4 ",
                "5 ",
                "6 ",
                "7 - Very High"
              ]}
              isParticipantsScreen={false}
            />

            <View style={styles.dualDivider} />

            <View style={styles.dualSliderRow}>
              <Text style={styles.dualSliderTitle}>☀️ Pleasant / Positive Mood</Text>
              <Text style={styles.dualSliderSub}>Very Unpleasant/negative → Very Pleasant/ positive</Text>
            </View>
            <ScaleRating
              value={valence}
              onChange={setValence}
              hints={[
                "1 — Very sad",
                "2 — Sad",
                "3 — Neutral",
                "4 — Happy",
                "5 — Very happy",
              ]}
              isParticipantsScreen={false}
            />
          </Card>

          <Card label="How engaging were the songs?" icon="🎧">
            <ScaleRating
              value={engaging}
              onChange={setEngaging}
              lowLabel="Boring"
              highLabel="Captivating"
              isParticipantsScreen={false}
            />
          </Card>

          <Card label="Did the songs feel personal?" icon="💜">
            <ScaleRating
              value={personal}
              onChange={setPersonal}
              lowLabel="Generic"
              highLabel="Just for me"
              isParticipantsScreen={false}
            />
          </Card>

          <Card label="Did you reach your target mood?" icon="🎯">
            <ThreeTap value={targetMood} onChange={setTargetMood} />
          </Card>

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

          {process.env?.EXPO_PUBLIC_APP_ENV === "development" && (
            <TouchableOpacity
              onPress={() => populateForm()}
              style={[styles.submitBtn, { marginTop: 20 }]}
            >
              <Text style={styles.submitText}>Populate Form</Text>
            </TouchableOpacity>
          )}
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
  dualSliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: -4,
  },
  dualSliderTitle: {
    color: "#E0D0FF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dualSliderSub: {
    color: "#4A3860",
    fontSize: 11,
    fontStyle: "italic",
  },
  dualDivider: {
    height: 1,
    backgroundColor: "#1E1535",
    marginVertical: 4,
  },
});
