import { AlignedWord } from "@/services/MusicGenerationService";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface LyricLine {
  text: string;
  startMs: number;
  endMs: number;
  words: AlignedWord[];
}

export interface LyricAnimatorProps {
  /** Full lyrics as a single string. Used as fallback when alignedWords is unavailable. */
  text?: string;

  /** Word-level timestamps returned by the music service */
  alignedWords?: AlignedWord[];

  /** Current audio playback position in milliseconds */
  currentTimeMs?: number;

  /** Audio duration in milliseconds. Used by fallback timing. */
  songDurationMs?: number;

  /** Called when the final lyric has finished */
  onFinish?: () => void;

  /** Styles */
  lineStyle?: TextStyle;
  activeLineStyle?: TextStyle;
  pastLineStyle?: TextStyle;
  style?: ViewStyle;

  /** Highlight the currently sung word when timestamps are available */
  highlightWords?: boolean;

  /** Automatically scroll to the active line */
  autoScroll?: boolean;
}

interface AnimatedLineProps {
  line: LyricLine;
  isActive: boolean;
  isPast: boolean;
  currentTimeMs: number;
  lineStyle?: TextStyle;
  activeLineStyle?: TextStyle;
  pastLineStyle?: TextStyle;
  highlightWords: boolean;
  hasAlignedWords: boolean;
}

function AnimatedLine({
  line,
  isActive,
  isPast,
  currentTimeMs,
  lineStyle,
  activeLineStyle,
  pastLineStyle,
  highlightWords,
  hasAlignedWords,
}: AnimatedLineProps) {
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
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, isPast, opacity, translateY, scale]);

  const textStyle: TextStyle = isPast
    ? { ...lineStyle, ...pastLineStyle, lineHeight: hasAlignedWords ? 20 : 24 }
    : isActive
      ? {
          ...lineStyle,
          ...activeLineStyle,
          lineHeight: hasAlignedWords ? 26 : 28,
        }
      : (lineStyle ?? {});

  /*
   * Word-level highlighting is only possible when alignedWords
   * are available.
   */
  if (highlightWords && line.words.length > 0) {
    return (
      <Animated.View
        style={[
          {
            opacity,
            transform: [{ translateY }, { scale }],
          },
          hasAlignedWords && { marginTop: -15 },
        ]}
      >
        <Text style={[textStyle, !hasAlignedWords && { lineHeight: 24 }]}>
          {line.words.map((word, index) => {
            const wordStartMs = word.startS * 1000;
            const wordEndMs = word.endS * 1000;

            const isWordActive =
              currentTimeMs >= wordStartMs && currentTimeMs <= wordEndMs;

            const isWordPast = currentTimeMs > wordEndMs;

            return (
              <Text
                key={`${word.startS}-${index}`}
                style={
                  isWordActive
                    ? styles.activeWord
                    : isWordPast
                      ? styles.pastWord
                      : undefined
                }
              >
                {word.word}
              </Text>
            );
          })}
        </Text>
      </Animated.View>
    );
  }

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
      {line.text}
    </Animated.Text>
  );
}

/**
 * Fallback:
 * Split normal lyrics into lines and estimate timing based on
 * character count.
 */
const splitIntoLines = (text: string): string[] => {
  return text
    .split(/\n|\. |! |\? /)
    .map((line) => line.trim())
    .filter(Boolean);
};

const getLineDuration = (line: string) => {
  const base = 400;
  const perChar = 20;

  return Math.min(1200, base + line.length * perChar);
};

const cleanAlignedWords = (alignedWords: AlignedWord[]): AlignedWord[] => {
  const cleaned: AlignedWord[] = [];
  let lyricsStarted = false;

  for (const originalWord of alignedWords) {
    if (originalWord.success === false) continue;

    let word = originalWord.word;

    if (!lyricsStarted) {
      const markerIndex = word.indexOf("[LYRICS]");

      if (markerIndex === -1) {
        continue;
      }

      lyricsStarted = true;

      word = word
        .substring(markerIndex + "[LYRICS]".length)
        .replace(/^\s+/, "");
    }

    word = word.replace(/\[LYRICS\]/gi, "");

    if (!word.trim()) {
      continue;
    }

    cleaned.push({
      ...originalWord,
      word,
    });
  }

  return cleaned;
};

