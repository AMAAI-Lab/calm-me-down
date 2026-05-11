import React, { useRef, SetStateAction, Dispatch } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Pressable,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TRACK_WIDTH = SCREEN_WIDTH - 80;
const THUMB_SIZE = 28;
const STEPS = 5;

export function ScaleRating({
  value,
  onChange,
  lowLabel,
  highLabel,
  hints = [
    "1 — Not at all",
    "2 — Slightly",
    "3 — Somewhat",
    "4 — Quite",
    "5 — Very much",
  ],
  isParticipantsScreen = true,
}: {
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
  hints?: string[];
  isParticipantsScreen?: boolean;
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

  const sliderColor = isParticipantsScreen ? "#b36cff" : "#C4417A";

  return (
    <View style={sliderStyles.wrapper}>
      <View style={sliderStyles.trackContainer} onTouchEnd={handleTrackTap}>
        <View style={sliderStyles.trackBg} />

        {value > 0 && (
          <Animated.View
            style={[
              sliderStyles.trackFill,
              { width: fillWidth, backgroundColor: sliderColor },
            ]}
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
                isActive && { backgroundColor: sliderColor },
              ]}
            />
          );
        })}

        {/* Thumb */}
        <Animated.View
          style={[
            sliderStyles.thumb,
            {
              left: pan,
              opacity: value > 0 ? 1 : 0.35,
              backgroundColor: sliderColor,
              shadowColor: sliderColor,
            },
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
              value === i + 1 && { color: sliderColor },
            ]}
          >
            {lbl}
          </Text>
        ))}
      </View>

      {/* Axis labels */}
      {!!lowLabel && !!highLabel && (
        <View style={sliderStyles.axisRow}>
          <Text style={sliderStyles.axisLabel}>{lowLabel}</Text>
          <Text style={sliderStyles.axisLabel}>{highLabel}</Text>
        </View>
      )}

      {/* Hint */}
      {value > 0 && (
        <Text
          style={[
            sliderStyles.hint,
            { color: sliderColor },
            isParticipantsScreen && { marginLeft: 10 },
          ]}
        >
          {hints[value - 1]}
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
  },
  stepDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2A1F40",
    top: 16,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 2,
  },
});

export default function ArousalValenceFeedback({
  arousal,
  setArousal,
  valence,
  setValence,
  onSubmit,
  showButton,
}: {
  arousal: number;
  setArousal: Dispatch<SetStateAction<number>>;
  valence: number;
  setValence: Dispatch<SetStateAction<number>>;
  onSubmit: () => void;
  showButton: boolean;
}) {
  const disabled = !arousal || !valence;

  return (
    <View style={styles.card}>
      <View style={styles.dualSliderRow}>
        <Text style={styles.dualSliderTitle}>⚡ Energy</Text>
        <Text style={styles.dualSliderSub}>Low → High</Text>
      </View>
      <ScaleRating
        value={arousal}
        onChange={setArousal}
        hints={[
          "1 — Very low",
          "2 — Low",
          "3 — Moderate",
          "4 — High",
          "5 — Very high",
        ]}
      />

      <View style={styles.dualDivider} />

      <View style={styles.dualSliderRow}>
        <Text style={styles.dualSliderTitle}>☀️ Happiness</Text>
        <Text style={styles.dualSliderSub}>Sad → Happy</Text>
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
      />

      {showButton && (
        <Pressable
          onPress={onSubmit}
          disabled={disabled}
          style={[
            {
              alignSelf: "flex-end",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#b36cff",
              borderRadius: 18,
              width: 90,
              height: 35,
              marginTop: 10,
            },
            disabled && { opacity: 0.5 },
          ]}
        >
          <Text style={{ color: "#B07FE0", fontSize: 15 }}>Submit</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16161F",
    borderWidth: 1,
    borderColor: "#2A2A3A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    gap: 14,
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
