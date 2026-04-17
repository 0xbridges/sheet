import { router } from "expo-router";
import * as React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TopSheet, TopSheetRef } from "@0xbridges/sheet";

const SHEET_BG = "#000000";
const SHEET_FG = "#ffffff";
const SHEET_MUTED = "rgba(255,255,255,0.55)";
const SHEET_CHIP_BG = "rgba(255,255,255,0.08)";
const SHEET_CHIP_BORDER = "rgba(255,255,255,0.14)";

const PAGE_BG = "#ffffff";
const TILE_BG = "#f2f2f2";
const TILE_LINE = "#d9d9d9";
const TEXT_MUTED = "#8a8a8a";
const TEXT_STRONG = "#111111";

function SheetContent() {
  return (
    <View style={styles.sheetStack}>
      <View>
        <Text style={styles.eyebrow}>embedded · top</Text>
        <Text style={styles.sheetTitle}>Above.</Text>
        <Text style={styles.sheetSubtitle}>
          A persistent top sheet that expands to fullscreen while the page
          scrolls beneath.
        </Text>
      </View>

      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>detached</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>drag down</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>no backdrop</Text>
        </View>
      </View>
    </View>
  );
}

const ROWS = [
  { width: "72%" as const },
  { width: "48%" as const },
  { width: "64%" as const },
  { width: "36%" as const },
  { width: "58%" as const },
  { width: "44%" as const },
];

export function EmbeddedTopSheetScreen() {
  const { height: screenHeight } = useWindowDimensions();
  const safeArea = useSafeAreaInsets();
  const sheetRef = React.useRef<TopSheetRef | null>(null);

  const sheetCollapsedHeight = screenHeight * 0.42 + 12;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: sheetCollapsedHeight + safeArea.top + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>Close</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Section</Text>
          <View style={styles.card}>
            {ROWS.map((row, index) => (
              <View key={`line-${index}`} style={styles.lineRow}>
                <View style={[styles.line, { width: row.width }]} />
                {index < ROWS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <TopSheet
        allowFullScreen
        backdropOpacity={0}
        backdropPressBehavior="none"
        contentContainerStyle={styles.sheetContentFill}
        cornerRadius={56}
        defaultOpen
        detached
        detachedPadding={{ horizontal: 12, top: 12 }}
        dismissible={false}
        dragRegion="sheet"
        fullScreenCornerRadius={0}
        handleColor="rgba(255,255,255,0.35)"
        open
        ref={sheetRef}
        sheetStyle={styles.sheet}
        snapPoints={["42%"]}
      >
        <View style={styles.sheetSurface}>
          <SheetContent />
        </View>
      </TopSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: "flex-start",
    borderColor: "#e5e5e5",
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
  card: {
    backgroundColor: TILE_BG,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 4,
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
    flexWrap: "wrap",
    gap: 8,
  },
  chipText: {
    color: SHEET_FG,
    fontSize: 13,
    fontWeight: "500",
  },
  content: {
    gap: 24,
    paddingBottom: 64,
    paddingHorizontal: 20,
  },
  divider: {
    backgroundColor: "#e6e6e6",
    height: 1,
    marginTop: 16,
  },
  eyebrow: {
    color: SHEET_MUTED,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
    paddingBottom: 6,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  line: {
    backgroundColor: TILE_LINE,
    borderRadius: 3,
    height: 6,
  },
  lineRow: {
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  screen: {
    backgroundColor: PAGE_BG,
    flex: 1,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.4,
    paddingHorizontal: 4,
    textTransform: "uppercase",
  },
  sheet: {
    backgroundColor: SHEET_BG,
  },
  sheetContentFill: {
    flex: 1,
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
    maxWidth: 320,
    paddingTop: 8,
  },
  sheetSurface: {
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sheetTitle: {
    color: SHEET_FG,
    fontSize: 44,
    fontWeight: "700",
    letterSpacing: -1.8,
    lineHeight: 46,
  },
  tile: {
    aspectRatio: 1,
    backgroundColor: TILE_BG,
    borderRadius: 20,
    flexBasis: "47%",
    flexGrow: 1,
  },
});
