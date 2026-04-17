import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const CANVAS_BG = "#F4F4F6";
const MODAL_BG = "#E3D7FD";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: CANVAS_BG,
          },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="modal-sheet"
          options={{
            contentStyle: {
              backgroundColor: MODAL_BG,
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
