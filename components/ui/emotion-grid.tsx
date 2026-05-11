import { EMOTION_GRID } from "@/constants/appConstants";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";


const QUADRANT_COLORS = [
  {
    bg: "#C0253A",
    selected: "#8b00008d",
    text: "#fff",
    pill: "rgba(255,255,255,0.15)",
  },
  {
    bg: "#3A7D44",
    selected: "#1e4d287d",
    text: "#fff",
    pill: "rgba(255,255,255,0.15)",
  },
  {
    bg: "#5A5475",
    selected: "#35304d89",
    text: "#fff",
    pill: "rgba(255,255,255,0.15)",
  },
  {
    bg: "#1B7F6E",
    selected: "#0d4d4267",
    text: "#fff",
    pill: "rgba(255,255,255,0.15)",
  },
];

const TABLET_BREAKPOINT = 500; // px
const DIVIDER = "#34373C";

interface EmotionGridProps {
  emotion: string;
  setEmotion: (e: string) => void;
}

// Main Component
const EmotionGrid = ({
  emotion,
  setEmotion,
}: EmotionGridProps) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  if (isTablet) {
    return (
      <TabletLayout emotion={emotion} setEmotion={setEmotion} />
    );
  }
  return (
    <MobileLayout emotion={emotion} setEmotion={setEmotion} />
  );
};

// Tablet
const TabletLayout: React.FC<EmotionGridProps> = ({
  emotion,
  setEmotion,
}) => (
  <View style={[tabletStyles.wrapper]}>
    <View style={tabletStyles.row}>
      <Quadrant
        emotions={EMOTION_GRID[0]}
        colors={QUADRANT_COLORS[0]}
        selected={emotion}
        onSelect={setEmotion}
        style={tabletStyles.cell}
      />
      <View style={tabletStyles.vDivider} />
      <Quadrant
        emotions={EMOTION_GRID[1]}
        colors={QUADRANT_COLORS[1]}
        selected={emotion}
        onSelect={setEmotion}
        style={tabletStyles.cell}
      />
    </View>

    <View style={tabletStyles.hDivider} />

    <View style={tabletStyles.row}>
      <Quadrant
        emotions={EMOTION_GRID[2]}
        colors={QUADRANT_COLORS[2]}
        selected={emotion}
        onSelect={setEmotion}
        style={tabletStyles.cell}
      />
      <View style={tabletStyles.vDivider} />
      <Quadrant
        emotions={EMOTION_GRID[3]}
        colors={QUADRANT_COLORS[3]}
        selected={emotion}
        onSelect={setEmotion}
        style={tabletStyles.cell}
      />
    </View>
  </View>
);

// Mobile
const MobileLayout: React.FC<EmotionGridProps> = ({
  emotion,
  setEmotion,
}) => (
  <View
    style={mobileStyles.container}
  >
    {EMOTION_GRID.map((emotions, i) => (
      <React.Fragment key={i}>
        {i !== 0 && <View style={mobileStyles.divider} />}
        <Quadrant
          emotions={emotions}
          colors={QUADRANT_COLORS[i]}
          selected={emotion}
          onSelect={setEmotion}
        />
      </React.Fragment>
    ))}
  </View>
);


interface QuadrantProps {
  emotions: string[];
  colors: (typeof QUADRANT_COLORS)[0];
  selected: string;
  onSelect: (e: string) => void;
  style?: ViewStyle;
}
const Quadrant: React.FC<QuadrantProps> = ({
  emotions,
  colors,
  selected,
  onSelect,
  style,
}) => (
  <View
    style={[quadrantStyles.container, { backgroundColor: colors.bg }, style]}
  >
    <View style={quadrantStyles.grid}>
      {emotions.map((e) => {
        const isSelected = selected === e;
        return (
          <Pressable
            key={e}
            onPress={() => onSelect(e)}
            style={({ pressed }) => [
              quadrantStyles.pill,
              {
                backgroundColor: isSelected ? colors.selected : colors.pill,
                borderColor: isSelected ? colors.text : "transparent",
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: isSelected ? 1.04 : 1 }],
              },
            ]}
          >
            <Text
              style={[
                quadrantStyles.label,
                {
                  color: colors.text,
                  fontWeight: isSelected ? "700" : "400",
                },
              ]}
            >
              {e}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

// Styles 
const tabletStyles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 0,
  },
  vDivider: {
    width: 1,
    backgroundColor: DIVIDER,
  },
  hDivider: {
    height: 1,
    backgroundColor: DIVIDER,
  },
});

const mobileStyles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#34373C",
  },
});

const quadrantStyles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1.5,
    minWidth: "42%",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
});

export default EmotionGrid;
