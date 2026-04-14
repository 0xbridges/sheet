import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "#07111f",
          },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="modal-sheet"
          options={{
            contentStyle: {
              backgroundColor: "#000000",
            },
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen name="embedded-top-sheet" />
      </Stack>
    </GestureHandlerRootView>
  );
}
