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

const IOS_GREEN = "#30D158";
const IOS_TEAL = "#64D2FF";

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

function SheetContent() {
  return (
    <View style={styles.sheetStack}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>DUPE</Text>
        <Text style={styles.sheetSubtitle}>
          detached · drag down to expand
        </Text>
      </View>

      <View style={styles.sheetGroup}>
        <GroupRow>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>Token price</Text>
            <Text style={styles.rowDetail}>24h volume $1.2M</Text>
          </View>
          <Text style={[styles.sheetValue, { color: IOS_GREEN }]}>
            $0.0203
          </Text>
        </GroupRow>
        <GroupRow divider>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>24H change</Text>
            <Text style={styles.rowDetail}>All-time high $0.041</Text>
          </View>
          <Text style={[styles.sheetValue, { color: IOS_GREEN }]}>
            +11.73%
          </Text>
        </GroupRow>
        <GroupRow divider>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>Market cap</Text>
            <Text style={styles.rowDetail}>Rank #142 by believers</Text>
          </View>
          <Text style={styles.sheetValue}>$20.3M</Text>
        </GroupRow>
        <GroupRow divider>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>Community</Text>
            <Text style={styles.rowDetail}>8,530 active believers</Text>
          </View>
          <Text style={[styles.sheetValue, { color: IOS_TEAL }]}>8.5K</Text>
        </GroupRow>
      </View>

      <View style={styles.sheetGroup}>
        <GroupRow>
          <Text style={styles.rowLabel}>Claimed fees</Text>
          <Text style={[styles.sheetValue, { color: IOS_GREEN }]}>
            $564.4K
          </Text>
        </GroupRow>
        <GroupRow divider>
          <Text style={styles.rowLabel}>Created by</Text>
          <Text style={styles.sheetValue}>Bobby Ghoshal</Text>
        </GroupRow>
        <GroupRow divider>
          <Text style={styles.rowLabel}>Ticker</Text>
          <Text style={styles.sheetValue}>DUPE</Text>
        </GroupRow>
      </View>
    </View>
  );
}

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
          { paddingTop: sheetCollapsedHeight + safeArea.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.backLabel}>{"← Back"}</Text>
        </Pressable>

        <SectionLabel>Trending</SectionLabel>
        <Group>
          <GroupRow>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>PEPE</Text>
              <Text style={styles.rowDetail}>Pepe the Frog memecoin</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_GREEN }]}>
              +24.1%
            </Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>BONK</Text>
              <Text style={styles.rowDetail}>Solana dog coin</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_GREEN }]}>
              +18.7%
            </Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>WIF</Text>
              <Text style={styles.rowDetail}>dogwifhat</Text>
            </View>
            <Text style={[styles.trendValue, { color: "#FF453A" }]}>
              -3.2%
            </Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>FLOKI</Text>
              <Text style={styles.rowDetail}>Floki Inu</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_GREEN }]}>
              +9.4%
            </Text>
          </GroupRow>
        </Group>

        <SectionLabel>Markets</SectionLabel>
        <Group>
          <GroupRow>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>SOL</Text>
              <Text style={styles.rowDetail}>Solana · Layer 1</Text>
            </View>
            <Text style={styles.trendValue}>$178.42</Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>ETH</Text>
              <Text style={styles.rowDetail}>Ethereum · Layer 1</Text>
            </View>
            <Text style={styles.trendValue}>$3,241.80</Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>BTC</Text>
              <Text style={styles.rowDetail}>Bitcoin</Text>
            </View>
            <Text style={styles.trendValue}>$67,890.00</Text>
          </GroupRow>
        </Group>

        <SectionLabel>Activity</SectionLabel>
        <Group>
          <GroupRow>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>Swap completed</Text>
              <Text style={styles.rowDetail}>0.5 SOL → 24,631 DUPE</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_TEAL }]}>12s</Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>Fee claimed</Text>
              <Text style={styles.rowDetail}>LP position #4201</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_TEAL }]}>3m</Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>Transfer received</Text>
              <Text style={styles.rowDetail}>From bobby.sol</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_TEAL }]}>18m</Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>Stake deposit</Text>
              <Text style={styles.rowDetail}>Marinade Finance</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_TEAL }]}>1h</Text>
          </GroupRow>
        </Group>

        <Group>
          <GroupRow>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>LP position opened</Text>
              <Text style={styles.rowDetail}>DUPE/SOL concentrated</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_TEAL }]}>2h</Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>Swap completed</Text>
              <Text style={styles.rowDetail}>2.1 SOL → 103,420 DUPE</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_TEAL }]}>5h</Text>
          </GroupRow>
          <GroupRow divider>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>NFT minted</Text>
              <Text style={styles.rowDetail}>Believer Badge #421</Text>
            </View>
            <Text style={[styles.trendValue, { color: IOS_TEAL }]}>1d</Text>
          </GroupRow>
        </Group>

        <View style={styles.footer}>
          <Text style={styles.footerText}>End of page content</Text>
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
        open
        ref={sheetRef}
        sheetStyle={styles.sheet}
        snapPoints={["42%"]}
      >
        <SheetContent />
      </TopSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  backLabel: {
    color: IOS_TEAL,
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    gap: 18,
    paddingBottom: 48,
    paddingHorizontal: 16,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    color: "#3A3A3C",
    fontSize: 13,
    fontWeight: "500",
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
  sheet: {
    backgroundColor: "#111214",
  },
  sheetContentFill: {
    flex: 1,
  },
  sheetGroup: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 18,
    overflow: "hidden",
  },
  sheetHeader: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sheetStack: {
    gap: 0,
  },
  sheetSubtitle: {
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
  sheetValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
  },
  trendValue: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "500",
    maxWidth: "48%",
    textAlign: "right",
  },
});
