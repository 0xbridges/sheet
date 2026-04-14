import { router } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomSheet, BottomSheetRef } from "@0xbridges/sheet";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function Group({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function GroupRow({
  children,
  divider = false,
}: {
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <View style={[styles.groupRow, divider && styles.groupRowDivider]}>
      {children}
    </View>
  );
}

function ActionRow({
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

function SheetContent({
  currentHeight,
  currentSnapIndex,
}: {
  currentHeight: number;
  currentSnapIndex: number;
}) {
  return (
    <View style={styles.sheetStack}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Modal Sheet</Text>
        <Text style={styles.sheetSummary}>stack modal route · 280 pt / 72%</Text>
      </View>

      <View style={styles.group}>
        <GroupRow>
          <Text style={styles.rowLabel}>Current height</Text>
          <Text style={styles.modalAccentValue}>{`${Math.round(currentHeight)} pt`}</Text>
        </GroupRow>
        <GroupRow divider>
          <Text style={styles.rowLabel}>Snap index</Text>
          <Text style={styles.rowValue}>
            {currentSnapIndex >= 0 ? `${currentSnapIndex}` : "closed"}
          </Text>
        </GroupRow>
        <GroupRow divider>
          <Text style={styles.rowLabel}>Presentation</Text>
          <Text style={styles.rowValue}>stack modal</Text>
        </GroupRow>
      </View>

      <View style={styles.group}>
        <GroupRow>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>Review summary</Text>
            <Text style={styles.rowDetail}>Last update 2m ago</Text>
          </View>
          <Text style={styles.modalAccentValue}>ready</Text>
        </GroupRow>
        <GroupRow divider>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>Line items</Text>
            <Text style={styles.rowDetail}>Primary flow for nested modal testing</Text>
          </View>
          <Text style={styles.rowValue}>12</Text>
        </GroupRow>
        <GroupRow divider>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>Owner</Text>
            <Text style={styles.rowDetail}>Navigation test surface</Text>
          </View>
          <Text style={styles.rowValue}>GT</Text>
        </GroupRow>
      </View>
    </View>
  );
}

export function ModalSheetScreen() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [currentHeight, setCurrentHeight] = React.useState(0);
  const [currentSnapIndex, setCurrentSnapIndex] = React.useState(-1);
  const sheetRef = React.useRef<BottomSheetRef | null>(null);

  const openBase = React.useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    sheetRef.current?.snapToIndex(0);
  }, [isOpen]);

  const openMax = React.useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      requestAnimationFrame(() => {
        sheetRef.current?.expand();
      });
      return;
    }

    sheetRef.current?.expand();
  }, [isOpen]);

  const closeSheet = React.useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Modal Route</Text>
            <Text style={styles.subtitle}>stack modal with embedded bottom sheet</Text>
          </View>

          <SectionLabel>Route</SectionLabel>
          <Group>
            <InfoRow label="Presentation" value="modal" />
            <InfoRow divider label="Sheet open" value={isOpen ? "yes" : "no"} />
            <InfoRow
              divider
              label="Sheet height"
              value={`${Math.round(currentHeight)} pt`}
            />
            <InfoRow
              divider
              label="Snap index"
              value={currentSnapIndex >= 0 ? `${currentSnapIndex}` : "closed"}
            />
          </Group>

          <SectionLabel>Actions</SectionLabel>
          <Group>
            <Pressable
              onPress={openBase}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <GroupRow>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>Open at base</Text>
                  <Text style={styles.rowDetail}>280 pt</Text>
                </View>
              </GroupRow>
            </Pressable>
            <ActionRow
              detail="72% stop"
              label="Open at max"
              onPress={openMax}
            />
            <ActionRow
              detail="dismiss()"
              label="Close sheet"
              onPress={closeSheet}
            />
            <ActionRow
              detail="router.back()"
              label="Dismiss modal"
              onPress={() => {
                router.back();
              }}
            />
          </Group>

          <SectionLabel>Background</SectionLabel>
          <Group>
            <InfoRow label="Context" value="This route itself is modal." />
            <InfoRow divider label="Use case" value="sheet inside modal stack" />
            <InfoRow divider label="Backdrop" value="sheet dims modal content" />
          </Group>
        </ScrollView>
      </SafeAreaView>

      <BottomSheet
        backdropOpacity={0.28}
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
        snapPoints={[280, "72%"]}
      >
        <SheetContent
          currentHeight={currentHeight}
          currentSnapIndex={currentSnapIndex}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
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
  modalAccentValue: {
    color: "#64D2FF",
    fontSize: 15,
    fontWeight: "600",
    maxWidth: "48%",
    textAlign: "right",
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
    backgroundColor: "#333",
    flex: 1,
  },
  sectionLabel: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.1,
    paddingHorizontal: 4,
  },
  sheetHeader: {
    gap: 4,
  },
  sheetStack: {
    gap: 18,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sheetSummary: {
    color: "#8E8E93",
    fontSize: 14,
    lineHeight: 18,
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.7,
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
