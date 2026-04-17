import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  BottomSheetAnchor,
  BottomSheetProps,
  BottomSheetScrollView,
  TopSheetProps,
  TopSheetScrollView,
  createBottomSheetAnchor,
  useBottomSheetInsets,
  useTopSheetInsets,
} from "@0xbridges/sheet";

export type Pastel = {
  bg: string;
  accent: string;
  chip: string;
  chipText: string;
};

export const PASTELS = {
  mint: { bg: "#D4F1DF", accent: "#0B7F4A", chip: "#BFE9D0", chipText: "#0B7F4A" },
  peach: { bg: "#FFD9C4", accent: "#C5541F", chip: "#FFC8AC", chipText: "#C5541F" },
  sky: { bg: "#D0E6FF", accent: "#1E60C2", chip: "#B8D8FF", chipText: "#1E60C2" },
  lavender: { bg: "#E3D7FD", accent: "#6439C9", chip: "#D2C3FB", chipText: "#6439C9" },
  rose: { bg: "#FFD2DF", accent: "#B72E57", chip: "#FFC1D3", chipText: "#B72E57" },
  butter: { bg: "#FFEFB4", accent: "#8F6A0E", chip: "#FCE599", chipText: "#8F6A0E" },
  coral: { bg: "#FFCDBE", accent: "#B53F23", chip: "#FFBCA8", chipText: "#B53F23" },
  sage: { bg: "#DCEBCD", accent: "#5A7A36", chip: "#CCE0B8", chipText: "#5A7A36" },
  lilac: { bg: "#F3D3F5", accent: "#9A34A8", chip: "#EAC1EC", chipText: "#9A34A8" },
  aqua: { bg: "#C8ECE9", accent: "#1C7A74", chip: "#B4E1DD", chipText: "#1C7A74" },
  blossom: { bg: "#FFD9E4", accent: "#AA3361", chip: "#FFC7D6", chipText: "#AA3361" },
  sand: { bg: "#F3E4C6", accent: "#8E6413", chip: "#EAD6A7", chipText: "#8E6413" },
  cloud: { bg: "#DCE8F2", accent: "#3B6A8E", chip: "#C6D9E7", chipText: "#3B6A8E" },
} as const satisfies Record<string, Pastel>;

export type PastelKey = keyof typeof PASTELS;

const SHEET_BG = "#000000";
const SHEET_FG = "#ffffff";
const SHEET_MUTED = "rgba(255,255,255,0.55)";
const SHEET_CHIP_BG = "rgba(255,255,255,0.08)";
const SHEET_CHIP_BORDER = "rgba(255,255,255,0.14)";
const SHEET_HANDLE = "rgba(255,255,255,0.35)";

const sheetStyleBlack = { backgroundColor: SHEET_BG };

type ScenarioSheetProps = Pick<
  BottomSheetProps,
  | "allowFullScreen"
  | "applyContentInset"
  | "backdropOpacity"
  | "backdropPressBehavior"
  | "collapsedHeight"
  | "contentContainerStyle"
  | "cornerRadius"
  | "coverStatusBar"
  | "detached"
  | "detachedPadding"
  | "dismissible"
  | "dragRegion"
  | "fullScreenCornerRadius"
  | "handleColor"
  | "initialSnapIndex"
  | "sheetStyle"
  | "snapPoints"
>;

export type BottomSheetScenarioRenderContext = {
  currentHeight: number;
  currentSnapIndex: number;
  isOpen: boolean;
};

export type BottomSheetScenarioDefinition = {
  accent: string;
  pastel: Pastel;
  id: string;
  renderContent: (
    context: BottomSheetScenarioRenderContext
  ) => React.ReactNode;
  sheetProps: ScenarioSheetProps;
  summary: string;
  title: string;
};

const overviewAnchor = createBottomSheetAnchor("anchor-overview", { offset: 20 });
const actionsAnchor = createBottomSheetAnchor("anchor-actions", { offset: 20 });
const paymentAnchor = createBottomSheetAnchor("anchor-payment", { offset: 20 });

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{children}</Text>
    </View>
  );
}

function SheetSurface({ children }: { children: React.ReactNode }) {
  return <View style={styles.surface}>{children}</View>;
}

