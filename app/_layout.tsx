import AuthProvider from "@/context/AuthContext";
import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          animation: Platform.OS === "ios" ? "ios_from_right" : "fade",

          animationDuration: 300,

          contentStyle: {
            backgroundColor: "#ffffff",
          },

          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="search-bar"
          options={{
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="rooms-list"
          options={{
            animation: "fade",
            headerTitle: "Rooms List",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="room-details"
          options={{
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="review-booking-screen"
          options={{
            animation: "fade",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            animation: "fade",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            animation: "fade",
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
