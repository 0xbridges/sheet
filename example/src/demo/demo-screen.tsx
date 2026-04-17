import * as React from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomSheet, BottomSheetRef, TopSheet, TopSheetRef } from "@0xbridges/sheet";

import {
  BOTTOM_SHEET_SCENARIOS,
  BottomSheetScenarioDefinition,
  BottomSheetScenarioRenderContext,
  TOP_SHEET_SCENARIOS,
  TopSheetScenarioDefinition,
  TopSheetScenarioRenderContext,
} from "@/demo/scenarios";

const SYSTEM_BG = "#F2F2F7";
const GROUPED_BG = "#FFFFFF";
const LABEL = "#000000";
const SECONDARY_LABEL = "#8E8E93";
const TERTIARY_LABEL = "#C7C7CC";
const SEPARATOR = "#E5E5EA";

type RowProps = {
  accent: string;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
  subtitle: string;
  title: string;
};

function Row({ accent, isFirst, isLast, onPress, subtitle, title }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isFirst && styles.rowFirst,
        isLast && styles.rowLast,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={[styles.rowDot, { backgroundColor: accent }]} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function Group({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.group}>
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 ? <Separator /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function DemoScreen() {
  const [activeBottom, setActiveBottom] =
    React.useState<BottomSheetScenarioDefinition | null>(null);
  const [activeTop, setActiveTop] =
    React.useState<TopSheetScenarioDefinition | null>(null);

  const [bottomHeight, setBottomHeight] = React.useState(0);
  const [bottomSnap, setBottomSnap] = React.useState(-1);
  const [topHeight, setTopHeight] = React.useState(0);
  const [topSnap, setTopSnap] = React.useState(-1);

  const bottomRef = React.useRef<BottomSheetRef | null>(null);
  const topRef = React.useRef<TopSheetRef | null>(null);

  const openBottom = React.useCallback((scenario: BottomSheetScenarioDefinition) => {
    setActiveTop(null);
    setActiveBottom(scenario);
  }, []);

  const openTop = React.useCallback((scenario: TopSheetScenarioDefinition) => {
    setActiveBottom(null);
    setActiveTop(scenario);
  }, []);

  const bottomContext = React.useMemo<BottomSheetScenarioRenderContext>(
    () => ({
      currentHeight: bottomHeight,
      currentSnapIndex: bottomSnap,
      isOpen: activeBottom != null,
    }),
    [activeBottom, bottomHeight, bottomSnap]
  );

  const topContext = React.useMemo<TopSheetScenarioRenderContext>(
    () => ({
      currentHeight: topHeight,
      currentSnapIndex: topSnap,
      isOpen: activeTop != null,
    }),
    [activeTop, topHeight, topSnap]
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.largeTitle}>Sheets</Text>
            <Text style={styles.headerCaption}>
              {BOTTOM_SHEET_SCENARIOS.length + TOP_SHEET_SCENARIOS.length}{" "}
              showcases · @0xbridges/sheet
            </Text>
          </View>

          <SectionHeader title="Bottom" />
          <Group>
            {BOTTOM_SHEET_SCENARIOS.map((scenario, index) => (
              <Row
                accent={scenario.accent}
                isFirst={index === 0}
                isLast={index === BOTTOM_SHEET_SCENARIOS.length - 1}
                key={scenario.id}
                onPress={() => openBottom(scenario)}
                subtitle={scenario.summary}
                title={scenario.title}
              />
            ))}
          </Group>

          <SectionHeader title="Top" />
          <Group>
            {TOP_SHEET_SCENARIOS.map((scenario, index) => (
              <Row
                accent={scenario.accent}
                isFirst={index === 0}
                isLast={index === TOP_SHEET_SCENARIOS.length - 1}
                key={scenario.id}
                onPress={() => openTop(scenario)}
                subtitle={scenario.summary}
                title={scenario.title}
              />
            ))}
          </Group>

          <SectionHeader title="Routes" />
          <Group>
            <Row
              accent={LABEL}
              isFirst
              isLast={false}
              onPress={() => router.push("/modal-sheet")}
              subtitle="Stack modal with embedded sheet"
              title="Modal route"
            />
            <Row
              accent={LABEL}
              isFirst={false}
              isLast
              onPress={() => router.push("/embedded-top-sheet")}
              subtitle="Inline top sheet with scroll"
              title="Embedded top"
            />
          </Group>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </SafeAreaView>

      {activeBottom != null ? (
        <BottomSheet
          key={activeBottom.id}
          backdropOpacity={activeBottom.sheetProps.backdropOpacity ?? 0.22}
          backdropPressBehavior={
            activeBottom.sheetProps.backdropPressBehavior ?? "close"
          }
          backdropStyle={styles.backdrop}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setActiveBottom(null);
              setBottomHeight(0);
              setBottomSnap(-1);
            }
          }}
          onSnapChange={(index, height) => {
            setBottomHeight(height);
            setBottomSnap(index);
          }}
          open={activeBottom != null}
          ref={bottomRef}
          {...activeBottom.sheetProps}
        >
          {activeBottom.renderContent(bottomContext)}
        </BottomSheet>
      ) : null}

      {activeTop != null ? (
        <TopSheet
          key={activeTop.id}
          backdropOpacity={activeTop.sheetProps.backdropOpacity ?? 0.22}
          backdropPressBehavior={
            activeTop.sheetProps.backdropPressBehavior ?? "close"
          }
          backdropStyle={styles.backdrop}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setActiveTop(null);
              setTopHeight(0);
              setTopSnap(-1);
            }
          }}
          onSnapChange={(index, height) => {
            setTopHeight(height);
            setTopSnap(index);
          }}
          open={activeTop != null}
          ref={topRef}
          {...activeTop.sheetProps}
        >
          {activeTop.renderContent(topContext)}
        </TopSheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "#000000",
  },
  chevron: {
    color: TERTIARY_LABEL,
    fontSize: 22,
    fontWeight: "400",
    lineHeight: 22,
    marginLeft: 8,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  footerSpacer: {
    height: 12,
  },
  group: {
    backgroundColor: GROUPED_BG,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    gap: 4,
    paddingBottom: 18,
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  headerCaption: {
    color: SECONDARY_LABEL,
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  largeTitle: {
    color: LABEL,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  row: {
    alignItems: "center",
    backgroundColor: GROUPED_BG,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  rowDot: {
    borderRadius: 5,
    height: 10,
    marginRight: 14,
    width: 10,
  },
  rowFirst: {},
  rowLast: {},
  rowPressed: {
    backgroundColor: "#D1D1D6",
  },
  rowSubtitle: {
    color: SECONDARY_LABEL,
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: -0.1,
    paddingTop: 1,
  },
  rowText: {
    flex: 1,
    flexShrink: 1,
  },
  rowTitle: {
    color: LABEL,
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    backgroundColor: SYSTEM_BG,
    flex: 1,
  },
  sectionHeader: {
    color: SECONDARY_LABEL,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
    paddingBottom: 6,
    paddingHorizontal: 16,
    paddingTop: 22,
    textTransform: "uppercase",
  },
  separator: {
    backgroundColor: SEPARATOR,
    height: StyleSheet.hairlineWidth,
    marginLeft: 40,
  },
});
