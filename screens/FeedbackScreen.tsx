import { useAuth } from "@/context/AuthContext";
import { storeFeedback } from "@/services/DbService";
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

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const s0 = useRef(new Animated.Value(1)).current;
  const s1 = useRef(new Animated.Value(1)).current;
  const s2 = useRef(new Animated.Value(1)).current;
  const s3 = useRef(new Animated.Value(1)).current;
  const s4 = useRef(new Animated.Value(1)).current;
  const scales = [s0, s1, s2, s3, s4];

  const handlePress = (index: number) => {
    onChange(index + 1);
    Animated.sequence([
      Animated.spring(scales[index], {
        toValue: 1.45,
        useNativeDriver: true,
        speed: 40,
      }),
      Animated.spring(scales[index], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();
  };

  const HINTS = [
    "Terrible",
    "Not great",
    "It's okay",
    "Pretty good",
    "Loved it!",
  ];

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Animated.View key={i} style={{ transform: [{ scale: scales[i] }] }}>
            <TouchableOpacity
              onPress={() => handlePress(i)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 38,
                  color: i < value ? "#FFD166" : "#2E2145",
                }}
              >
                ★
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      {value > 0 && <Text style={styles.ratingHint}>{HINTS[value - 1]}</Text>}
    </View>
  );
}

const EMOJIS = [
  { emoji: "😞", label: "Bad" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😄", label: "Great" },
  { emoji: "🤩", label: "Loved it" },
];

function EmojiPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const e0 = useRef(new Animated.Value(1)).current;
  const e1 = useRef(new Animated.Value(1)).current;
  const e2 = useRef(new Animated.Value(1)).current;
  const e3 = useRef(new Animated.Value(1)).current;
  const e4 = useRef(new Animated.Value(1)).current;
  const scales = [e0, e1, e2, e3, e4];

  const handlePress = (index: number) => {
    onChange(index);
    Animated.sequence([
      Animated.spring(scales[index], {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 40,
      }),
      Animated.spring(scales[index], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();
  };

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      {EMOJIS.map((item, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => handlePress(i)}
          activeOpacity={0.8}
          style={{ alignItems: "center", gap: 6 }}
        >
          <Animated.View
            style={[
              styles.emojiWrap,
              value === i && styles.emojiWrapActive,
              { transform: [{ scale: scales[i] }] },
            ]}
          >
            <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
          </Animated.View>
          <Text
            style={[styles.emojiLabel, value === i && styles.emojiLabelActive]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

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

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [appRating, setAppRating] = useState(0);
  const [songRating, setSongRating] = useState(-1);
  const [expRating, setExpRating] = useState(-1);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const canSubmit = appRating > 0 && songRating >= 0 && expRating >= 0;

  const handleSubmit = () => {
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
      appRating,
      songRating: songRating + 1,
      expRating: expRating + 1,
      review,
    });
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

          {/* Overall Rating */}
          <Card label="Overall App Rating" icon="⭐">
            <StarRating value={appRating} onChange={setAppRating} />
          </Card>

          {/* Song Rating */}
          <Card label="How did you like the songs?" icon="🎵">
            <EmojiPicker value={songRating} onChange={setSongRating} />
          </Card>

          {/* App Experience */}
          <Card label="Overall App Experience" icon="✨">
            <EmojiPicker value={expRating} onChange={setExpRating} />
          </Card>

          {/* Review Box */}
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
              {canSubmit ? "Submit Feedback  ✦" : "Complete all sections above"}
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
  header: {
    marginBottom: 24,
  },
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
  },
  ratingHint: {
    color: "#FFD166",
    fontSize: 13,
    fontStyle: "italic",
  },
  emojiWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#1A1030",
    borderWidth: 1.5,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiWrapActive: {
    backgroundColor: "#2A0E1E",
    borderColor: "#C4417A",
  },
  emojiLabel: {
    color: "#3D2F5A",
    fontSize: 10,
    fontWeight: "500",
  },
  emojiLabelActive: {
    color: "#C4417A",
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
  submitTextDisabled: {
    color: "#3D2F5A",
  },
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
