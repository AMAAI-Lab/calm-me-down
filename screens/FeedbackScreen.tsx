import { useAuth } from "@/context/AuthContext";
import { updateMusicTrajectory } from "@/services/DbService";
import {
  getSessionId,
  getTrajectoryId,
  saveFeedbackSubmitted,
  savePlaylistFeedback,
} from "@/services/LocalUserService";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

// VA Slider
function VASlider({
  value,
  onChange,
  lowLabel = "Low",
  highLabel = "High",
}: {
  value: number; // 0 = unset, 1–100 = selected
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}) {
  const TRACK_W = SCREEN_WIDTH - 80;

  const BUBBLE_W = 44;
  const bubbleLeft = value > 0 ? ((value - 1) / 99) * (TRACK_W - BUBBLE_W) : 0;

  const isSet = value > 0;

  return (
    <View style={vaStyles.wrapper}>
      <View style={vaStyles.bubbleTrack}>
        <View
          style={[
            vaStyles.bubble,
            {
              left: bubbleLeft,
              backgroundColor: isSet ? "#C4417A" : "#1E1535",
              borderColor: isSet ? "#C4417A" : "#2A1F40",
              opacity: isSet ? 1 : 0.4,
            },
          ]}
        >
          <Text
            style={[vaStyles.bubbleText, { color: isSet ? "#fff" : "#6A5580" }]}
          >
            {isSet ? value : "–"}
          </Text>
        </View>
      </View>

      {/* Slider */}
      <Slider
        style={vaStyles.slider}
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={isSet ? value : 1}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={isSet ? "#C4417A" : "#2A1F40"}
        maximumTrackTintColor="#1E1535"
        thumbTintColor={isSet ? "#C4417A" : "#2A1F40"}
      />

      {/* Axis labels */}
      <View style={vaStyles.axisRow}>
        <Text style={vaStyles.axisLabel}>{lowLabel}</Text>
        <Text
          style={[vaStyles.axisValue, { color: isSet ? "#C4417A" : "#3D2F5A" }]}
        >
          {isSet ? `${value} / 100` : "Move slider to rate"}
        </Text>
        <Text style={vaStyles.axisLabel}>{highLabel}</Text>
      </View>
    </View>
  );
}

const vaStyles = StyleSheet.create({
  wrapper: {
    paddingTop: 4,
  },
  bubbleTrack: {
    height: 32,
    position: "relative",
    marginHorizontal: 10,
  },
  bubble: {
    position: "absolute",
    width: 44,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  slider: {
    width: "100%",
    height: 30,
    marginBottom: 10,
  },
  axisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -4,
    paddingHorizontal: 4,
  },
  axisLabel: {
    color: "#4A3860",
    fontSize: 11,
  },
  axisValue: {
    fontSize: 11,
    fontStyle: "italic",
    fontWeight: "600",
  },
});

// Card
function Card({
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

// Main Screen
export default function FeedbackScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const route = useRoute();

  const {
    storeInDb = false,
    playlistIdx = 0,
    emotionState = "",
  } = (route?.params || {}) as never;

  const [arousal, setArousal] = useState(0);
  const [valence, setValence] = useState(0);

  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const canSubmit = arousal > 0 && valence > 0;

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

      const feedbackData = { arousal, valence, emotionState };

      await savePlaylistFeedback(feedbackData);
      if (!storeInDb) {
        await saveFeedbackSubmitted("pre", playlistIdx || 0);
      } else {
        const sessionId = await getSessionId();
        const trajectoryId = await getTrajectoryId();
        await updateMusicTrajectory(user?.email!, sessionId, trajectoryId, {
          feedbackAfter: feedbackData,
        });
        await saveFeedbackSubmitted("post", playlistIdx || 0);
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
    setArousal(70);
    setValence(70);
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

          <Card label="Rate your current emotion state below.">
            <View style={styles.dualSliderRow}>
              <Text style={styles.dualSliderTitle}>⚡ Energy</Text>
            </View>
            <VASlider
              value={arousal}
              onChange={setArousal}
              lowLabel="Very Low"
              highLabel="Very High"
            />

            <View style={styles.dualDivider} />

            <View style={styles.dualSliderRow}>
              <Text style={styles.dualSliderTitle}>
                ☀️ Pleasant / Positive Mood
              </Text>
            </View>
            <VASlider
              value={valence}
              onChange={setValence}
              lowLabel="Very Unpleasant"
              highLabel="Very Pleasant"
            />
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
              onPress={populateForm}
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
    marginBottom: -8,
    flexWrap: "wrap",
    gap: 4,
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
    marginLeft: "auto",
  },
  dualDivider: {
    height: 1,
    backgroundColor: "#1E1535",
    marginVertical: 4,
  },
});
