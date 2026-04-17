import { router } from "expo-router";
import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomSheet, BottomSheetRef } from "@0xbridges/sheet";

const SHEET_BG = "#000000";
const SHEET_FG = "#ffffff";
const SHEET_MUTED = "rgba(255,255,255,0.55)";
const SHEET_CHIP_BG = "rgba(255,255,255,0.08)";
const SHEET_CHIP_BORDER = "rgba(255,255,255,0.14)";

const PAGE_BG = "#ffffff";
const TEXT_STRONG = "#111111";
const TEXT_MUTED = "#7a7a7a";
const BORDER = "#e5e5e5";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{children}</Text>
    </View>
  );
}

function SheetContent({
  currentHeight,
  currentSnapIndex,
}: {
  currentHeight: number;
  currentSnapIndex: number;
}) {
  return (
    <View style={styles.sheetStack}>
      <View>
        <Text style={styles.eyebrow}>modal route</Text>
        <Text style={styles.sheetTitle}>Nested</Text>
        <Text style={styles.sheetSubtitle}>sheet inside a stack modal</Text>
      </View>

      <View style={styles.chipRow}>
        <Chip>
          {currentSnapIndex >= 0 ? `snap ${currentSnapIndex}` : "closed"}
        </Chip>
        <Chip>{`${Math.round(currentHeight)} pt`}</Chip>
      </View>
    </View>
  );
}

export function ModalSheetScreen() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [currentHeight, setCurrentHeight] = React.useState(0);
  const [currentSnapIndex, setCurrentSnapIndex] = React.useState(-1);
  const sheetRef = React.useRef<BottomSheetRef | null>(null);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.content}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>Close</Text>
          </Pressable>

          <View style={styles.headline}>
            <Text style={styles.kicker}>modal stack</Text>
            <Text style={styles.title}>Sheet inside a modal.</Text>
            <Text style={styles.subtitle}>
              The route itself presents as a modal, with a bottom sheet composed on top.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                if (!isOpen) {
                  setIsOpen(true);
                  return;
                }
                sheetRef.current?.snapToIndex(0);
              }}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <Text style={styles.actionText}>Base</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!isOpen) {
                  setIsOpen(true);
                  requestAnimationFrame(() => sheetRef.current?.expand());
                  return;
                }
                sheetRef.current?.expand();
              }}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <Text style={styles.actionText}>Max</Text>
            </Pressable>
            <Pressable
              onPress={() => sheetRef.current?.dismiss()}
              style={({ pressed }) => [
                styles.action,
                styles.actionGhost,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.actionText, styles.actionTextGhost]}>Close sheet</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <BottomSheet
        backdropOpacity={0.22}
        handleColor="rgba(255,255,255,0.35)"
        onOpenChange={(nextOpen) => {
          setIsOpen(nextOpen);
          if (!nextOpen) {
            setCurrentHeight(0);
            setCurrentSnapIndex(-1);
          }
        }}
        onSnapChange={(index, height) => {
          setCurrentHeight(height);
          setCurrentSnapIndex(index);
        }}
        open={isOpen}
        ref={sheetRef}
        sheetStyle={styles.sheet}
        snapPoints={[260, "72%"]}
      >
        <View style={styles.sheetSurface}>
          <SheetContent
            currentHeight={currentHeight}
            currentSnapIndex={currentSnapIndex}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    backgroundColor: TEXT_STRONG,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  actionGhost: {
    backgroundColor: "transparent",
    borderColor: BORDER,
    borderWidth: 1,
  },
  actionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  actionTextGhost: {
    color: TEXT_STRONG,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  back: {
    alignSelf: "flex-start",
    borderColor: BORDER,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    color: TEXT_STRONG,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  chip: {
    backgroundColor: SHEET_CHIP_BG,
    borderColor: SHEET_CHIP_BORDER,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chipText: {
    color: SHEET_FG,
    fontSize: 13,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  eyebrow: {
    color: SHEET_MUTED,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
    paddingBottom: 6,
    textTransform: "uppercase",
  },
  headline: {
    gap: 8,
  },
  kicker: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    backgroundColor: PAGE_BG,
    flex: 1,
  },
  sheet: {
    backgroundColor: SHEET_BG,
  },
  sheetStack: {
    gap: 20,
  },
  sheetSubtitle: {
    color: SHEET_MUTED,
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.2,
    lineHeight: 21,
    paddingTop: 6,
  },
  sheetSurface: {
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  sheetTitle: {
    color: SHEET_FG,
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1.6,
    lineHeight: 44,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.2,
    lineHeight: 21,
    maxWidth: 320,
  },
  title: {
    color: TEXT_STRONG,
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1.6,
    lineHeight: 44,
  },
});
