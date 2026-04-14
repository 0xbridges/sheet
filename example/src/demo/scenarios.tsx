import * as React from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

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

type ScenarioSheetProps = Pick<
  BottomSheetProps,
  | "allowFullScreen"
  | "applyContentInset"
  | "backdropOpacity"
  | "backdropPressBehavior"
  | "collapsedHeight"
  | "contentContainerStyle"
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

type ScenarioInfoRow = {
  label: string;
  value: string;
};

type DataRow = {
  detail?: string;
  label: string;
  value: string;
  valueColor?: string;
};

export type BottomSheetScenarioRenderContext = {
  currentHeight: number;
  currentSnapIndex: number;
  isOpen: boolean;
};

export type BottomSheetScenarioDefinition = {
  accent: string;
  id: string;
  infoRows: ScenarioInfoRow[];
  renderContent: (
    context: BottomSheetScenarioRenderContext
  ) => React.ReactNode;
  sheetProps: ScenarioSheetProps;
  summary: string;
  title: string;
};

const IOS_BLUE = "#0A84FF";
const IOS_GREEN = "#30D158";
const IOS_ORANGE = "#FF9F0A";
const IOS_RED = "#FF453A";
const IOS_TEAL = "#64D2FF";

const overviewAnchor = createBottomSheetAnchor("anchor-overview", {
  offset: 18,
});
const actionsAnchor = createBottomSheetAnchor("anchor-actions", {
  offset: 18,
});
const paymentAnchor = createBottomSheetAnchor("anchor-payment", {
  offset: 18,
});

const ACTIVITY_LOG = [
  ["00:14", "Checkout latency alert", "payments-api / us-east-1"],
  ["00:11", "Fallback processor enabled", "rerouted 14% of traffic"],
  ["00:09", "New merchant report", "three failed retries"],
  ["00:06", "Canary deploy completed", "release 2026.04.13.7"],
  ["00:04", "Synthetic check passed", "eu-west-1"],
  ["00:02", "Queue depth normalized", "primary database"],
  ["23:58", "Refund job resumed", "batch 44021"],
  ["23:54", "Runbook linked", "ops/payments/p1"],
  ["23:49", "Error budget breached", "below 99.1%"],
  ["23:42", "Escalation sent", "payments on-call"],
];

function SheetHeader({
  summary,
  title,
}: {
  summary: string;
  title: string;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSummary}>{summary}</Text>
    </View>
  );
}