function ChipsRow({
  context,
}: {
  context: BottomSheetScenarioRenderContext | TopSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.chipRow}>
      <Chip>
        {context.currentSnapIndex >= 0
          ? `snap ${context.currentSnapIndex}`
          : "closed"}
      </Chip>
      <Chip>{`${Math.round(context.currentHeight)} pt`}</Chip>
    </View>
  );
}

function SheetBody({
  context,
  subtitle,
  tagline,
  title,
}: {
  context: BottomSheetScenarioRenderContext | TopSheetScenarioRenderContext;
  subtitle: string;
  tagline: string;
  title: string;
}) {
  return (
    <View style={styles.bodyStack}>
      <View style={styles.bodyHeader}>
        <Text style={styles.eyebrow}>{tagline}</Text>
        <Text style={styles.sheetTitle}>{title}</Text>
        <Text style={styles.sheetSubtitle}>{subtitle}</Text>
      </View>

      <ChipsRow context={context} />
    </View>
  );
}

function DynamicContentExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <SheetBody
        context={context}
        subtitle="content · 72% · full"
        tagline="attached"
        title="Dynamic"
      />
    </SheetSurface>
  );
}

function FixedHeightExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <SheetBody
        context={context}
        subtitle="detached · 318 pt"
        tagline="floating"
        title="Fixed"
      />
    </SheetSurface>
  );
}

function PercentageSnapExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <SheetBody
        context={context}
        subtitle="32% · 56% · 84%"
        tagline="percent snaps"
        title="Percent"
      />
    </SheetSurface>
  );
}

function AnchorSnapExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <BottomSheetAnchor name="anchor-overview">
        <Text style={styles.eyebrow}>anchor snaps</Text>
      </BottomSheetAnchor>

      <BottomSheetAnchor name="anchor-actions">
        <View style={styles.bodyHeader}>
          <Text style={styles.sheetTitle}>Anchors</Text>
          <Text style={styles.sheetSubtitle}>snap to any element</Text>
        </View>
      </BottomSheetAnchor>

      <BottomSheetAnchor name="anchor-payment">
        <ChipsRow context={context} />
      </BottomSheetAnchor>
    </SheetSurface>
  );
}

function DetachedCardExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <SheetBody
        context={context}
        subtitle="detached · 46%"
        tagline="card"
        title="Detached"
      />
    </SheetSurface>
  );
}

function DetachedToFullscreenExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  const insets = useBottomSheetInsets();

  return (
    <View
      style={[
        styles.surface,
        styles.fill,
        { backgroundColor: SHEET_BG, paddingTop: 16 + insets.top },
      ]}
    >
      <SheetBody
        context={context}
        subtitle="46% · edge-to-edge fullscreen"
        tagline="detached → full"
        title="Morph"
      />
    </View>
  );
}

function NonDismissableExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <SheetBody
        context={context}
        subtitle="220 pt · 56% · rubber-band"
        tagline="non-dismissible"
        title="Locked"
      />
    </SheetSurface>
  );
}

function CollapsiblePeekExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <SheetBody
        context={context}
        subtitle="136 pt peek · 48% · 84%"
        tagline="no backdrop"
        title="Peek"
      />
    </SheetSurface>
  );
}

function WorkflowSnapsExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <SheetBody
        context={context}
        subtitle="160 · 336 · 72% · full"
        tagline="workflow"
        title="Steps"
      />
    </SheetSurface>
  );
}

function ScrollableFullscreenExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  const insets = useBottomSheetInsets();

  return (
    <BottomSheetScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          backgroundColor: SHEET_BG,
          paddingBottom: insets.bottom + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: SHEET_BG }}
    >
      <SheetBody
        context={context}
        subtitle="48% · 82% · full · content drag"
        tagline="scrollable"
        title="Scroll"
      />
      <View style={styles.scrollSpacer} />
    </BottomSheetScrollView>
  );
}

