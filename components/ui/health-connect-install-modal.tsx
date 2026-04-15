import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HC_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STEPS = [
  { icon: "⬇️", text: "Install Health Connect from Play Store" },
  { icon: "🔗", text: "Open Health Connect & allow your wearable app to sync" },
  { icon: "💙", text: "Return here and connect your data" },
];

export function HealthConnectInstallModal({ visible, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sheet slide-up + backdrop fade on open
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse the CTA button gently
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const handleInstall = async () => {
    try {
      await Linking.openURL(HC_PLAY_STORE_URL);
    } catch (err: any) {
      console.error(
        "Error while redirecting to Health Connect playstore link: ",
        err?.message,
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Icon cluster */}
        <View style={styles.iconCluster}>
          <View style={styles.iconRing}>
            <Text style={styles.mainIcon}>🏃</Text>
          </View>
          <View style={styles.iconBadge}>
            <Text style={styles.badgeIcon}>❤️</Text>
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>Health Connect needed</Text>
        <Text style={styles.subtitle}>
          Your Emotion App uses Health Connect to securely read steps, heart
          rate and HRV from your wearable.
        </Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={styles.stepConnector} />}
            </View>
          ))}
        </View>

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleInstall}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaIcon}>▶</Text>
            <Text style={styles.ctaText}>Get Health Connect</Text>
            <View style={styles.ctaBadge}>
              <Text style={styles.ctaBadgeText}>Play Store</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Dismiss */}
        <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Maybe later</Text>
        </TouchableOpacity>

        {/* Bottom safe area spacer */}
        <View style={styles.safeAreaSpacer} />
      </Animated.View>
    </Modal>
  );
}

const ACCENT = "#00C48C"; // health green
const SURFACE = "#0F1923"; // deep navy
const CARD = "#1A2635";
const TEXT = "#F0F4F8";
const MUTED = "#6B7F94";

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SURFACE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "rgba(0,196,140,0.25)",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: 24,
  },

  iconCluster: {
    alignSelf: "center",
    marginBottom: 20,
    width: 72,
    height: 72,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: "rgba(0,196,140,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainIcon: { fontSize: 32 },
  iconBadge: {
    position: "absolute",
    bottom: -2,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,196,140,0.4)",
  },
  badgeIcon: { fontSize: 14 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13.5,
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepsContainer: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
    position: "relative",
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,196,140,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  stepIcon: { fontSize: 16 },
  stepTextWrap: { flex: 1, justifyContent: "center", minHeight: 36 },
  stepText: { fontSize: 13, color: TEXT, lineHeight: 18, fontWeight: "500" },
  stepConnector: {
    position: "absolute",
    left: 17,
    top: 42,
    width: 2,
    height: 12,
    backgroundColor: "rgba(0,196,140,0.2)",
    borderRadius: 1,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaIcon: {
    fontSize: 11,
    color: "#003D2C",
    marginRight: 10,
  },
  ctaText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#003D2C",
    letterSpacing: -0.2,
  },
  ctaBadge: {
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ctaBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#003D2C",
    letterSpacing: 0.3,
  },
  dismissBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  dismissText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "500",
  },
  safeAreaSpacer: { height: 16 },
});