function Section({
  rows,
  title,
}: {
  rows: DataRow[];
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>
        {rows.map((row, index) => (
          <View
            key={`${title}-${row.label}-${index}`}
            style={[styles.groupRow, index > 0 && styles.groupRowDivider]}
          >
            <View style={styles.groupCopy}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              {row.detail ? <Text style={styles.rowDetail}>{row.detail}</Text> : null}
            </View>
            <Text
              style={[
                styles.rowValue,
                row.valueColor ? { color: row.valueColor } : null,
              ]}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RuntimeSection({
  accent,
  context,
  extraRows = [],
}: {
  accent: string;
  context: BottomSheetScenarioRenderContext;
  extraRows?: DataRow[];
}) {
  const insets = useBottomSheetInsets();
  const { height: viewportHeight } = useWindowDimensions();

  return (
    <Section
      rows={[
        {
          label: "Current height",
          value: `${Math.round(context.currentHeight)} pt`,
          valueColor: accent,
        },
        {
          label: "Snap index",
          value:
            context.currentSnapIndex >= 0
              ? `${context.currentSnapIndex}`
              : "closed",
        },
        {
          label: "Bottom safe area",
          value: `${Math.round(insets.bottom)} pt`,
        },
        {
          label: "Viewport height",
          value: `${Math.round(viewportHeight)} pt`,
        },
        ...extraRows,
      ]}
      title="Runtime"
    />
  );
}

function DynamicContentExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.stack}>
      <SheetHeader
        summary="attached · content / 72% / safe-area ceiling"
        title="Dynamic Content"
      />
      <RuntimeSection
        accent={IOS_BLUE}
        context={context}
        extraRows={[
          { label: "Measured rows", value: "3" },
          { label: "Dismiss", value: "swipe + backdrop" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "Legal review pending · updated 6m ago",
            label: "Northwind annual renewal",
            value: "$18.4k",
            valueColor: IOS_BLUE,
          },
          {
            detail: "Finance sign-off required · due today",
            label: "Warehouse hardware purchase",
            value: "$9.2k",
            valueColor: IOS_BLUE,
          },
          {
            detail: "Export already generated",
            label: "Q2 analytics archive",
            value: "ready",
            valueColor: IOS_GREEN,
          },
        ]}
        title="Pending approvals"
      />
    </View>
  );
}

function FixedHeightExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.stack}>
      <SheetHeader summary="detached · 318 pt" title="Fixed Height" />
      <RuntimeSection
        accent={IOS_ORANGE}
        context={context}
        extraRows={[
          { label: "Target height", value: "318 pt", valueColor: IOS_ORANGE },
          { label: "Detached padding", value: "14 pt" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "Review mode stays on until 08:00",
            label: "Focus mode",
            value: "active",
            valueColor: IOS_GREEN,
          },
          {
            detail: "Current board link copied",
            label: "Share session",
            value: "01:12 ago",
          },
          {
            detail: "Muted for shipping project",
            label: "Notifications",
            value: "08:00",
          },
          {
            detail: "Current selection only",
            label: "Export CSV",
            value: "214 rows",
          },
        ]}
        title="Utilities"
      />
    </View>
  );
}

function PercentageSnapExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.stack}>
      <SheetHeader
        summary="attached · 32% / 56% / 84%"
        title="Percentage Snaps"
      />
      <RuntimeSection
        accent={IOS_TEAL}
        context={context}
        extraRows={[
          { label: "Snap set", value: "32 / 56 / 84%" },
          { label: "Dismiss", value: "swipe + backdrop" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "Fast-moving stock in the last 48 hours",
            label: "$0 - $50",
            value: "124",
            valueColor: IOS_TEAL,
          },
          {
            detail: "Largest inventory bucket",
            label: "$50 - $150",
            value: "381",
            valueColor: IOS_TEAL,
          },
          {
            detail: "Lower inventory premium range",
            label: "$150+",
            value: "64",
            valueColor: IOS_TEAL,
          },
        ]}
        title="Price bands"
      />
      <Section
        rows={[
          { label: "In stock", value: "on", valueColor: IOS_GREEN },
          { label: "Free shipping", value: "on", valueColor: IOS_GREEN },
          { label: "Same day", value: "off" },
        ]}
        title="Filter state"
      />
    </View>
  );
}

function AnchorSnapExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.stack}>
      <SheetHeader
        summary="attached · 3 measured anchors / full"
        title="Anchor Snaps"
      />
      <RuntimeSection
        accent={IOS_GREEN}
        context={context}
        extraRows={[
          { label: "Anchor count", value: "3", valueColor: IOS_GREEN },
          { label: "Dismiss", value: "swipe + backdrop" },
        ]}
      />
      <BottomSheetAnchor name="anchor-overview">
        <Section
          rows={[
            {
              detail: "Team plan · annual billing",
              label: "Workspace subscription",
              value: "$96.00",
            },
            {
              detail: "18 new editors",
              label: "Seat expansion",
              value: "$144.00",
            },
          ]}
          title="Order summary"
        />
      </BottomSheetAnchor>
      <BottomSheetAnchor name="anchor-actions">
        <Section
          rows={[
            {
              detail: "Provision immediately after payment",
              label: "Instant provisioning",
              value: "default",
              valueColor: IOS_BLUE,
            },
            {
              detail: "Manual approval queue",
              label: "Review fallback",
              value: "available",
            },
          ]}
          title="Fulfillment"
        />
      </BottomSheetAnchor>
      <BottomSheetAnchor name="anchor-payment">
        <Section
          rows={[
            {
              detail: "Corporate card · expires 11/27",
              label: "Visa ending 2048",
              value: "default",
              valueColor: IOS_BLUE,
            },
            {
              detail: "Settlement up to one business day",
              label: "Bank transfer",
              value: "available",
            },
          ]}
          title="Payment"
        />
      </BottomSheetAnchor>
    </View>
  );
}

function DetachedCardExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.stack}>
      <SheetHeader summary="detached · 46%" title="Detached Card" />
      <RuntimeSection
        accent={IOS_BLUE}
        context={context}
        extraRows={[
          { label: "Detached padding", value: "16 pt" },
          { label: "Dismiss", value: "swipe + backdrop" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "Portable LED task lamp",
            label: "Product",
            value: "SKU 0412",
          },
          {
            detail: "Ships tomorrow",
            label: "Stock",
            value: "24",
            valueColor: IOS_GREEN,
          },
          {
            detail: "Matte black finish",
            label: "Price",
            value: "$129",
            valueColor: IOS_BLUE,
          },
        ]}
        title="Inventory"
      />
      <Section
        rows={[
          { detail: "Battery-backed", label: "Run time", value: "18 hrs" },
          { detail: "Warm / neutral / daylight", label: "Presets", value: "3" },
        ]}
        title="Specs"
      />
    </View>
  );
}

function DetachedToFullscreenExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <View style={[styles.stack, styles.fill]}>
      <SheetHeader
        summary="detached · 46% / safe-area ceiling"
        title="Detached To Fullscreen"
      />
      <RuntimeSection
        accent={IOS_TEAL}
        context={context}
        extraRows={[
          { label: "Top ceiling", value: "safe area" },
          { label: "Corner morph", value: "live" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "payments-api / production",
            label: "Incident",
            value: "P1",
            valueColor: IOS_RED,
          },
          {
            detail: "Checkout error rate climbed from 0.7% to 4.3%",
            label: "Current signal",
            value: "10m",
          },
          {
            detail: "Fallback processor healthy",
            label: "Mitigation",
            value: "active",
            valueColor: IOS_GREEN,
          },
          {
            detail: "Nine merchants impacted",
            label: "Affected merchants",
            value: "9",
          },
        ]}
        title="Incident detail"
      />
      <View style={styles.fillSpacer} />
      <Section
        rows={[
          { label: "Owner", value: "GT" },
          { label: "Next review", value: "00:20" },
          { label: "Escalation room", value: "payments-p1" },
        ]}
        title="Response"
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
    <View style={styles.stack}>
      <SheetHeader
        summary="attached · 220 pt / 56% · rubber-band floor"
        title="Non-dismissible"
      />
      <RuntimeSection
        accent={IOS_ORANGE}
        context={context}
        extraRows={[
          { label: "Dismiss", value: "disabled", valueColor: IOS_ORANGE },
          { label: "Backdrop tap", value: "ignored" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "Primary notification channel",
            label: "ops@northwind.com",
            value: "verified",
            valueColor: IOS_GREEN,
          },
          {
            detail: "Fallback SMS for lockouts",
            label: "Phone ending 12",
            value: "pending",
            valueColor: IOS_ORANGE,
          },
          {
            detail: "Print and store offline",
            label: "Backup codes",
            value: "new",
          },
        ]}
        title="Recovery methods"
      />
    </View>
  );
}

function CollapsiblePeekExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.stack}>
      <SheetHeader
        summary="attached · 136 pt peek / 48% / 84%"
        title="Collapsible Peek"
      />
      <RuntimeSection
        accent={IOS_BLUE}
        context={context}
        extraRows={[
          { label: "Peek height", value: "136 pt", valueColor: IOS_BLUE },
          { label: "Dismiss", value: "disabled" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "231 Harbor Ave",
            label: "Warehouse 12",
            value: "12 min",
            valueColor: IOS_BLUE,
          },
          {
            detail: "Open until 22:00",
            label: "Dock queue",
            value: "low",
            valueColor: IOS_GREEN,
          },
          {
            detail: "Three pickup windows available",
            label: "Next slot",
            value: "20:00",
          },
        ]}
        title="Location"
      />
      <Section
        rows={[
          { label: "Directions", value: "ready", valueColor: IOS_GREEN },
          { label: "Call desk", value: "+1 415 555 0123" },
        ]}
        title="Actions"
      />
    </View>
  );
}

function WorkflowSnapsExample({
  context,
}: {
  context: BottomSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.stack}>
      <SheetHeader
        summary="attached · 160 pt / 336 pt / 72% / full"
        title="Workflow Snaps"
      />
      <RuntimeSection
        accent={IOS_BLUE}
        context={context}
        extraRows={[
          { label: "Steps", value: "3" },
          { label: "Order", value: "R-183042", valueColor: IOS_BLUE },
        ]}
      />
      <Section
        rows={[
          {
            detail: "Validate SLA, account flags, and totals",
            label: "01  Review order",
            value: "ready",
            valueColor: IOS_GREEN,
          },
          {
            detail: "Choose carrier, warehouse, and dispatch window",
            label: "02  Route shipment",
            value: "dock B",
            valueColor: IOS_BLUE,
          },
          {
            detail: "Generate confirmation and send summary",
            label: "03  Finalize handoff",
            value: "pending",
            valueColor: IOS_ORANGE,
          },
        ]}
        title="Routing"
      />
    </View>
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
          paddingBottom: insets.bottom + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <SheetHeader
        summary="attached · 48% / 82% / full · content drag"
        title="Scrollable Fullscreen"
      />
      <RuntimeSection
        accent={IOS_GREEN}
        context={context}
        extraRows={[
          { label: "Entries", value: `${ACTIVITY_LOG.length}` },
          { label: "Drag region", value: "content" },
        ]}
      />
      <Section
        rows={ACTIVITY_LOG.map(([time, label, detail]) => ({
          detail,
          label,
          value: time,
          valueColor: IOS_GREEN,
        }))}
        title="Activity log"
      />
    </BottomSheetScrollView>
  );
}

