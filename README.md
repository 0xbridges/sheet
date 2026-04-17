# @0xbridges/sheet
### Performant React Native Bottom & Top Sheets

[![npm](https://img.shields.io/npm/v/@0xbridges/sheet)](https://www.npmjs.com/package/@0xbridges/sheet)   ![GitHub Repo stars](https://img.shields.io/github/stars/0xbridges/sheet)
<img width="1954" height="786" alt="Image" src="https://github.com/user-attachments/assets/8fff6400-c4e7-497f-b1e5-2b2bff1f6637" />
<video width="470" height="960" alt="Video" src="https://github.com/user-attachments/assets/f8940e78-7e61-42ec-ad3d-40169e83b201" />

`@0xbridges/sheet` is a React Native library for performant bottom sheets and top sheets where:

- snap points accept pixels, percentages, `"content"` sizing, and measured anchors
- detached sheets can morph into fullscreen with live corner-radius interpolation
- dismissal rubber-bands at the floor instead of freezing when `dismissible={false}`
- `collapsedHeight` adds a persistent peek state for maps-style attached sheets
- scrollable content hands off between sheet drag and inner scroll automatically
- the backdrop can be configured to pass through touches or close on tap

The library exports two main components: `BottomSheet` (slides up from the bottom) and `TopSheet` (slides down from the top). Both share the same snap-point system, gesture engine, and animation behavior.

If you want a shorter machine-oriented summary, see [`llms.txt`](./llms.txt).

## What It Does

`BottomSheet` is a flexible sheet container that slides up from the bottom of the screen. `TopSheet` is its counterpart that slides down from the top.

Both components handle:

- spring-based snap animation
- multi-stop snap points
- horizontal gesture rejection
- backdrop opacity interpolation
- rubber-band overscroll at edges
- detached floating card mode
- fullscreen expansion with corner morph
- scroll-to-drag handoff for inner scrollable content
- anchor-based snap points measured from child layout

## Core Behavior

These are the important behavior rules (they apply to both `BottomSheet` and `TopSheet` unless noted):

1. The sheet snaps to the nearest snap point on release, projected by velocity.
2. Swiping past the floor dismisses when `dismissible` is true.
3. When `dismissible={false}`, swiping below the floor rubber-bands instead of dismissing. For `TopSheet` at fullscreen with `dismissible={false}`, dragging collapses back to the lowest snap point instead of dismissing.
4. Backdrop opacity scales between floor and ceiling heights. Below the floor it fades toward zero.
5. The backdrop blocks touches when `backdropPressBehavior="close"` and passes them through with `"none"`.
6. Anchor snap points are measured from child layout using `BottomSheetAnchor` / `TopSheetAnchor` marker views.
7. `BottomSheetScrollView` / `TopSheetScrollView` enables scroll-to-drag handoff: the sheet drags until it reaches the ceiling, then inner scrolling takes over.
8. Detached sheets float with configurable padding and can morph into fullscreen when `allowFullScreen` is set.

### TopSheet-specific behavior

- The drag handle starts at the **bottom** when collapsed and transitions to the **top** as the sheet expands to fullscreen.
- At fullscreen the handle includes safe-area padding so content starts below the Dynamic Island / notch.
- Fullscreen dismissal uses a slide-down gesture (like swiping a notification away). When `dismissible={false}`, this gesture collapses back to the lowest snap instead of dismissing.

## Installation

Install the package and make sure your app already has the required gesture/animation setup.

```bash
npm install @0xbridges/sheet react-native-gesture-handler react-native-reanimated react-native-safe-area-context
```

Your app must have:

- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`
- the normal configuration required by those libraries for your React Native or Expo setup

## Quick Start

### BottomSheet

```tsx
import { BottomSheet } from "@0xbridges/sheet";

export function Example() {
  return (
    <BottomSheet
      snapPoints={["content", "72%"]}
      allowFullScreen
      initialSnapIndex={0}
    >
      <YourContent />
    </BottomSheet>
  );
}
```

### TopSheet

```tsx
import { TopSheet } from "@0xbridges/sheet";

export function Example() {
  return (
    <TopSheet
      snapPoints={["42%"]}
      allowFullScreen
      detached
      detachedPadding={{ horizontal: 12, top: 12 }}
      cornerRadius={56}
      fullScreenCornerRadius={0}
      initialSnapIndex={0}
    >
      <YourContent />
    </TopSheet>
  );
}
```

## Snap Point Types

Snap points define the heights the sheet can rest at. Pass them as `snapPoints`.

### Pixel values

A number is treated as an absolute height in points.

```tsx
snapPoints={[220, 440]}
```

### Percentage values

A string like `"56%"` is a percentage of the available height (viewport minus top inset).

```tsx
snapPoints={["32%", "56%", "84%"]}
```

### Content sizing

The string `"content"` measures the sheet content's natural height and uses it as a snap point.

```tsx
snapPoints={["content", "72%"]}
```

The natural content height is measured once per presentation in an off-screen container, then the measurement tree unmounts so children render exactly once. If your content can change size while the sheet is open, prefer pixel, percentage, or anchor snap points instead.

### Anchor snap points

Anchor snap points are measured from `BottomSheetAnchor` marker views placed inside the sheet content. Each anchor produces a snap height equal to the anchor's bottom edge plus an optional offset.

```tsx
import { createBottomSheetAnchor, BottomSheetAnchor } from "@0xbridges/sheet";

const summaryAnchor = createBottomSheetAnchor("summary", { offset: 18 });
const detailAnchor = createBottomSheetAnchor("detail", { offset: 18 });

<BottomSheet snapPoints={[summaryAnchor, detailAnchor]} allowFullScreen>
  <BottomSheetAnchor name="summary">
    <SummarySection />
  </BottomSheetAnchor>
  <BottomSheetAnchor name="detail">
    <DetailSection />
  </BottomSheetAnchor>
</BottomSheet>
```

The `name` on `BottomSheetAnchor` must match the `key` passed to `createBottomSheetAnchor`.

### Fullscreen ceiling

When `allowFullScreen` is true, the sheet adds the full available height as an extra snap point above all configured stops.

## Props Reference

### `snapPoints`

Array of snap point definitions. Accepts pixels, percentages, `"content"`, and anchor points. Default: `["content"]`.

### `initialSnapIndex`

Default: `0`

Which snap point to open at when the sheet first presents.

### `open`

Controlled open state. When provided, the sheet is controlled and you must update this value in response to `onOpenChange`.

### `defaultOpen`

Default: `true`

Initial open state for uncontrolled usage.

### `allowFullScreen`

Default: `false`

Adds the full available height as an additional snap point above the highest configured stop.

### `dismissible`

Default: `true`

When true, swiping below the floor or tapping the backdrop dismisses the sheet. When false, the sheet rubber-bands at its lowest snap point.

### `collapsedHeight`

A snap point definition that becomes the sheet's persistent floor. The sheet cannot be dismissed below this height. Useful for maps-style peek states.

### `detached`

Default: `false`

Floats the sheet above the bottom edge with padding. Renders rounded corners on all four sides.

### `detachedPadding`

Padding around a detached sheet. Accepts a number (uniform) or an object with `bottom`, `horizontal`, `left`, `right`, `top`, and `vertical` fields.

### `cornerRadius`

Default: `28`

Border radius for the sheet's top corners (all four corners when detached).

### `fullScreenCornerRadius`

Corner radius when the sheet is at fullscreen height. Defaults to `cornerRadius` for attached sheets and `0` for detached sheets. The radius interpolates live during drag.

### `dragRegion`

Default: `"sheet"`

- `"sheet"`: the entire sheet surface is draggable.
- `"handle"`: only the handle area responds to drag. Use with `BottomSheetScrollView` for scroll-to-drag handoff.

### `backdropOpacity`

Default: `0.34`

Maximum backdrop opacity at the highest snap point. Set to `0` to hide the backdrop.

### `backdropPressBehavior`

Default: `"close"`

- `"close"`: tapping the backdrop dismisses the sheet.
- `"none"`: the backdrop is visible but passes touches through to the content behind it.

### `backdropColor`

Default: `"#000000"`

### `backdropStyle`

Additional style applied to the backdrop pressable.

### `handleVisible`

Default: `true`

Shows or hides the drag handle indicator.

### `handleColor`

Default: `"rgba(255, 255, 255, 0.42)"`

### `handleStyle`

Additional style applied to the handle area.

### `sheetStyle`

Style applied to the sheet container. Use for background color.

### `contentContainerStyle`

Style applied to the content wrapper inside the sheet.

### `applyContentInset`

Default: `true`

When true, adds bottom safe-area padding to the content container.

### `contentBottomInset`

Default: `0`

Extra bottom inset added to the content container, on top of the safe-area inset.

### `topInset`

Default: `0`

Top inset that limits the sheet's maximum height. When `allowFullScreen` is true, the larger of `topInset` and the safe-area top is used.

### `style`

Style applied to the root overlay container.

### `onOpenChange`

`(open: boolean) => void`

Called when the sheet's open state changes. Required for controlled usage.

### `onDismiss`

`() => void`

Called when the sheet finishes dismissing.

### `onSnapChange`

`(index: number, height: number) => void`

Called when the sheet settles at a snap point. Receives the snap index and the resolved height in points.

## Ref Methods

Access imperative methods via a ref.

```tsx
const sheetRef = useRef<BottomSheetRef>(null);

<BottomSheet ref={sheetRef} ...>

sheetRef.current?.present();
sheetRef.current?.dismiss();
sheetRef.current?.expand();
sheetRef.current?.snapToIndex(1);
```

### `present()`

Opens the sheet at `initialSnapIndex`.

### `dismiss()`

Closes the sheet with a spring animation.

### `expand()`

Snaps to the highest configured snap point.

### `snapToIndex(index)`

Snaps to the snap point at the given index.

## Scrollable Content

Use `BottomSheetScrollView` for scrollable content inside the sheet.

When `dragRegion="sheet"`, the scroll view coordinates with the sheet gesture:

- While the sheet is below its ceiling, dragging moves the sheet.
- Once the sheet reaches its ceiling, inner scrolling activates.
- Pulling down from scroll offset zero hands the gesture back to the sheet.

```tsx
import { BottomSheet, BottomSheetScrollView, useBottomSheetInsets } from "@0xbridges/sheet";

function SheetContent() {
  const insets = useBottomSheetInsets();

  return (
    <BottomSheetScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <LongContent />
    </BottomSheetScrollView>
  );
}

<BottomSheet
  snapPoints={["48%", "82%"]}
  allowFullScreen
  dragRegion="sheet"
  applyContentInset={false}
>
  <SheetContent />
</BottomSheet>
```

### `useBottomSheetInsets()`

Returns `{ bottom: number }` representing the content bottom inset (safe area + `contentBottomInset`). Use this to add padding inside `BottomSheetScrollView`.

### `onScroll`

`BottomSheetScrollView` / `TopSheetScrollView` accept an optional `onScroll` callback typed as `(event: NativeScrollEvent) => void` — the raw native event, not a `NativeSyntheticEvent` wrapper. Read offsets directly off the event:

```tsx
<BottomSheetScrollView
  onScroll={(event) => {
    console.log(event.contentOffset.y);
  }}
/>
```

Pass a Reanimated worklet to handle scroll on the UI thread with zero bridge crossings — recommended for parallax, sticky headers, and any per-frame work driven by scroll position:

```tsx
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

const scrollY = useSharedValue(0);
const handleScroll = useAnimatedScrollHandler((event) => {
  "worklet";
  scrollY.value = event.contentOffset.y;
});

<BottomSheetScrollView onScroll={handleScroll}>...</BottomSheetScrollView>;
```

A regular JS function still works; it will be invoked via `runOnJS` with one bridge crossing per scroll event.

## Detached Mode

Detached sheets float above the bottom edge, rounded on all four corners.

```tsx
<BottomSheet
  detached
  detachedPadding={{ bottom: 16, horizontal: 16 }}
  snapPoints={["46%"]}
>
  <CardContent />
</BottomSheet>
```

When combined with `allowFullScreen`, the sheet morphs from a floating card to fullscreen. The corner radius, margins, and shadow interpolate smoothly during the transition.

## Non-Dismissible Sheets

```tsx
<BottomSheet
  dismissible={false}
  snapPoints={[220, "56%"]}
>
  <Content />
</BottomSheet>
```

The sheet rubber-bands at its lowest snap point instead of dismissing. Backdrop tap is ignored.

## Collapsed Peek

```tsx
<BottomSheet
  collapsedHeight={136}
  dismissible={false}
  backdropOpacity={0}
  backdropPressBehavior="none"
  snapPoints={["48%", "84%"]}
>
  <PeekContent />
</BottomSheet>
```

`collapsedHeight` is prepended to the snap points as the floor. Combined with `dismissible={false}`, this creates a persistent peek that the user can swipe up to expand.

---

## TopSheet

`TopSheet` is the top-of-screen counterpart to `BottomSheet`. It slides down from the top edge and supports the same snap-point system, detached mode, fullscreen morphing, and scroll handoff.

### TopSheet Props Reference

`TopSheet` accepts the same props as `BottomSheet` with these differences:

| Prop | Default | Notes |
|---|---|---|
| `bottomInset` | `0` | Limits the sheet's maximum downward extent (analogous to `topInset` on BottomSheet). |
| `contentTopInset` | `0` | Extra top inset added to the content container, on top of the safe-area inset. |
| `applyContentInset` | `true` | When true, adds **top** safe-area padding to the content container (BottomSheet adds bottom). |

All other props (`snapPoints`, `allowFullScreen`, `detached`, `detachedPadding`, `cornerRadius`, `fullScreenCornerRadius`, `dismissible`, `dragRegion`, `backdropOpacity`, `backdropPressBehavior`, `handleVisible`, `handleColor`, `sheetStyle`, `contentContainerStyle`, `style`, `onOpenChange`, `onDismiss`, `onSnapChange`, etc.) work identically.

### TopSheet Ref Methods

Same as BottomSheet: `present()`, `dismiss()`, `expand()`, `snapToIndex(index)`.

```tsx
const sheetRef = useRef<TopSheetRef>(null);

<TopSheet ref={sheetRef} ...>

sheetRef.current?.present();
sheetRef.current?.dismiss();
sheetRef.current?.expand();
sheetRef.current?.snapToIndex(1);
```

### TopSheet Scrollable Content

Use `TopSheetScrollView` for scrollable content inside a TopSheet, and `useTopSheetInsets` for safe-area padding.

```tsx
import { TopSheet, TopSheetScrollView, useTopSheetInsets } from "@0xbridges/sheet";

function SheetContent() {
  const insets = useTopSheetInsets();

  return (
    <TopSheetScrollView
      contentContainerStyle={{ paddingTop: insets.top + 10 }}
    >
      <LongContent />
    </TopSheetScrollView>
  );
}

<TopSheet
  snapPoints={["48%", "82%"]}
  allowFullScreen
  dragRegion="sheet"
  applyContentInset={false}
>
  <SheetContent />
</TopSheet>
```

### TopSheet Detached to Fullscreen

A detached TopSheet that morphs from a floating card to fullscreen:

```tsx
<TopSheet
  detached
  detachedPadding={{ horizontal: 12, top: 12 }}
  cornerRadius={56}
  fullScreenCornerRadius={0}
  allowFullScreen
  snapPoints={["42%"]}
>
  <CardContent />
</TopSheet>
```

When collapsed, the sheet is a rounded floating card at the top. Dragging the handle down expands it to fullscreen. Corner radius, margins, and shadow interpolate smoothly. The drag handle transitions from the bottom of the card to the top when fullscreen.

### TopSheet Embedded in a Page

A non-dismissible TopSheet can act as an embedded card that floats over scrollable page content:

```tsx
import { TopSheet } from "@0xbridges/sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";

export function PageWithEmbeddedSheet() {
  const { height: screenHeight } = useWindowDimensions();
  const safeArea = useSafeAreaInsets();
  const sheetHeight = screenHeight * 0.42 + safeArea.top + 12;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: sheetHeight + 16 }}>
        <PageContent />
      </ScrollView>

      <TopSheet
        allowFullScreen
        backdropOpacity={0}
        backdropPressBehavior="none"
        cornerRadius={56}
        defaultOpen
        detached
        detachedPadding={{ horizontal: 12, top: safeArea.top + 12 }}
        dismissible={false}
        dragRegion="sheet"
        fullScreenCornerRadius={0}
        open
        snapPoints={["42%"]}
      >
        <CardContent />
      </TopSheet>
    </View>
  );
}
```

The sheet floats at the top with no backdrop. Page content scrolls underneath it. Dragging the sheet expands it to fullscreen; from fullscreen it collapses back to the card (since `dismissible={false}` prevents full dismissal).

### TopSheet Anchor Snap Points

Works the same as BottomSheet anchors, using `TopSheetAnchor` and `createTopSheetAnchor`:

```tsx
import { TopSheet, TopSheetAnchor, createTopSheetAnchor } from "@0xbridges/sheet";

