import React, { useEffect, useRef, useMemo } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface LyricAnimatorProps {
  /** Full lyrics as a single string */
  text: string;

  /** Auto-play on mount */
  autoPlay?: boolean;

  /** Called when animation finishes */
  onFinish?: () => void;

  /** Styles */
  lineStyle?: TextStyle;
  activeLineStyle?: TextStyle;
  pastLineStyle?: TextStyle;
  style?: ViewStyle;

  currentTimeMs?: number;
  songDurationMs?: number;
}

const splitIntoLines = (text: string) => {
  return text
    .split(/\n|\. |! |\? /) // newline OR sentence-based split
    .map((l) => l.trim())
    .filter(Boolean);
};

const getLineDuration = (line: string) => {
  const base = 400;
  const perChar = 20;
  return Math.min(1200, base + line.length * perChar);
};

function AnimatedLine({
  text,
  isActive,
  isPast,
  lineStyle,
  activeLineStyle,
  pastLineStyle,
  duration,
}: any) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if ((isActive || isPast) && !hasAnimated.current) {
      hasAnimated.current = true;

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.8,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, isPast]);

  const textStyle: TextStyle = isPast
    ? { ...lineStyle, ...pastLineStyle }
    : isActive
      ? { ...lineStyle, ...activeLineStyle }
      : (lineStyle ?? {});

  return (
    <Animated.Text
      style={[
        textStyle,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

export default function LyricAnimator({
  text,
  autoPlay = true,
  onFinish,
  lineStyle,
  activeLineStyle,
  pastLineStyle,
  style,
  currentTimeMs,
  songDurationMs,
}: LyricAnimatorProps) {
  const lines = useMemo(() => splitIntoLines(text), [text]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Precompute durations
  const lineDurations = useMemo(() => lines.map(getLineDuration), [lines]);

  const scaledDurations = useMemo(() => {
    if (!songDurationMs) return lineDurations;

    const total = lineDurations.reduce((a, b) => a + b, 0);

    return lineDurations.map((d) => (d / total) * songDurationMs);
  }, [lineDurations, songDurationMs]);

  const revealedUpTo = useMemo(() => {
    if (currentTimeMs == null) return -1;

    let accumulated = 0;

    for (let i = 0; i < scaledDurations.length; i++) {
      accumulated += scaledDurations[i];
      if (currentTimeMs < accumulated) {
        return i;
      }
    }

    return lines.length - 1;
  }, [currentTimeMs, scaledDurations]);

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    let accumulatedDelay = 0;

    lines.forEach((_, i) => {
      const delay = accumulatedDelay;

      const t = setTimeout(() => {
        if (i === lines.length - 1) onFinish?.();
      }, delay);

      timers.current.push(t);

      accumulatedDelay += lineDurations[i];
    });
  };

  useEffect(() => {
    if (autoPlay) play();
    return () => timers.current.forEach(clearTimeout);
  }, [text]);

  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {lines.map((line, i) => {
        const isVisible = i <= revealedUpTo;
        const isActive = i === revealedUpTo;
        const isPast = i < revealedUpTo || i === lines.length - 1;

        if (!isVisible) return <View key={i} />;
        return (
          <AnimatedLine
            key={i}
            text={line}
            isActive={isActive}
            isPast={isPast}
            duration={lineDurations[i]}
            lineStyle={lineStyle || styles.line}
            activeLineStyle={activeLineStyle || styles.activeLine}
            pastLineStyle={pastLineStyle || styles.pastLine}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 5,
    paddingVertical: 10,
  },
  line: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 20,
  },
  activeLine: {
    color: "#ffffff",
    fontSize: 16,
  },
  pastLine: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 14,
  },
});