function createScenarioDefinitions(): BottomSheetScenarioDefinition[] {
  return [
    {
      accent: IOS_BLUE,
      id: "dynamic-content",
      infoRows: [
        { label: "Mode", value: "attached" },
        { label: "Snaps", value: "content / 72% / full" },
        { label: "Dismiss", value: "swipe + backdrop" },
      ],
      renderContent: (context) => <DynamicContentExample context={context} />,
      sheetProps: {
        allowFullScreen: true,
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: ["content", "72%"],
      },
      summary: "attached · content / 72% / full",
      title: "Dynamic Content",
    },
    {
      accent: IOS_ORANGE,
      id: "fixed-height",
      infoRows: [
        { label: "Mode", value: "detached" },
        { label: "Height", value: "318 pt" },
        { label: "Padding", value: "14 pt" },
      ],
      renderContent: (context) => <FixedHeightExample context={context} />,
      sheetProps: {
        detached: true,
        detachedPadding: {
          bottom: 14,
          horizontal: 14,
        },
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: [318],
      },
      summary: "detached · 318 pt",
      title: "Fixed Height",
    },
    {
      accent: IOS_TEAL,
      id: "percentage-snaps",
      infoRows: [
        { label: "Mode", value: "attached" },
        { label: "Snaps", value: "32% / 56% / 84%" },
        { label: "Dismiss", value: "swipe + backdrop" },
      ],
      renderContent: (context) => <PercentageSnapExample context={context} />,
      sheetProps: {
        initialSnapIndex: 1,
        sheetStyle: styles.sheet,
        snapPoints: ["32%", "56%", "84%"],
      },
      summary: "attached · 32% / 56% / 84%",
      title: "Percentage Snaps",
    },
    {
      accent: IOS_GREEN,
      id: "anchor-snaps",
      infoRows: [
        { label: "Mode", value: "attached" },
        { label: "Anchors", value: "overview / fulfillment / payment" },
        { label: "Ceiling", value: "full" },
      ],
      renderContent: (context) => <AnchorSnapExample context={context} />,
      sheetProps: {
        allowFullScreen: true,
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: [overviewAnchor, actionsAnchor, paymentAnchor],
      },
      summary: "attached · 3 measured anchors / full",
      title: "Anchor Snaps",
    },
    {
      accent: IOS_BLUE,
      id: "detached-card",
      infoRows: [
        { label: "Mode", value: "detached" },
        { label: "Snap", value: "46%" },
        { label: "Padding", value: "16 pt" },
      ],
      renderContent: (context) => <DetachedCardExample context={context} />,
      sheetProps: {
        detached: true,
        detachedPadding: {
          bottom: 16,
          horizontal: 16,
        },
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: ["46%"],
      },
      summary: "detached · 46%",
      title: "Detached Card",
    },
    {
      accent: IOS_TEAL,
      id: "detached-fullscreen",
      infoRows: [
        { label: "Mode", value: "detached to fullscreen" },
        { label: "Base", value: "46%" },
        { label: "Top ceiling", value: "safe area" },
      ],
      renderContent: (context) => (
        <DetachedToFullscreenExample context={context} />
      ),
      sheetProps: {
        allowFullScreen: true,
        contentContainerStyle: styles.fill,
        detached: true,
        detachedPadding: {
          bottom: 12,
          horizontal: 12,
        },
        fullScreenCornerRadius: 0,
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: ["46%"],
      },
      summary: "detached · 46% / safe-area ceiling",
      title: "Detached To Fullscreen",
    },
    {
      accent: IOS_ORANGE,
      id: "non-dismissible",
      infoRows: [
        { label: "Mode", value: "attached" },
        { label: "Snaps", value: "220 pt / 56%" },
        { label: "Dismiss", value: "disabled" },
      ],
      renderContent: (context) => <NonDismissableExample context={context} />,
      sheetProps: {
        dismissible: false,
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: [220, "56%"],
      },
      summary: "attached · 220 pt / 56% · rubber-band floor",
      title: "Non-dismissible",
    },
    {
      accent: IOS_BLUE,
      id: "collapsible-peek",
      infoRows: [
        { label: "Mode", value: "attached" },
        { label: "Peek", value: "136 pt" },
        { label: "Backdrop", value: "none" },
      ],
      renderContent: (context) => <CollapsiblePeekExample context={context} />,
      sheetProps: {
        backdropOpacity: 0,
        backdropPressBehavior: "none",
        collapsedHeight: 136,
        dismissible: false,
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: ["48%", "84%"],
      },
      summary: "attached · 136 pt peek / 48% / 84% · no backdrop",
      title: "Collapsible Peek",
    },
    {
      accent: IOS_BLUE,
      id: "workflow-snaps",
      infoRows: [
        { label: "Mode", value: "attached" },
        { label: "Snaps", value: "160 pt / 336 pt / 72% / full" },
        { label: "Flow", value: "3 steps" },
      ],
      renderContent: (context) => <WorkflowSnapsExample context={context} />,
      sheetProps: {
        allowFullScreen: true,
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: [160, 336, "72%"],
      },
      summary: "attached · 160 pt / 336 pt / 72% / full",
      title: "Workflow Snaps",
    },
    {
      accent: IOS_GREEN,
      id: "scrollable-fullscreen",
      infoRows: [
        { label: "Mode", value: "attached" },
        { label: "Snaps", value: "48% / 82% / full" },
        { label: "Drag region", value: "sheet + scroll handoff" },
      ],
      renderContent: (context) => (
        <ScrollableFullscreenExample context={context} />
      ),
      sheetProps: {
        allowFullScreen: true,
        applyContentInset: false,
        dragRegion: "sheet",
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: ["48%", "82%"],
      },
      summary: "attached · 48% / 82% / full · content drag",
      title: "Scrollable Fullscreen",
    },
  ];
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  fillSpacer: {
    flex: 1,
  },
  group: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    overflow: "hidden",
  },
  groupCopy: {
    flex: 1,
    gap: 4,
    paddingRight: 16,
  },
  groupRow: {
    alignItems: "flex-start",
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
    gap: 4,
  },
  headerSummary: {
    color: "#8E8E93",
    fontSize: 14,
    lineHeight: 18,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.7,
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
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    paddingTop: 1,
    textAlign: "right",
  },
  scrollContent: {
    gap: 18,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.1,
    paddingHorizontal: 4,
  },
  sheet: {
    backgroundColor: "#111214",
  },
  stack: {
    gap: 18,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});

