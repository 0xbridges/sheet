import * as React from "react";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function Group({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.group}>{children}</View>;
}

function GroupRow({
  children,
  divider = false,
}: {
  children: React.ReactNode;
  divider?: boolean;
}) {
  return <View style={[styles.groupRow, divider && styles.groupRowDivider]}>{children}</View>;
}

function ControlRow({
  detail,
  label,
  onPress,
}: {
  detail: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <GroupRow divider>
        <View style={styles.rowCopy}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowDetail}>{detail}</Text>
        </View>
      </GroupRow>
    </Pressable>
  );
}

function InfoRow({
  divider = false,
  label,
  value,
}: {
  divider?: boolean;
  label: string;
  value: string;
}) {
  return (
    <GroupRow divider={divider}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </GroupRow>
  );
}

function ScenarioRow({
  active,
  index,
  onPress,
  scenario,
}: {
  active: boolean;
  index: number;
  onPress: () => void;
  scenario: BottomSheetScenarioDefinition;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <GroupRow divider={index > 0}>
        <View style={styles.rowCopy}>
          <Text style={[styles.rowLabel, active && { color: scenario.accent }]}>
            {scenario.title}
          </Text>
          <Text style={styles.rowDetail}>{scenario.summary}</Text>
        </View>
        <Text style={[styles.rowValue, active && { color: scenario.accent }]}>
          {active ? "selected" : `${index + 1}`.padStart(2, "0")}
        </Text>
      </GroupRow>
    </Pressable>
  );
}