const headerAnchor = createTopSheetAnchor("header", { offset: 18 });

<TopSheet snapPoints={[headerAnchor]} allowFullScreen>
  <TopSheetAnchor name="header">
    <HeaderSection />
  </TopSheetAnchor>
  <DetailSection />
</TopSheet>
```

## Public Exports

The package exports:

**BottomSheet**

- `BottomSheet`
- `BottomSheetAnchor`
- `BottomSheetScrollView`
- `createBottomSheetAnchor`
- `useBottomSheetInsets`
- `BottomSheetAnchorPoint` (type)
- `BottomSheetAnchorProps` (type)
- `BottomSheetDetachedPadding` (type)
- `BottomSheetInsets` (type)
- `BottomSheetProps` (type)
- `BottomSheetRef` (type)
- `BottomSheetSnapPoint` (type)
- `BottomSheetScrollViewProps` (type)

**TopSheet**

- `TopSheet`
- `TopSheetAnchor`
- `TopSheetScrollView`
- `createTopSheetAnchor`
- `useTopSheetInsets`
- `TopSheetAnchorPoint` (type)
- `TopSheetAnchorProps` (type)
- `TopSheetDetachedPadding` (type)
- `TopSheetInsets` (type)
- `TopSheetProps` (type)
- `TopSheetRef` (type)
- `TopSheetSnapPoint` (type)
- `TopSheetScrollViewProps` (type)

## Performance Notes

The library is designed around performance first.

It does the following:

- keeps gesture math on the UI thread with Reanimated worklets
- uses spring animations with velocity projection for natural snapping
- measures anchor positions in an off-screen container to avoid layout thrashing
- debounces anchor registration to batch rapid layout changes
- structurally caches `snapPoints` and `collapsedHeight` so inline arrays (e.g. `snapPoints={["50%", "content"]}`) don't cascade re-renders on every parent render
- supports worklet `onScroll` handlers on the scroll view to skip the JS bridge during scroll

For best results:

- keep children stable across renders
- use `sheetStyle` for background color instead of wrapping in extra views
- prefer pixel or percentage snap points over anchors when the heights are known ahead of time
- set `applyContentInset={false}` when using `BottomSheetScrollView` and handle padding manually via `useBottomSheetInsets`

## Local Demo

The repo includes a working Expo demo app in `example/`.

It covers bottom sheet scenarios (dynamic content, fixed height, percentage snaps, anchor snaps, detached cards, detached-to-fullscreen morphing, non-dismissible sheets, collapsible peek, multi-stop workflow snaps, scrollable fullscreen) and top sheet scenarios (detached, detached-to-fullscreen, scrollable fullscreen, and an embedded page example).

From this package directory:

```bash
npm install
npm run example:install
npm run example:start
```