export const BOTTOM_SHEET_SCENARIOS = createScenarioDefinitions();

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
  id: string;
  infoRows: ScenarioInfoRow[];
  renderContent: (
    context: TopSheetScenarioRenderContext
  ) => React.ReactNode;
  sheetProps: TopSheetScenarioSheetProps;
  summary: string;
  title: string;
};

function TopSheetRuntimeSection({
  accent,
  context,
  extraRows = [],
}: {
  accent: string;
  context: TopSheetScenarioRenderContext;
  extraRows?: DataRow[];
}) {
  const insets = useTopSheetInsets();
  const { height: viewportHeight } = useWindowDimensions();

  return (
    <Section
      rows={[
        {
          label: "Current height",
          value: `${Math.round(context.currentHeight)} pt`,
          valueColor: accent,
        },
        {
          label: "Snap index",
          value:
            context.currentSnapIndex >= 0
              ? `${context.currentSnapIndex}`
              : "closed",
        },
        {
          label: "Top safe area",
          value: `${Math.round(insets.top)} pt`,
        },
        {
          label: "Viewport height",
          value: `${Math.round(viewportHeight)} pt`,
        },
        ...extraRows,
      ]}
      title="Runtime"
    />
  );
}

function TopSheetDetachedExample({
  context,
}: {
  context: TopSheetScenarioRenderContext;
}) {
  return (
    <View style={styles.stack}>
      <SheetHeader
        summary="detached · 42% / safe-area floor"
        title="Top Sheet Detached"
      />
      <TopSheetRuntimeSection
        accent={IOS_GREEN}
        context={context}
        extraRows={[
          { label: "Mode", value: "detached card" },
          { label: "Dismiss", value: "swipe up + backdrop" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "24h volume $1.2M · trending",
            label: "Token price",
            value: "$0.0203",
            valueColor: IOS_GREEN,
          },
          {
            detail: "All-time high $0.041",
            label: "24H change",
            value: "+11.73%",
            valueColor: IOS_GREEN,
          },
          {
            detail: "Rank #142 by believers",
            label: "Market cap",
            value: "$20.3M",
          },
        ]}
        title="Market overview"
      />
    </View>
  );
}

