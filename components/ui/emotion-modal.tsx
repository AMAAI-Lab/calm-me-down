import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface EmotionModalProps {
  visible: boolean;
  heading: string;
  subheading: string;
  onClose: () => void;
  buttonText?: string;
}

const EmotionModal: React.FC<EmotionModalProps> = ({
  visible,
  heading,
  subheading,
  onClose,
  buttonText = "Got it",
}) => {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.92,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 16,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop — tap outside to dismiss */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Card — isolated so taps don't bubble to backdrop */}
      <View style={styles.centeredWrapper} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Decorative top strip */}
          <View style={styles.accentBar} />

          {/* Pulse icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconRing}>
              <View style={styles.iconDot} />
            </View>
          </View>

          <Text style={styles.heading}>{heading}</Text>
          <Text style={styles.subheading}>{subheading}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.okBtn}
            activeOpacity={0.82}
            onPress={onClose}
          >
            <Text style={styles.okBtnText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const CARD_WIDTH = Math.min(width - 48, 360);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 6, 22, 0.72)",
  },
  centeredWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#120F24",
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    paddingBottom: 28,
    // Subtle border for glass feel
    borderWidth: 1,
    borderColor: "rgba(160, 120, 255, 0.18)",
    shadowColor: "#7C4DFF",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 24,
  },
  accentBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#7C4DFF",
    // Linear gradient not available without expo-linear-gradient;
    // replace with LinearGradient if desired
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iconWrapper: {
    marginTop: 28,
    marginBottom: 20,
  },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(124, 77, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(124, 77, 255, 0.12)",
  },
  iconDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#A070FF",
    shadowColor: "#A070FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  heading: {
    fontFamily: "System",
    fontSize: 20,
    fontWeight: "700",
    color: "#EDE8FF",
    textAlign: "center",
    lineHeight: 28,
    letterSpacing: -0.3,
    paddingHorizontal: 28,
    marginBottom: 12,
  },
  subheading: {
    fontFamily: "System",
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(210, 196, 255, 0.65)",
    textAlign: "center",
    lineHeight: 21,
    letterSpacing: 0.1,
    paddingHorizontal: 32,
  },
  divider: {
    width: "85%",
    height: 1,
    backgroundColor: "rgba(160, 120, 255, 0.12)",
    marginVertical: 24,
  },
  okBtn: {
    width: CARD_WIDTH - 56,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#7C4DFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C4DFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  okBtnText: {
    fontFamily: "System",
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
});

export default EmotionModal;
