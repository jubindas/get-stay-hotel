/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface CustomTabOptions {
  tabBarIconName?: IconName;
}

const { width } = Dimensions.get("window");
const TAB_BAR_WIDTH = width - 40;
const TAB_WIDTH = TAB_BAR_WIDTH / 4;

const COLORS = {
  bg: "#0f172a",
  primary: "#10b981",
  inactive: "#64748b",
  white: "#ffffff",
};

const SPRING_CONFIG: WithSpringConfig = {
  damping: 18,
  stiffness: 150,
  mass: 1,
};

function TabButton({ state, descriptors, navigation }: BottomTabBarProps) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, SPRING_CONFIG);
  }, [state.index]);

  const slidingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.tabBar}>
      <Animated.View style={[styles.slidingIndicator, slidingStyle]} />

      {state.routes.map((route, index) => {
        // Cast options to include our custom tabBarIconName
        const options = descriptors[route.key].options as CustomTabOptions;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            hitSlop={10}
          >
            <TabIcon
              isFocused={isFocused}
              name={options.tabBarIconName || "help-circle"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

interface TabIconProps {
  isFocused: boolean;
  name: IconName;
}

function TabIcon({ isFocused, name }: TabIconProps) {
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused ? 1.15 : 1, SPRING_CONFIG) }],
  }));

  return (
    <Animated.View style={animatedIconStyle}>
      <Ionicons
        name={isFocused ? (name.replace("-outline", "") as IconName) : name}
        size={24}
        color={isFocused ? COLORS.white : COLORS.inactive}
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabButton {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIconName: "home-outline" } as any}
      />
      <Tabs.Screen
        name="wishlist"
        options={{ tabBarIconName: "heart-outline" } as any}
      />
      <Tabs.Screen
        name="notifications"
        options={{ tabBarIconName: "notifications-outline" } as any}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIconName: "person-outline" } as any}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: COLORS.bg,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 2,
  },
  slidingIndicator: {
    position: "absolute",
    width: TAB_WIDTH - 12,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    left: 6,
    zIndex: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