function TopSheetDetachedToFullscreenExample({
  context,
}: {
  context: TopSheetScenarioRenderContext;
}) {
  return (
    <View style={[styles.stack, styles.fill]}>
      <SheetHeader
        summary="detached · 42% / safe-area floor"
        title="Top Sheet To Fullscreen"
      />
      <TopSheetRuntimeSection
        accent={IOS_GREEN}
        context={context}
        extraRows={[
          { label: "Bottom ceiling", value: "safe area" },
          { label: "Corner morph", value: "live" },
        ]}
      />
      <Section
        rows={[
          {
            detail: "24h volume $1.2M · trending",
            label: "Token price",
            value: "$0.0203",
            valueColor: IOS_GREEN,
          },
          {
            detail: "All-time high $0.041",
            label: "24H change",
            value: "+11.73%",
            valueColor: IOS_GREEN,
          },
          {
            detail: "Rank #142 by believers",
            label: "Market cap",
            value: "$20.3M",
          },
          {
            detail: "8,530 active believers",
            label: "Community",
            value: "8.5K",
            valueColor: IOS_TEAL,
          },
        ]}
        title="Market overview"
      />
      <View style={styles.fillSpacer} />
      <Section
        rows={[
          { label: "Claimed fees", value: "$564.4K", valueColor: IOS_GREEN },
          { label: "Created by", value: "Bobby Ghoshal" },
          { label: "Ticker", value: "DUPE" },
        ]}
        title="Token details"
      />
    </View>
  );
}

function TopSheetScrollableExample({
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
          paddingTop: insets.top + 10,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <SheetHeader
        summary="attached · 48% / 82% / full · content drag"
        title="Top Sheet Scrollable"
      />
      <TopSheetRuntimeSection
        accent={IOS_TEAL}
        context={context}
        extraRows={[
          { label: "Entries", value: `${ACTIVITY_LOG.length}` },
          { label: "Drag region", value: "content" },
        ]}
      />
      <Section
        rows={ACTIVITY_LOG.map(([time, label, detail]) => ({
          detail,
          label,
          value: time,
          valueColor: IOS_TEAL,
        }))}
        title="Activity log"
      />
    </TopSheetScrollView>
  );
}

function createTopSheetScenarioDefinitions(): TopSheetScenarioDefinition[] {
  return [
    {
      accent: IOS_GREEN,
      id: "top-detached",
      infoRows: [
        { label: "Mode", value: "detached" },
        { label: "Snap", value: "42%" },
        { label: "Dismiss", value: "swipe up + backdrop" },
      ],
      renderContent: (context) => <TopSheetDetachedExample context={context} />,
      sheetProps: {
        cornerRadius: 56,
        detached: true,
        detachedPadding: {
          horizontal: 12,
          top: 12,
        },
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: ["42%"],
      },
      summary: "detached · 42%",
      title: "Top Sheet Detached",
    },
    {
      accent: IOS_GREEN,
      id: "top-detached-fullscreen",
      infoRows: [
        { label: "Mode", value: "detached to fullscreen" },
        { label: "Base", value: "42%" },
        { label: "Bottom ceiling", value: "safe area" },
      ],
      renderContent: (context) => (
        <TopSheetDetachedToFullscreenExample context={context} />
      ),
      sheetProps: {
        allowFullScreen: true,
        contentContainerStyle: styles.fill,
        cornerRadius: 56,
        detached: true,
        detachedPadding: {
          horizontal: 12,
          top: 12,
        },
        fullScreenCornerRadius: 0,
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: ["42%"],
      },
      summary: "detached · 42% / safe-area floor",
      title: "Top Sheet To Fullscreen",
    },
    {
      accent: IOS_TEAL,
      id: "top-scrollable-fullscreen",
      infoRows: [
        { label: "Mode", value: "attached" },
        { label: "Snaps", value: "48% / 82% / full" },
        { label: "Drag region", value: "sheet + scroll handoff" },
      ],
      renderContent: (context) => (
        <TopSheetScrollableExample context={context} />
      ),
      sheetProps: {
        allowFullScreen: true,
        applyContentInset: false,
        dragRegion: "sheet",
        initialSnapIndex: 0,
        sheetStyle: styles.sheet,
        snapPoints: ["48%", "82%"],
      },
      summary: "attached · 48% / 82% / full · content drag",
      title: "Top Sheet Scrollable",
    },
  ];
}

export const TOP_SHEET_SCENARIOS = createTopSheetScenarioDefinitions();