export const BOTTOM_SHEET_SCENARIOS: BottomSheetScenarioDefinition[] = [
  {
    accent: PASTELS.sky.accent,
    pastel: PASTELS.sky,
    id: "dynamic-content",
    renderContent: (context) => <DynamicContentExample context={context} />,
    sheetProps: {
      allowFullScreen: true,
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["content", "72%"],
    },
    summary: "content · 72% · full",
    title: "Dynamic",
  },
  {
    accent: PASTELS.peach.accent,
    pastel: PASTELS.peach,
    id: "fixed-height",
    renderContent: (context) => <FixedHeightExample context={context} />,
    sheetProps: {
      cornerRadius: 56,
      detached: true,
      detachedPadding: { bottom: 24, horizontal: 14 },
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: [318],
    },
    summary: "detached · 318 pt",
    title: "Fixed",
  },
  {
    accent: PASTELS.aqua.accent,
    pastel: PASTELS.aqua,
    id: "percentage-snaps",
    renderContent: (context) => <PercentageSnapExample context={context} />,
    sheetProps: {
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 1,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["32%", "56%", "84%"],
    },
    summary: "32% · 56% · 84%",
    title: "Percent",
  },
  {
    accent: PASTELS.mint.accent,
    pastel: PASTELS.mint,
    id: "anchor-snaps",
    renderContent: (context) => <AnchorSnapExample context={context} />,
    sheetProps: {
      allowFullScreen: true,
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 2,
      sheetStyle: sheetStyleBlack,
      snapPoints: [overviewAnchor, actionsAnchor, paymentAnchor],
    },
    summary: "3 measured anchors · full",
    title: "Anchors",
  },
  {
    accent: PASTELS.lavender.accent,
    pastel: PASTELS.lavender,
    id: "detached-card",
    renderContent: (context) => <DetachedCardExample context={context} />,
    sheetProps: {
      detached: true,
      detachedPadding: { bottom: 24, horizontal: 16 },
      handleColor: SHEET_HANDLE,
      cornerRadius: 56,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["46%"],
    },
    summary: "detached · 46%",
    title: "Card",
  },
  {
    accent: PASTELS.butter.accent,
    pastel: PASTELS.butter,
    id: "detached-fullscreen",
    renderContent: (context) => <DetachedToFullscreenExample context={context} />,
    sheetProps: {
      allowFullScreen: true,
      contentContainerStyle: { flex: 1 },
      cornerRadius: 56,
      coverStatusBar: true,
      detached: true,
      detachedPadding: { bottom: 20, horizontal: 12 },
      fullScreenCornerRadius: 0,
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["46%"],
    },
    summary: "46% · edge-to-edge fullscreen",
    title: "Morph",
  },
  {
    accent: PASTELS.coral.accent,
    pastel: PASTELS.coral,
    id: "non-dismissible",
    renderContent: (context) => <NonDismissableExample context={context} />,
    sheetProps: {
      dismissible: false,
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: [220, "56%"],
    },
    summary: "220 pt · 56% · rubber-band",
    title: "Locked",
  },
  {
    accent: PASTELS.lilac.accent,
    pastel: PASTELS.lilac,
    id: "collapsible-peek",
    renderContent: (context) => <CollapsiblePeekExample context={context} />,
    sheetProps: {
      backdropOpacity: 0,
      backdropPressBehavior: "none",
      collapsedHeight: 136,
      dismissible: false,
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["48%", "84%"],
    },
    summary: "136 pt peek · 48% · 84%",
    title: "Peek",
  },
  {
    accent: PASTELS.sage.accent,
    pastel: PASTELS.sage,
    id: "workflow-snaps",
    renderContent: (context) => <WorkflowSnapsExample context={context} />,
    sheetProps: {
      allowFullScreen: true,
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: [160, 336, "72%"],
    },
    summary: "160 · 336 · 72% · full",
    title: "Steps",
  },
  {
    accent: PASTELS.rose.accent,
    pastel: PASTELS.rose,
    id: "scrollable-fullscreen",
    renderContent: (context) => <ScrollableFullscreenExample context={context} />,
    sheetProps: {
      allowFullScreen: true,
      applyContentInset: false,
      dragRegion: "sheet",
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["48%", "82%"],
    },
    summary: "48% · 82% · full · content drag",
    title: "Scroll",
  },
];

type TopSheetScenarioSheetProps = Pick<
  TopSheetProps,
  | "allowFullScreen"
  | "applyContentInset"
  | "backdropOpacity"
  | "backdropPressBehavior"
  | "bottomInset"
  | "collapsedHeight"
  | "contentContainerStyle"
  | "contentTopInset"
  | "cornerRadius"
  | "detached"
  | "detachedPadding"
  | "dismissible"
  | "dragRegion"
  | "fullScreenCornerRadius"
  | "handleColor"
  | "initialSnapIndex"
  | "sheetStyle"
  | "snapPoints"