export function DemoScreen() {
  const { height: viewportHeight } = useWindowDimensions();
  const [activeScenarioId, setActiveScenarioId] = React.useState("dynamic-content");
  const [activeTopScenarioId, setActiveTopScenarioId] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTopOpen, setIsTopOpen] = React.useState(false);
  const [currentHeight, setCurrentHeight] = React.useState(0);
  const [currentSnapIndex, setCurrentSnapIndex] = React.useState(-1);
  const [topCurrentHeight, setTopCurrentHeight] = React.useState(0);
  const [topCurrentSnapIndex, setTopCurrentSnapIndex] = React.useState(-1);
  const sheetRef = React.useRef<BottomSheetRef | null>(null);
  const topSheetRef = React.useRef<TopSheetRef | null>(null);
  const queuedActionRef = React.useRef<"expand" | "peek" | null>(null);
  const topQueuedActionRef = React.useRef<"expand" | "peek" | null>(null);

  const isTopMode = activeTopScenarioId != null;

  const activeScenario = React.useMemo(
    () =>
      BOTTOM_SHEET_SCENARIOS.find((scenario) => scenario.id === activeScenarioId) ??
      BOTTOM_SHEET_SCENARIOS[0],
    [activeScenarioId]
  );

  const activeTopScenario = React.useMemo(
    () =>
      activeTopScenarioId != null
        ? TOP_SHEET_SCENARIOS.find((s) => s.id === activeTopScenarioId) ?? TOP_SHEET_SCENARIOS[0]
        : null,
    [activeTopScenarioId]
  );

  const displayTitle = isTopMode ? (activeTopScenario?.title ?? "") : activeScenario.title;
  const displaySummary = isTopMode ? (activeTopScenario?.summary ?? "") : activeScenario.summary;
  const displayInfoRows = isTopMode ? (activeTopScenario?.infoRows ?? []) : activeScenario.infoRows;
  const displayOpen = isTopMode ? isTopOpen : isOpen;
  const displayHeight = isTopMode ? topCurrentHeight : currentHeight;
  const displaySnapIndex = isTopMode ? topCurrentSnapIndex : currentSnapIndex;
  const displayBackdrop = isTopMode
    ? (activeTopScenario?.sheetProps.backdropOpacity === 0
        ? "none"
        : activeTopScenario?.sheetProps.backdropPressBehavior === "none"
          ? "visible · pass-through"
          : "black · tap close")
    : (activeScenario.sheetProps.backdropOpacity === 0
        ? "none"
        : activeScenario.sheetProps.backdropPressBehavior === "none"
          ? "visible · pass-through"
          : "black · tap close");

  const renderContext = React.useMemo<BottomSheetScenarioRenderContext>(
    () => ({
      currentHeight,
      currentSnapIndex,
      isOpen,
    }),
    [currentHeight, currentSnapIndex, isOpen]
  );

  const topRenderContext = React.useMemo<TopSheetScenarioRenderContext>(
    () => ({
      currentHeight: topCurrentHeight,
      currentSnapIndex: topCurrentSnapIndex,
      isOpen: isTopOpen,
    }),
    [topCurrentHeight, topCurrentSnapIndex, isTopOpen]
  );

  React.useEffect(() => {
    if (!isOpen || queuedActionRef.current == null) {
      return;
    }

    const action = queuedActionRef.current;
    queuedActionRef.current = null;

    requestAnimationFrame(() => {
      if (action === "expand") {
        sheetRef.current?.expand();
        return;
      }

      sheetRef.current?.snapToIndex(0);
    });
  }, [activeScenarioId, isOpen]);

  React.useEffect(() => {
    if (!isTopOpen || topQueuedActionRef.current == null) {
      return;
    }

    const action = topQueuedActionRef.current;
    topQueuedActionRef.current = null;

    requestAnimationFrame(() => {
      if (action === "expand") {
        topSheetRef.current?.expand();
        return;
      }

      topSheetRef.current?.snapToIndex(0);
    });
  }, [activeTopScenarioId, isTopOpen]);

  const openBase = React.useCallback(() => {
    if (isTopMode) {
      if (!isTopOpen) {
        topQueuedActionRef.current = "peek";
        setIsTopOpen(true);
        return;
      }
      topSheetRef.current?.snapToIndex(0);
    } else {
      if (!isOpen) {
        queuedActionRef.current = "peek";
        setIsOpen(true);
        return;
      }
      sheetRef.current?.snapToIndex(0);
    }
  }, [isTopMode, isOpen, isTopOpen]);

  const openMax = React.useCallback(() => {
    if (isTopMode) {
      if (!isTopOpen) {
        topQueuedActionRef.current = "expand";
        setIsTopOpen(true);
        return;
      }
      topSheetRef.current?.expand();
    } else {
      if (!isOpen) {
        queuedActionRef.current = "expand";
        setIsOpen(true);
        return;
      }
      sheetRef.current?.expand();
    }
  }, [isTopMode, isOpen, isTopOpen]);

  const closeSheet = React.useCallback(() => {
    if (isTopMode) {
      topQueuedActionRef.current = null;
      topSheetRef.current?.dismiss();
    } else {
      queuedActionRef.current = null;
      sheetRef.current?.dismiss();
    }
  }, [isTopMode]);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Sheet Demos</Text>
            <Text style={styles.subtitle}>
              {BOTTOM_SHEET_SCENARIOS.length + TOP_SHEET_SCENARIOS.length} scenarios
            </Text>
          </View>

          <SectionLabel>Current</SectionLabel>
          <Group>
            <InfoRow label="Scenario" value={displayTitle} />
            <InfoRow divider label="Open" value={displayOpen ? "yes" : "no"} />
            <InfoRow
              divider
              label="Snap index"
              value={displaySnapIndex >= 0 ? `${displaySnapIndex}` : "closed"}
            />
            <InfoRow
              divider
              label="Sheet height"
              value={`${Math.round(displayHeight)} pt`}
            />
            <InfoRow
              divider
              label="Viewport height"
              value={`${Math.round(viewportHeight)} pt`}
            />
            <InfoRow
              divider
              label="Backdrop"
              value={displayBackdrop}
            />
          </Group>

          <SectionLabel>Selected</SectionLabel>
          <Group>
            <InfoRow label="Config" value={displaySummary} />
            {displayInfoRows.map((row, index) => (
              <InfoRow
                divider
                key={`${row.label}-${row.value}-${index}`}
                label={row.label}
                value={row.value}
              />
            ))}
          </Group>

          <SectionLabel>Controls</SectionLabel>
          <Group>
            <Pressable
              onPress={openBase}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <GroupRow>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>Open at base</Text>
                  <Text style={styles.rowDetail}>snap index 0</Text>
                </View>
              </GroupRow>
            </Pressable>
            <ControlRow
              detail="highest configured stop"
              label="Open at max"
              onPress={openMax}
            />
            <ControlRow
              detail="dismiss()"
              label="Close"
              onPress={closeSheet}
            />
          </Group>

          <SectionLabel>Routes</SectionLabel>
          <Group>
            <Pressable
              onPress={() => {
                router.push("/modal-sheet");
              }}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <GroupRow>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>Open modal route</Text>
                  <Text style={styles.rowDetail}>
                    stack modal with embedded bottom sheet
                  </Text>
                </View>
              </GroupRow>
            </Pressable>
            <Pressable
              onPress={() => {
                router.push("/embedded-top-sheet");
              }}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <GroupRow divider>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>Embedded top sheet</Text>
                  <Text style={styles.rowDetail}>
                    inline top sheet that expands to fullscreen
                  </Text>
                </View>
              </GroupRow>
            </Pressable>
          </Group>

          <SectionLabel>Bottom Sheet Scenarios</SectionLabel>
          <Group>
            {BOTTOM_SHEET_SCENARIOS.map((scenario, index) => (
              <ScenarioRow
                active={!isTopMode && scenario.id === activeScenario.id}
                index={index}
                key={scenario.id}
                onPress={() => {
                  setActiveTopScenarioId(null);
                  setIsTopOpen(false);
                  queuedActionRef.current = "peek";
                  setActiveScenarioId(scenario.id);
                  setIsOpen(true);
                }}
                scenario={scenario}
              />
            ))}
          </Group>

          <SectionLabel>Top Sheet Scenarios</SectionLabel>
          <Group>
            {TOP_SHEET_SCENARIOS.map((scenario, index) => (
              <ScenarioRow
                active={isTopMode && scenario.id === activeTopScenarioId}
                index={index}
                key={scenario.id}
                onPress={() => {
                  setIsOpen(false);
                  topQueuedActionRef.current = "peek";
                  setActiveTopScenarioId(scenario.id);
                  setIsTopOpen(true);
                }}
                scenario={scenario}
              />
            ))}
          </Group>
        </ScrollView>
      </SafeAreaView>

      {!isTopMode ? (
        <BottomSheet
          key={activeScenario.id}
          backdropOpacity={activeScenario.sheetProps.backdropOpacity ?? 0.28}
          backdropPressBehavior={
            activeScenario.sheetProps.backdropPressBehavior ?? "close"
          }
          backdropStyle={styles.backdrop}
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
          {...activeScenario.sheetProps}
        >
          {activeScenario.renderContent(renderContext)}
        </BottomSheet>
      ) : null}

      {isTopMode && activeTopScenario != null ? (
        <TopSheet
          key={activeTopScenario.id}
          backdropOpacity={activeTopScenario.sheetProps.backdropOpacity ?? 0.28}
          backdropPressBehavior={
            activeTopScenario.sheetProps.backdropPressBehavior ?? "close"
          }
          backdropStyle={styles.backdrop}
          onOpenChange={(nextOpen) => {
            setIsTopOpen(nextOpen);

            if (!nextOpen) {
              setTopCurrentHeight(0);
              setTopCurrentSnapIndex(-1);
            }
          }}
          onSnapChange={(index, height) => {
            setTopCurrentHeight(height);
            setTopCurrentSnapIndex(index);
          }}
          open={isTopOpen}
          ref={topSheetRef}
          {...activeTopScenario.sheetProps}
        >
          {activeTopScenario.renderContent(topRenderContext)}
        </TopSheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "#000000",
  },
  content: {
    gap: 18,
    paddingBottom: 48,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  group: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    overflow: "hidden",
  },
  groupRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupRowDivider: {
    borderTopColor: "#2C2C2E",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  header: {
    gap: 2,
    paddingTop: 4,
  },
  pressed: {
    opacity: 0.72,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
    paddingRight: 16,
  },
  rowDetail: {
    color: "#8E8E93",
    fontSize: 13,
    lineHeight: 17,
  },
  rowLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  rowValue: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "500",
    maxWidth: "48%",
    textAlign: "right",
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    backgroundColor: "#000000",
    flex: 1,
  },
  sectionLabel: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.1,
    paddingHorizontal: 4,
  },
  subtitle: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "500",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1,
  },
});
