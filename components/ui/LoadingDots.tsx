import { useEffect, useState } from "react";
import { Animated, View } from "react-native";

export default function LoadingDots({ color = "#111827" }: { color?: string }) {
  const [dots] = useState(() => [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    dots.forEach((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 130),
          Animated.timing(dot, {
            toValue: -5,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.delay(520),
        ]),
      ).start(),
    );
  }, [dots]);

  return (
    <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
}