>;

export type TopSheetScenarioRenderContext = {
  currentHeight: number;
  currentSnapIndex: number;
  isOpen: boolean;
};

export type TopSheetScenarioDefinition = {
  accent: string;
  pastel: Pastel;
  id: string;
  renderContent: (
    context: TopSheetScenarioRenderContext
  ) => React.ReactNode;
  sheetProps: TopSheetScenarioSheetProps;
  summary: string;
  title: string;
};

function TopDetachedExample({
  context,
}: {
  context: TopSheetScenarioRenderContext;
}) {
  return (
    <SheetSurface>
      <SheetBody
        context={context}
        subtitle="detached · 42%"
        tagline="top sheet"
        title="Top"
      />
    </SheetSurface>
  );
}

function TopMorphExample({
  context,
}: {
  context: TopSheetScenarioRenderContext;
}) {
  return (
    <View style={[styles.surface, styles.fill, { backgroundColor: SHEET_BG }]}>
      <SheetBody
        context={context}
        subtitle="42% · morph to fullscreen"
        tagline="top morph"
        title="Expand"
      />
    </View>
  );
}

function TopScrollableExample({
  context,
}: {
  context: TopSheetScenarioRenderContext;
}) {
  const insets = useTopSheetInsets();

  return (
    <TopSheetScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          backgroundColor: SHEET_BG,
          paddingTop: insets.top + 10,
        },
      ]}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: SHEET_BG }}
    >
      <SheetBody
        context={context}
        subtitle="48% · 82% · full · content drag"
        tagline="top scrollable"
        title="Flow"
      />
      <View style={styles.scrollSpacer} />
    </TopSheetScrollView>
  );
}

export const TOP_SHEET_SCENARIOS: TopSheetScenarioDefinition[] = [
  {
    accent: PASTELS.blossom.accent,
    pastel: PASTELS.blossom,
    id: "top-detached",
    renderContent: (context) => <TopDetachedExample context={context} />,
    sheetProps: {
      cornerRadius: 44,
      detached: true,
      detachedPadding: { horizontal: 12, top: 12 },
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["42%"],
    },
    summary: "detached · 42%",
    title: "Top",
  },
  {
    accent: PASTELS.sand.accent,
    pastel: PASTELS.sand,
    id: "top-detached-fullscreen",
    renderContent: (context) => <TopMorphExample context={context} />,
    sheetProps: {
      allowFullScreen: true,
      contentContainerStyle: { flex: 1 },
      cornerRadius: 44,
      detached: true,
      detachedPadding: { horizontal: 12, top: 12 },
      fullScreenCornerRadius: 0,
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["26%"],
    },
    summary: "26% · morph to fullscreen",
    title: "Expand",
  },
  {
    accent: PASTELS.cloud.accent,
    pastel: PASTELS.cloud,
    id: "top-scrollable-fullscreen",
    renderContent: (context) => <TopScrollableExample context={context} />,
    sheetProps: {
      allowFullScreen: true,
      applyContentInset: false,
      dragRegion: "sheet",
      handleColor: SHEET_HANDLE,
      initialSnapIndex: 0,
      sheetStyle: sheetStyleBlack,
      snapPoints: ["48%", "82%"],
    },
    summary: "48% · 82% · full · content drag",
    title: "Flow",
  },
];

const styles = StyleSheet.create({
  bodyHeader: {
    gap: 2,
  },
  bodyStack: {
    gap: 18,
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
    letterSpacing: -0.1,
  },
  eyebrow: {
    color: SHEET_MUTED,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
    paddingBottom: 6,
    textTransform: "uppercase",
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: SHEET_BG,
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  scrollSpacer: {
    minHeight: 1200,
  },
  sheetSubtitle: {
    color: SHEET_MUTED,
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.2,
    lineHeight: 21,
    paddingTop: 6,
  },
  sheetTitle: {
    color: SHEET_FG,
    fontSize: 44,
    fontWeight: "700",
    letterSpacing: -1.8,
    lineHeight: 46,
  },
  surface: {
    backgroundColor: SHEET_BG,
    flex: 0,
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
});
