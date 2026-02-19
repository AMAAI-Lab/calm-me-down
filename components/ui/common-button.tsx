import { Pressable, Animated } from "react-native";
import { useRef } from "react";

export default function CommonButton({
  onPress,
  icon,
  style,
  disabled = false,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  style?: any;
  disabled?: boolean;
}) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  const startGlow = () => {
    glowAnim.setValue(0);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <Pressable
      onPress={() => {
        startGlow();
        onPress();
      }}
      disabled={disabled}
      style={[
        {
          width: 60,
          height: 60,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {/* Glow layer */}
      <Animated.View
        style={{
          position: "absolute",
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "#fff", // glow color
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.35],
          }),
          transform: [
            {
              scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1.4],
              }),
            },
          ],
        }}
      />

      {icon}
    </Pressable>
  );
}