export default function LyricAnimator({
  text = "",
  alignedWords = [],
  currentTimeMs = 0,
  songDurationMs = 0,
  onFinish,
  lineStyle,
  activeLineStyle,
  pastLineStyle,
  style,
  highlightWords = false,
  autoScroll = true,
}: LyricAnimatorProps) {
  const scrollRef = useRef<ScrollView>(null);
  const lineRefs = useRef<Record<number, View | null>>({});

  /**
   * Use timestamp-based lyrics when available.
   * Otherwise use the old text-based fallback.
   */
  const hasAlignedWords = alignedWords.length > 0;

  const lines = useMemo<LyricLine[]>(() => {
    /*
     * ─────────────────────────────────────────────
     * PRIMARY: Real timestamp-based lyrics
     * ─────────────────────────────────────────────
     */
    if (hasAlignedWords) {
      const cleanedWords = cleanAlignedWords(alignedWords);
      const result: LyricLine[] = [];

      let currentWords: AlignedWord[] = [];

      const flushLine = () => {
        if (!currentWords.length) return;

        const lineText = currentWords
          .map((word) => word.word.replace(/\n/g, ""))
          .join(" ")
          .trim();

        if (!lineText) {
          currentWords = [];
          return;
        }

        result.push({
          text: lineText,
          startMs: currentWords[0].startS * 1000,
          endMs: currentWords[currentWords.length - 1].endS * 1000,
          words: currentWords,
        });

        currentWords = [];
      };

      cleanedWords.forEach((word) => {
        if (word.success === false) return;

        const newlineCount = (word.word.match(/\n/g) || []).length;

        currentWords.push(word);

        if (newlineCount > 0) {
          flushLine();
        }
      });

      flushLine();

      return result;
    }

    /*
     * ─────────────────────────────────────────────
     * FALLBACK: Estimated timing from text
     * ─────────────────────────────────────────────
     */
    if (!text.trim()) {
      return [];
    }

    const textLines = splitIntoLines(text);

    const baseDurations = textLines.map(getLineDuration);

    let scaledDurations = baseDurations;

    if (songDurationMs > 0) {
      const total = baseDurations.reduce((sum, duration) => sum + duration, 0);

      if (total > 0) {
        scaledDurations = baseDurations.map(
          (duration) => (duration / total) * songDurationMs,
        );
      }
    }

    let accumulated = 0;

    return textLines.map((line, index) => {
      const startMs = accumulated;
      const endMs = accumulated + scaledDurations[index];

      accumulated = endMs;

      return {
        text: line,
        startMs,
        endMs,
        words: [],
      };
    });
  }, [alignedWords, hasAlignedWords, text, songDurationMs]);

  /**
   * Determine the currently active lyric line.
   *
   * This works for both:
   *
   * 1. Real timestamps
   * 2. Estimated fallback timestamps
   */
  const activeLineIndex = useMemo(() => {
    if (!lines.length) return -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (currentTimeMs >= line.startMs && currentTimeMs <= line.endMs) {
        return i;
      }

      /*
       * If there is a pause between two lines, keep the
       * previous line active until the next line begins.
       */
      if (
        i < lines.length - 1 &&
        currentTimeMs >= line.startMs &&
        currentTimeMs < lines[i + 1].startMs
      ) {
        return i;
      }
    }

    // Before the first lyric starts.
    if (currentTimeMs < lines[0].startMs) {
      return -1;
    }

    // After the final lyric.
    return lines.length - 1;
  }, [currentTimeMs, lines]);

  /**
   * Auto-scroll to active lyric.
   */
  useEffect(() => {
    if (!autoScroll || activeLineIndex < 0) {
      return;
    }

    const timer = setTimeout(() => {
      lineRefs.current[activeLineIndex]?.measureLayout(
        scrollRef.current as any,
        (_x, y) => {
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - 100),
            animated: true,
          });
        },
        () => {
          // Layout might not be ready yet.
        },
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [activeLineIndex, autoScroll]);

  /**
   * Finish callback.
   */
  const hasFinished = useRef(false);

  useEffect(() => {
    if (!lines.length) {
      return;
    }

    const lastLine = lines[lines.length - 1];

    if (currentTimeMs >= lastLine.endMs && !hasFinished.current) {
      hasFinished.current = true;
      onFinish?.();
    }

    /*
     * Reset when playback goes back near the beginning.
     * This also handles seeking back to the start.
     */
    if (currentTimeMs < 1000) {
      hasFinished.current = false;
    }
  }, [currentTimeMs, lines, onFinish]);

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.scroll, style]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {hasAlignedWords && <View style={{ height: 30 }} />}

      {lines.map((line, index) => {
        const isVisible = index <= activeLineIndex;
        const isActive = index === activeLineIndex;
        const isPast = index < activeLineIndex;

        if (!isVisible) {
          return null;
        }

        return (
          <View
            key={`${line.startMs}-${index}`}
            ref={(ref) => {
              lineRefs.current[index] = ref;
            }}
          >
            <AnimatedLine
              line={line}
              isActive={isActive}
              isPast={isPast}
              currentTimeMs={currentTimeMs}
              lineStyle={lineStyle || styles.line}
              activeLineStyle={activeLineStyle || styles.activeLine}
              pastLineStyle={pastLineStyle || styles.pastLine}
              highlightWords={hasAlignedWords && highlightWords}
              hasAlignedWords={hasAlignedWords}
            />
          </View>
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
    gap: 0,
    paddingVertical: 0,
  },
  line: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 20,
  },
  activeLine: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 26,
  },
  pastLine: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 16,
  },
  activeWord: {
    color: "#ffffff",
    fontWeight: "800",
  },
  pastWord: {
    color: "rgba(255,255,255,0.55)",
  },
});
