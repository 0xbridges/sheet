import * as React from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  cancelAnimation,
  clamp,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: 32,
  mass: 0.92,
  overshootClamping: false,
  stiffness: 320,
} as const;

const CLOSE_SPRING_CONFIG = {
  ...SPRING_CONFIG,
  damping: 36,
  overshootClamping: true,
} as const;

const PRESENT_TIMING_CONFIG = {
  duration: 340,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
} as const;

const DEFAULT_HANDLE_AREA_HEIGHT = 28;
const DEFAULT_HANDLE_WIDTH = 42;
const DEFAULT_HANDLE_THICKNESS = 5;
const DEFAULT_CORNER_RADIUS = 28;
const DEFAULT_BACKDROP_OPACITY = 0.34;
const DEFAULT_BACKDROP_COLOR = "#000000";
const DEFAULT_DETACHED_EDGE = 12;
const ANCHOR_SETTLE_DELAY_MS = 48;

const DISMISS_VELOCITY = 1500;
const DISMISS_DISTANCE = 72;
const SNAP_PROJECTION_TIME = 0.18;
const SNAP_EPSILON = 1;
const RUBBER_BAND_FACTOR = 0.55;
const BACKDROP_MIN_VISIBILITY = 0.58;

type AnchorLayout = {
  height: number;
  y: number;
};

type BottomSheetInternalContextValue = {
  contentInsets: BottomSheetInsets;
  contentRootRef: React.RefObject<View | null>;
  registerAnchor: (name: string, layout: AnchorLayout) => void;
  scrollableOffsetY: SharedValue<number>;
  scrollableRegistered: SharedValue<boolean>;
  sheetHeight: SharedValue<number>;
  sheetMaxHeight: SharedValue<number>;
  sheetPanGesture: ReturnType<typeof Gesture.Pan>;
  unregisterAnchor: (name: string) => void;
};

const BottomSheetInternalContext =
  React.createContext<BottomSheetInternalContextValue | null>(null);

export type BottomSheetInsets = {
  bottom: number;
};

export type BottomSheetAnchorPoint = Readonly<{
  key: string;
  offset?: number;
  type: "anchor";
}>;

export type BottomSheetDetachedPadding =
  | number
  | Partial<{
      bottom: number;
      horizontal: number;
      left: number;
      right: number;
      top: number;
      vertical: number;
    }>;

export type BottomSheetSnapPoint =
  | number
  | `${number}%`
  | "content"
  | BottomSheetAnchorPoint;

export type BottomSheetRef = {
  dismiss: () => void;
  expand: () => void;
  present: () => void;
  snapToIndex: (index: number) => void;
};

export type BottomSheetProps = {
  backdropColor?: string;
  allowFullScreen?: boolean;
  applyContentInset?: boolean;
  backdropOpacity?: number;
  backdropPressBehavior?: "close" | "none";
  backdropStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  collapsedHeight?: BottomSheetSnapPoint;
  contentBottomInset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  cornerRadius?: number;
  defaultOpen?: boolean;
  detached?: boolean;
  detachedPadding?: BottomSheetDetachedPadding;
  dismissible?: boolean;
  dragRegion?: "handle" | "sheet";
  fullScreenCornerRadius?: number;
  handleColor?: string;
  handleStyle?: StyleProp<ViewStyle>;
  handleVisible?: boolean;
  initialSnapIndex?: number;
  onDismiss?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSnapChange?: (index: number, height: number) => void;
  open?: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
  snapPoints?: readonly BottomSheetSnapPoint[];
  style?: StyleProp<ViewStyle>;
  topInset?: number;
};

export type BottomSheetAnchorProps = ViewProps & {
  name: string;
};

export type BottomSheetScrollViewProps = Omit<ScrollViewProps, "onScroll"> & {
  /**
   * Called for every scroll event with the raw `NativeScrollEvent`.
   *
   * Pass a Reanimated worklet to handle scroll on the UI thread with zero
   * bridge overhead. Pass a regular JS function and it will be invoked via
   * `runOnJS` (one bridge crossing per event — only do this when you really
   * need it).
   */
  onScroll?: (event: NativeScrollEvent) => void;
};

type ResolvedDetachedPadding = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type AnimateOptions = {
  callDismiss?: boolean;
  callOpenChange?: boolean;
  force?: boolean;
};

type MeasureableView = View & {
  measureLayout: (
    relativeToNativeComponentRef: React.Component<any, any> | number,
    onSuccess: (left: number, top: number, width: number, height: number) => void,
    onFail?: () => void
  ) => void;
};

type AnimationTarget =
  | {
      type: "closed";
    }
  | {
      height: number;
      index: number;
      type: "index";
    };

function isAnchorSnapPoint(
  snapPoint: BottomSheetSnapPoint
): snapPoint is BottomSheetAnchorPoint {
  return typeof snapPoint === "object" && snapPoint.type === "anchor";
}

function clampIndex(index: number, maxIndex: number) {
  if (!Number.isFinite(index)) {
    return 0;
  }

  return Math.max(0, Math.min(maxIndex, Math.round(index)));
}

function uniqueHeights(values: readonly number[]) {
  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    const single = values[0];
    return single > 0 ? [single] : [];
  }

  const sorted = values.slice().sort((left, right) => left - right);
  const next: number[] = [];
  let previous = -Infinity;

  for (let index = 0; index < sorted.length; index += 1) {
    const value = sorted[index];

    if (value <= 0) {
      continue;
    }

    if (Math.abs(previous - value) > SNAP_EPSILON) {
      next.push(value);
      previous = value;
    }
  }

  return next;
}

function rubberBand(distance: number) {
  "worklet";

  if (distance <= 0) {
    return 0;
  }

  return (distance * RUBBER_BAND_FACTOR) / (1 + distance / 140);
}

function projectHeight(height: number, velocityY: number) {
  "worklet";

  return height - velocityY * SNAP_PROJECTION_TIME;
}

function normalizeDetachedPadding(
  value: BottomSheetDetachedPadding | undefined
): ResolvedDetachedPadding {
  if (typeof value === "number") {
    return {
      bottom: value,
      left: value,
      right: value,
      top: value,
    };
  }

  const horizontal = value?.horizontal ?? DEFAULT_DETACHED_EDGE;
  const vertical = value?.vertical ?? 0;

  return {
    bottom: value?.bottom ?? DEFAULT_DETACHED_EDGE + vertical,
    left: value?.left ?? horizontal,
    right: value?.right ?? horizontal,
    top: value?.top ?? vertical,
  };
}

function resolveSnapPoint(
  snapPoint: BottomSheetSnapPoint,
  availableHeight: number,
  contentHeight: number,
  anchors: ReadonlyMap<string, AnchorLayout>
) {
  if (snapPoint === "content") {
    return contentHeight;
  }

  if (typeof snapPoint === "number") {
    return snapPoint;
  }

  if (typeof snapPoint === "string") {
    if (snapPoint.endsWith("%")) {
      const ratio = Number.parseFloat(snapPoint.slice(0, -1));

      if (!Number.isFinite(ratio)) {
        return 0;
      }

      return (availableHeight * ratio) / 100;
    }

    return 0;
  }

  const anchorLayout = anchors.get(snapPoint.key);

  if (anchorLayout == null) {
    return 0;
  }

  return anchorLayout.y + anchorLayout.height + (snapPoint.offset ?? 0);
}

function buildSnapPoints(
  snapPoints: readonly BottomSheetSnapPoint[] | undefined,
  collapsedHeight: BottomSheetSnapPoint | undefined
) {
  const next =
    snapPoints != null && snapPoints.length > 0 ? [...snapPoints] : (["content"] as BottomSheetSnapPoint[]);

  if (collapsedHeight != null) {
    next.unshift(collapsedHeight);
  }

  return next;
}

function snapPointEqual(
  a: BottomSheetSnapPoint | undefined,
  b: BottomSheetSnapPoint | undefined
) {
  if (a === b) {
    return true;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  return (
    a.type === b.type &&
    a.key === b.key &&
    (a.offset ?? 0) === (b.offset ?? 0)
  );
}

function snapPointsArrayEqual(
  a: readonly BottomSheetSnapPoint[] | undefined,
  b: readonly BottomSheetSnapPoint[] | undefined
) {
  if (a === b) {
    return true;
  }

  if (a == null || b == null) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index += 1) {
    if (!snapPointEqual(a[index], b[index])) {
      return false;
    }
  }

  return true;
}

function useStableRequestedSnapPoints(
  snapPoints: readonly BottomSheetSnapPoint[] | undefined,
  collapsedHeight: BottomSheetSnapPoint | undefined
): BottomSheetSnapPoint[] {
  const cacheRef = React.useRef<{
    collapsedHeight: BottomSheetSnapPoint | undefined;
    result: BottomSheetSnapPoint[];
    snapPoints: readonly BottomSheetSnapPoint[] | undefined;
  } | null>(null);

  const cache = cacheRef.current;

  if (
    cache != null &&
    snapPointsArrayEqual(cache.snapPoints, snapPoints) &&
    snapPointEqual(cache.collapsedHeight, collapsedHeight)
  ) {
    return cache.result;
  }

  const result = buildSnapPoints(snapPoints, collapsedHeight);
  cacheRef.current = { collapsedHeight, result, snapPoints };
  return result;
}

function useLatestRef<T>(value: T) {
  const ref = React.useRef(value);
  React.useInsertionEffect(() => {
    if (ref.current !== value) {
      ref.current = value;
    }
  }, [value]);
  return ref;
}

function getNearestSnapIndex(height: number, snapHeights: readonly number[]) {
  "worklet";

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < snapHeights.length; index += 1) {
    const distance = Math.abs(height - snapHeights[index]);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function pickTargetSnap(
  currentHeight: number,
  velocityY: number,
  snapHeights: readonly number[],
  dismissible: boolean
) {
  "worklet";

  if (snapHeights.length === 0) {
    return -1;
  }

  const projectedHeight = projectHeight(currentHeight, velocityY);
  const floorHeight = snapHeights[0];
  const shouldDismiss =
    dismissible &&
    (projectedHeight < Math.max(floorHeight * 0.5, DISMISS_DISTANCE) ||
      (velocityY > DISMISS_VELOCITY && currentHeight <= floorHeight + 48));

  if (shouldDismiss) {
    return -1;
  }

  return getNearestSnapIndex(projectedHeight, snapHeights);
}

export function createBottomSheetAnchor(
  key: string,
  options?: {
    offset?: number;
  }
): BottomSheetAnchorPoint {
  return {
    key,
    offset: options?.offset,
    type: "anchor",
  };
}

export function useBottomSheetInsets() {
  return React.useContext(BottomSheetInternalContext)?.contentInsets ?? {
    bottom: 0,
  };
}

export function BottomSheetAnchor({
  name,
  onLayout,
  ...props
}: BottomSheetAnchorProps) {
  const context = React.useContext(BottomSheetInternalContext);
  const anchorRef = React.useRef<View | null>(null);
  const performMeasureRef = React.useRef<() => void>(() => {});
  const pendingFrameRef = React.useRef<number | null>(null);

  const cancelPendingMeasure = React.useCallback(() => {
    if (pendingFrameRef.current == null) {
      return;
    }

    cancelAnimationFrame(pendingFrameRef.current);
    pendingFrameRef.current = null;
  }, []);

  const scheduleMeasure = React.useCallback(() => {
    if (pendingFrameRef.current != null) {
      return;
    }

    pendingFrameRef.current = requestAnimationFrame(() => {
      pendingFrameRef.current = null;
      performMeasureRef.current();
    });
  }, []);

  const performMeasure = React.useCallback(() => {
    if (context == null) {
      return;
    }

    const anchorNode = anchorRef.current as MeasureableView | null;
    const contentRootNode = context.contentRootRef.current;

    if (anchorNode == null || contentRootNode == null) {
      scheduleMeasure();
      return;
    }

    anchorNode.measureLayout(
      contentRootNode,
      (_left, top, _width, height) => {
        context.registerAnchor(name, { height, y: top });
      },
      () => {
        scheduleMeasure();
      }
    );
  }, [context, name, scheduleMeasure]);

  performMeasureRef.current = performMeasure;

  const handleLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);

      if (context == null) {
        return;
      }

      scheduleMeasure();
    },
    [context, onLayout, scheduleMeasure]
  );

  React.useEffect(() => {
    return () => {
      cancelPendingMeasure();
      context?.unregisterAnchor(name);
    };
  }, [cancelPendingMeasure, context, name]);

  return <View {...props} onLayout={handleLayout} ref={anchorRef} />;
}

export function BottomSheetScrollView({
  alwaysBounceVertical = true,
  bounces = true,
  onScroll,
  scrollEnabled,
  scrollEventThrottle = 16,
  ...props
}: BottomSheetScrollViewProps) {
  const context = React.useContext(BottomSheetInternalContext);
  const onScrollRef = useLatestRef(onScroll);
  const [derivedScrollEnabled, setDerivedScrollEnabled] = React.useState(false);

  React.useEffect(() => {
    if (context == null) {
      return;
    }

    context.scrollableRegistered.value = true;

    return () => {
      context.scrollableRegistered.value = false;
      context.scrollableOffsetY.value = 0;
    };
  }, [context]);

  useAnimatedReaction(
    () => {
      if (context == null) {
        return false;
      }

      return (
        context.sheetMaxHeight.value > 0 &&
        context.sheetHeight.value >= context.sheetMaxHeight.value - SNAP_EPSILON
      );
    },
    (next, previous) => {
      if (next === previous) {
        return;
      }

      runOnJS(setDerivedScrollEnabled)(next);
    },
    [context]
  );
  const handleScroll = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        if (context != null) {
          context.scrollableOffsetY.value = Math.max(event.contentOffset.y, 0);
        }

        const callback = onScrollRef.current;

        if (callback == null) {
          return;
        }

        if ((callback as { __workletHash?: number }).__workletHash != null) {
          callback(event);
        } else {
          runOnJS(callback)(event);
        }
      },
    },
    [context, onScrollRef]
  );

  const fallbackOnScroll = React.useMemo(() => {
    if (onScroll == null) {
      return undefined;
    }

    return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll(event.nativeEvent);
    };
  }, [onScroll]);

  const effectiveScrollEnabled = scrollEnabled ?? derivedScrollEnabled;

  const sheetPanGesture = context?.sheetPanGesture;
  const nativeGesture = React.useMemo(
    () =>
      sheetPanGesture != null
        ? Gesture.Native().simultaneousWithExternalGesture(sheetPanGesture)
        : null,
    [sheetPanGesture]
  );

  if (context == null || nativeGesture == null) {
    return (
      <Animated.ScrollView
        {...props}
        alwaysBounceVertical={alwaysBounceVertical}
        bounces={bounces}
        onScroll={fallbackOnScroll}
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={scrollEventThrottle}
      />
    );
  }

  return (
    <GestureDetector gesture={nativeGesture}>
      <Animated.ScrollView
        {...props}
        alwaysBounceVertical={alwaysBounceVertical}
        bounces={bounces}
        onScroll={handleScroll}
        scrollEnabled={effectiveScrollEnabled}
        scrollEventThrottle={scrollEventThrottle}
      />
    </GestureDetector>
  );
}

export const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet(
    {
      allowFullScreen = false,
      applyContentInset = true,
      backdropColor = DEFAULT_BACKDROP_COLOR,
      backdropOpacity = DEFAULT_BACKDROP_OPACITY,
      backdropPressBehavior = "close",
      backdropStyle,
      children,
      collapsedHeight,
      contentBottomInset = 0,
      contentContainerStyle,
      cornerRadius = DEFAULT_CORNER_RADIUS,
      defaultOpen = true,
      detached = false,
      detachedPadding,
      dismissible = true,
      dragRegion = "sheet",
      fullScreenCornerRadius,
      handleColor = "rgba(255, 255, 255, 0.42)",
      handleStyle,
      handleVisible = true,
      initialSnapIndex = 0,
      onDismiss,
      onOpenChange,
      onSnapChange,
      open: controlledOpen,
      sheetStyle,
      snapPoints,
      style,
      topInset = 0,
    },
    ref
  ) {
    const isControlled = controlledOpen != null;
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const open = controlledOpen ?? uncontrolledOpen;
    const [isVisible, setIsVisible] = React.useState(open);
    const [settledIndex, setSettledIndex] = React.useState(-1);
    const [contentHeight, setContentHeight] = React.useState(0);
    const anchorsRef = React.useRef<Map<string, AnchorLayout>>(
      new Map()
    );
    const [anchorsVersion, setAnchorsVersion] = React.useState(0);
    const pendingAnchorBumpRef = React.useRef<number | null>(null);

    const dimensions = useWindowDimensions();
    const safeAreaInsets = useSafeAreaInsets();
    const latestOpenChange = useLatestRef(onOpenChange);
    const latestDismiss = useLatestRef(onDismiss);
    const latestSnapChange = useLatestRef(onSnapChange);
    const latestSettledIndex = useLatestRef(settledIndex);
    const contentRootRef = React.useRef<View | null>(null);
    const hasPresentedRef = React.useRef(false);
    const isMountedRef = React.useRef(true);
    const isVisibleRef = React.useRef(isVisible);
    const animationTargetRef = React.useRef<AnimationTarget | null>(null);
    const resolvedDetachedPadding = React.useMemo(
      () => normalizeDetachedPadding(detachedPadding),
      [detachedPadding]
    );

    const contentInsets = React.useMemo(
      () => ({
        bottom: contentBottomInset + safeAreaInsets.bottom,
      }),
      [contentBottomInset, safeAreaInsets.bottom]
    );

    const topBoundaryInset = allowFullScreen
      ? Math.max(topInset, safeAreaInsets.top)
      : topInset;
    const availableHeight = Math.max(dimensions.height - topBoundaryInset, 0);
    const requestedSnapPoints = useStableRequestedSnapPoints(
      snapPoints,
      collapsedHeight
    );
    const requestedAnchorKeys = React.useMemo(() => {
      const keys: string[] = [];

      for (let index = 0; index < requestedSnapPoints.length; index += 1) {
        const snapPoint = requestedSnapPoints[index];

        if (isAnchorSnapPoint(snapPoint)) {
          keys.push(snapPoint.key);
        }
      }

      return keys;
    }, [requestedSnapPoints]);
    const hasAnchorSnapPoints = requestedAnchorKeys.length > 0;
    const needsContentMeasurement = React.useMemo(
      () => requestedSnapPoints.some((snapPoint) => snapPoint === "content"),
      [requestedSnapPoints]
    );
    const [anchorsSettled, setAnchorsSettled] = React.useState(
      !hasAnchorSnapPoints
    );
    const initialAnchorSettleRef = React.useRef(!hasAnchorSnapPoints);
    const shouldDeferAnchorSnaps =
      hasAnchorSnapPoints && open && settledIndex < 0 && !anchorsSettled;

    React.useEffect(() => {
      if (!hasAnchorSnapPoints) {
        setAnchorsSettled(true);
        initialAnchorSettleRef.current = true;
        return;
      }

      if (initialAnchorSettleRef.current) {
        setAnchorsSettled(true);
        return;
      }

      const map = anchorsRef.current;
      const allAnchorsRegistered = requestedAnchorKeys.every((key) =>
        map.has(key)
      );

      if (!allAnchorsRegistered) {
        setAnchorsSettled(false);
        return;
      }

      setAnchorsSettled(false);
      const timeoutId = setTimeout(() => {
        initialAnchorSettleRef.current = true;
        setAnchorsSettled(true);
      }, ANCHOR_SETTLE_DELAY_MS);

      return () => {
        clearTimeout(timeoutId);
      };
    }, [anchorsVersion, hasAnchorSnapPoints, requestedAnchorKeys]);

    const resolvedSnapHeights = React.useMemo(() => {
      const anchors = anchorsRef.current;
      const next = requestedSnapPoints
        .map((snapPoint) => {
          if (shouldDeferAnchorSnaps && isAnchorSnapPoint(snapPoint)) {
            return 0;
          }

          return resolveSnapPoint(snapPoint, availableHeight, contentHeight, anchors);
        })
        .map((height) => clamp(height, 0, availableHeight));

      const hasResolvedRequestedSnap = next.some((height) => height > SNAP_EPSILON);

      if (allowFullScreen && hasResolvedRequestedSnap) {
        next.push(availableHeight);
      }

      const result = uniqueHeights(next);
      return result;
    }, [
      allowFullScreen,
      anchorsVersion,
      anchorsSettled,
      availableHeight,
      contentHeight,
      requestedSnapPoints,
      shouldDeferAnchorSnaps,
    ]);
    const initialIndex = React.useMemo(
      () => clampIndex(initialSnapIndex, Math.max(resolvedSnapHeights.length - 1, 0)),
      [initialSnapIndex, resolvedSnapHeights.length]
    );

    const currentHeight = useSharedValue(0);
    const dragStartHeight = useSharedValue(0);
    const snapHeights = useSharedValue<number[]>([]);
    const currentIndex = useSharedValue(-1);
    const isDragging = useSharedValue(false);
    const scrollableOffsetY = useSharedValue(0);
    const scrollableRegistered = useSharedValue(false);
    const scrollGestureCanCaptureSheet = useSharedValue(true);
    const sheetGestureOwnsTouch = useSharedValue(false);
    const interactiveMaxHeight = useDerivedValue(() => {
      const heights = snapHeights.value;
      return heights.length > 0 ? heights[heights.length - 1] : 0;
    });

    const fullscreenRadius =
      fullScreenCornerRadius ?? (detached ? 0 : cornerRadius);

    const lowestSnapHeight = resolvedSnapHeights[0] ?? 0;
    const highestSnapHeight =
      resolvedSnapHeights[resolvedSnapHeights.length - 1] ?? 0;

    React.useEffect(() => {
      isVisibleRef.current = isVisible;
    }, [isVisible]);

    const scheduleAnchorVersionBump = React.useCallback(() => {
      if (pendingAnchorBumpRef.current != null) {
        return;
      }

      pendingAnchorBumpRef.current = requestAnimationFrame(() => {
        pendingAnchorBumpRef.current = null;
        setAnchorsVersion((current) => current + 1);
      });
    }, []);

    const registerAnchor = React.useCallback(
      (name: string, layout: AnchorLayout) => {
        const map = anchorsRef.current;
        const previous = map.get(name);

        if (
          previous != null &&
          Math.abs(previous.y - layout.y) <= 0.5 &&
          Math.abs(previous.height - layout.height) <= 0.5
        ) {
          return;
        }

        if (
          previous != null &&
          previous.height > 0 &&
          layout.height <= 0
        ) {
          return;
        }

        map.set(name, layout);
        scheduleAnchorVersionBump();
      },
      [scheduleAnchorVersionBump]
    );

    const unregisterAnchor = React.useCallback(
      (name: string) => {
        if (initialAnchorSettleRef.current) {
          return;
        }

        const map = anchorsRef.current;

        if (!map.has(name)) {
          return;
        }

        map.delete(name);
        scheduleAnchorVersionBump();
      },
      [scheduleAnchorVersionBump]
    );

    const requestOpenChange = React.useCallback(
      (nextOpen: boolean) => {
        if (!isControlled) {
          setUncontrolledOpen(nextOpen);
        }

        latestOpenChange.current?.(nextOpen);
      },
      [isControlled, latestOpenChange]
    );

    const finalizeSnap = React.useCallback((index: number, height: number) => {
      if (!isMountedRef.current) {
        return;
      }

      animationTargetRef.current = {
        height,
        index,
        type: "index",
      };
      setSettledIndex(index);

      if (index >= 0) {
        latestSnapChange.current?.(index, height);
      }
    }, [latestSnapChange]);

    const finalizeDismiss = React.useCallback(
      (shouldCallDismiss: boolean, shouldCallOpenChange: boolean) => {
        if (!isMountedRef.current) {
          return;
        }

        animationTargetRef.current = {
          type: "closed",
        };
        setSettledIndex(-1);
        isVisibleRef.current = false;
        setIsVisible(false);
        hasPresentedRef.current = false;

        if (shouldCallOpenChange) {
          requestOpenChange(false);
        }

        if (shouldCallDismiss) {
          latestDismiss.current?.();
        }
      },
      [latestDismiss, requestOpenChange]
    );

    const markAnimationTargetClosed = React.useCallback(() => {
      animationTargetRef.current = {
        type: "closed",
      };
    }, []);

    const animateToIndex = React.useCallback(
      (index: number, options?: Pick<AnimateOptions, "force">) => {
        if (resolvedSnapHeights.length === 0) {
          return;
        }

        const nextIndex = clampIndex(index, resolvedSnapHeights.length - 1);
        const targetHeight = resolvedSnapHeights[nextIndex];
        const currentTarget = animationTargetRef.current;

        if (
          options?.force !== true &&
          currentTarget?.type === "index" &&
          currentTarget.index === nextIndex &&
          Math.abs(currentTarget.height - targetHeight) <= SNAP_EPSILON &&
          isVisibleRef.current
        ) {
          return;
        }

        animationTargetRef.current = {
          height: targetHeight,
          index: nextIndex,
          type: "index",
        };
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          setIsVisible(true);
        }
        const isFirstPresent = !hasPresentedRef.current;
        hasPresentedRef.current = true;
        currentIndex.value = nextIndex;

        if (isFirstPresent) {
          currentHeight.value = withTiming(targetHeight, PRESENT_TIMING_CONFIG, (finished) => {
            if (!finished) {
              return;
            }

            runOnJS(finalizeSnap)(nextIndex, targetHeight);
          });
        } else {
          currentHeight.value = withSpring(targetHeight, SPRING_CONFIG, (finished) => {
            if (!finished) {
              return;
            }

            runOnJS(finalizeSnap)(nextIndex, targetHeight);
          });
        }
      },
      [currentHeight, currentIndex, finalizeSnap, resolvedSnapHeights]
    );

    const animateToClosed = React.useCallback(
      ({
        callDismiss = true,
        callOpenChange = true,
        force = false,
      }: AnimateOptions = {}) => {
        if (!force && animationTargetRef.current?.type === "closed") {
          return;
        }

        animationTargetRef.current = {
          type: "closed",
        };
        cancelAnimation(currentHeight);
        currentIndex.value = -1;
        currentHeight.value = withSpring(0, CLOSE_SPRING_CONFIG, (finished) => {
          if (!finished) {
            return;
          }

          runOnJS(finalizeDismiss)(callDismiss, callOpenChange);
        });
      },
      [currentHeight, currentIndex, finalizeDismiss]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        dismiss: () => {
          animateToClosed();
        },
        expand: () => {
          if (resolvedSnapHeights.length === 0) {
            return;
          }

          animateToIndex(resolvedSnapHeights.length - 1);
        },
        present: () => {
          requestOpenChange(true);

          if (resolvedSnapHeights.length === 0) {
            return;
          }

          animateToIndex(initialIndex);
        },
        snapToIndex: (index: number) => {
          animateToIndex(index);
        },
      }),
      [animateToClosed, animateToIndex, initialIndex, requestOpenChange, resolvedSnapHeights.length]
    );

    React.useLayoutEffect(() => {
      snapHeights.value = resolvedSnapHeights;

      if (!open) {
        if (isVisibleRef.current) {
          animateToClosed({
            callDismiss: true,
            callOpenChange: false,
          });
        } else if (animationTargetRef.current?.type === "closed") {
          animationTargetRef.current = null;
        }

        return;
      }

      if (resolvedSnapHeights.length === 0) {
        return;
      }

      if (animationTargetRef.current?.type === "closed") {
        return;
      }

      const fallbackIndex =
        latestSettledIndex.current >= 0 ? latestSettledIndex.current : initialIndex;
      const targetIndex = clampIndex(
        fallbackIndex,
        resolvedSnapHeights.length - 1
      );

      animateToIndex(targetIndex, {
        force: !hasPresentedRef.current,
      });
    }, [
      animateToClosed,
      animateToIndex,
      initialIndex,
      latestSettledIndex,
      open,
      resolvedSnapHeights,
      snapHeights,
    ]);

    React.useEffect(() => {
      isMountedRef.current = true;

      return () => {
        isMountedRef.current = false;
        cancelAnimation(currentHeight);

        if (pendingAnchorBumpRef.current != null) {
          cancelAnimationFrame(pendingAnchorBumpRef.current);
          pendingAnchorBumpRef.current = null;
        }
      };
    }, [currentHeight]);

    const handleContentLayout = React.useCallback(
      (event: LayoutChangeEvent) => {
        if (!needsContentMeasurement) {
          return;
        }

        const nextHeight = event.nativeEvent.layout.height;

        setContentHeight((current) =>
          Math.abs(nextHeight - current) <= 0.5 ? current : nextHeight
        );
      },
      [needsContentMeasurement]
    );

    const panGesture = React.useMemo(() => {
      return Gesture.Pan()
        .activeOffsetY([-10, 10])
        .failOffsetX([-24, 24])
        .onBegin(() => {
          cancelAnimation(currentHeight);
          dragStartHeight.value = currentHeight.value;
          isDragging.value = true;
          sheetGestureOwnsTouch.value = false;
          scrollGestureCanCaptureSheet.value =
            !scrollableRegistered.value ||
            currentHeight.value < interactiveMaxHeight.value - SNAP_EPSILON ||
            scrollableOffsetY.value <= SNAP_EPSILON;
        })
        .onUpdate((event) => {
          const maxHeight = interactiveMaxHeight.value;
          const heights = snapHeights.value;

          if (heights.length === 0) {
            return;
          }

          const hasScrollable = scrollableRegistered.value;
          const shouldAllowScrollableCapture =
            !hasScrollable ||
            currentHeight.value < maxHeight - SNAP_EPSILON ||
            (scrollGestureCanCaptureSheet.value &&
              scrollableOffsetY.value <= SNAP_EPSILON &&
              event.translationY > 0);

          if (hasScrollable && !shouldAllowScrollableCapture) {
            return;
          }

          sheetGestureOwnsTouch.value = true;
          const floorHeight = heights[0];
          const nextHeight = dragStartHeight.value - event.translationY;

          if (nextHeight < floorHeight) {
            currentHeight.value = dismissible
              ? Math.max(0, nextHeight)
              : floorHeight - rubberBand(floorHeight - nextHeight);
            return;
          }

          if (nextHeight > maxHeight) {
            currentHeight.value = maxHeight + rubberBand(nextHeight - maxHeight);
            return;
          }

          currentHeight.value = nextHeight;
        })
        .onEnd((event) => {
          isDragging.value = false;

          if (!sheetGestureOwnsTouch.value) {
            return;
          }

          const heights = snapHeights.value;

          if (heights.length === 0) {
            return;
          }

          const targetIndex = pickTargetSnap(
            currentHeight.value,
            event.velocityY,
            heights,
            dismissible
          );

          if (targetIndex < 0) {
            runOnJS(markAnimationTargetClosed)();
            currentIndex.value = -1;
            currentHeight.value = withSpring(0, CLOSE_SPRING_CONFIG, (finished) => {
              if (!finished) {
                return;
              }

              runOnJS(finalizeDismiss)(true, true);
            });
            return;
          }

          currentIndex.value = targetIndex;
          const targetHeight = heights[targetIndex];
          currentHeight.value = withSpring(targetHeight, SPRING_CONFIG, (finished) => {
            if (!finished) {
              return;
            }

            runOnJS(finalizeSnap)(targetIndex, targetHeight);
          });
        })
        .onFinalize(() => {
          isDragging.value = false;
          sheetGestureOwnsTouch.value = false;
          scrollGestureCanCaptureSheet.value = true;
        });
    }, [
      currentHeight,
      currentIndex,
      dismissible,
      dragStartHeight,
      finalizeDismiss,
      finalizeSnap,
      interactiveMaxHeight,
      isDragging,
      markAnimationTargetClosed,
      sheetGestureOwnsTouch,
      scrollGestureCanCaptureSheet,
      scrollableOffsetY,
      scrollableRegistered,
      snapHeights,
    ]);

    const animatedBackdropStyle = useAnimatedStyle(() => {
      const maxHeight = highestSnapHeight;
      const floorHeight = lowestSnapHeight;
      let progress = 0;

      if (currentHeight.value > 0) {
        if (maxHeight <= floorHeight + SNAP_EPSILON) {
          progress = clamp(currentHeight.value / Math.max(maxHeight, 1), 0, 1);
        } else if (currentHeight.value <= floorHeight) {
          progress =
            clamp(currentHeight.value / Math.max(floorHeight, 1), 0, 1) *
            BACKDROP_MIN_VISIBILITY;
        } else {
          const range = Math.max(maxHeight - floorHeight, 1);
          const steppedProgress = clamp(
            (currentHeight.value - floorHeight) / range,
            0,
            1
          );

          progress =
            BACKDROP_MIN_VISIBILITY +
            steppedProgress * (1 - BACKDROP_MIN_VISIBILITY);
        }
      }

      return {
        opacity: backdropOpacity * progress,
      };
    }, [backdropOpacity, highestSnapHeight, lowestSnapHeight]);

    const useDetachedMargins = detached && allowFullScreen;
    const isDetached = detached;
    const radiusDelta = cornerRadius - fullscreenRadius;
    const detachedBottom = resolvedDetachedPadding.bottom;
    const detachedLeft = resolvedDetachedPadding.left;
    const detachedRight = resolvedDetachedPadding.right;
    const detachedTop = resolvedDetachedPadding.top;

    const animatedSheetStyle = useAnimatedStyle(() => {
      const maxHeight = highestSnapHeight;
      const minHeight = lowestSnapHeight;
      const morphRange = Math.max(maxHeight - minHeight, 1);
      const morphProgress = useDetachedMargins
        ? clamp((currentHeight.value - minHeight) / morphRange, 0, 1)
        : 0;
      const marginScale = useDetachedMargins
        ? 1 - morphProgress
        : isDetached
          ? 1
          : 0;
      const radius = cornerRadius - radiusDelta * morphProgress;
      const detachedRadius = isDetached ? radius : 0;
      const heightDelta = !dismissible
        ? minHeight - currentHeight.value
        : 0;

      return {
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        borderBottomLeftRadius: detachedRadius,
        borderBottomRightRadius: detachedRadius,
        height: currentHeight.value,
        marginBottom: detachedBottom * marginScale,
        marginLeft: detachedLeft * marginScale,
        marginRight: detachedRight * marginScale,
        marginTop: detachedTop * marginScale,
        shadowOpacity: 0.24 - 0.12 * morphProgress,
        transform: [
          {
            translateY: heightDelta > 0 ? -heightDelta * 0.08 : 0,
          },
        ],
      };
    }, [
      cornerRadius,
      detachedBottom,
      detachedLeft,
      detachedRight,
      detachedTop,
      dismissible,
      highestSnapHeight,
      isDetached,
      lowestSnapHeight,
      radiusDelta,
      useDetachedMargins,
    ]);

    const contextValue = React.useMemo<BottomSheetInternalContextValue>(
      () => ({
        contentInsets,
        contentRootRef,
        registerAnchor,
        scrollableOffsetY,
        scrollableRegistered,
        sheetHeight: currentHeight,
        sheetMaxHeight: interactiveMaxHeight,
        sheetPanGesture: panGesture,
        unregisterAnchor,
      }),
      [
        contentInsets,
        currentHeight,
        interactiveMaxHeight,
        panGesture,
        registerAnchor,
        scrollableOffsetY,
        scrollableRegistered,
        unregisterAnchor,
      ]
    );

    const needsAnchorMeasurement =
      hasAnchorSnapPoints && open && resolvedSnapHeights.length === 0;
    const shouldRenderMeasurement =
      needsContentMeasurement && open && contentHeight === 0;
    const shouldRenderSheet = isVisible && !needsAnchorMeasurement;

    const backdropPressEnabled =
      dismissible && backdropPressBehavior === "close";
    const handleBackdropPress = React.useCallback(() => {
      if (!backdropPressEnabled) {
        return;
      }

      animateToClosed();
    }, [animateToClosed, backdropPressEnabled]);
    const backdropBaseStyle = React.useMemo(
      () => [
        StyleSheet.absoluteFillObject,
        { backgroundColor: backdropColor },
      ],
      [backdropColor]
    );
    const backdropPointerEvents =
      isVisible && backdropPressBehavior === "close" ? "auto" : "none";

    const handleIndicatorStyle = React.useMemo(
      () => [styles.handleIndicator, { backgroundColor: handleColor }],
      [handleColor]
    );

    if (!shouldRenderMeasurement && !shouldRenderSheet && !needsAnchorMeasurement) {
      return null;
    }

    const handle = dragRegion === "handle" ? (
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.handleArea,
            !handleVisible && styles.hiddenHandleArea,
            handleStyle,
          ]}
        >
          {handleVisible ? <View style={handleIndicatorStyle} /> : null}
        </Animated.View>
      </GestureDetector>
    ) : (
      <Animated.View
        style={[
          styles.handleArea,
          !handleVisible && styles.hiddenHandleArea,
          handleStyle,
        ]}
      >
        {handleVisible ? <View style={handleIndicatorStyle} /> : null}
      </Animated.View>
    );

    const content = (
      <Animated.View
        pointerEvents="auto"
        style={[
          styles.sheet,
          animatedSheetStyle,
          sheetStyle,
        ]}
      >
        {handle}
        <BottomSheetInternalContext.Provider value={contextValue}>
          <View
            onLayout={needsContentMeasurement ? undefined : handleContentLayout}
            ref={contentRootRef}
            style={[
              styles.content,
              applyContentInset
                ? {
                    paddingBottom: contentInsets.bottom,
                  }
                : null,
              contentContainerStyle,
            ]}
          >
            {children}
          </View>
        </BottomSheetInternalContext.Provider>
      </Animated.View>
    );

    const measurementContent = shouldRenderMeasurement ? (
      <View pointerEvents="none" style={styles.measurementRoot}>
        <BottomSheetInternalContext.Provider value={contextValue}>
          <View
            style={[
              styles.measurementSheet,
              detached
                ? {
                    marginLeft: resolvedDetachedPadding.left,
                    marginRight: resolvedDetachedPadding.right,
                  }
                : null,
            ]}
          >
            <View
              onLayout={handleContentLayout}
              style={[
                styles.content,
                applyContentInset
                  ? {
                      paddingBottom: contentInsets.bottom,
                    }
                  : null,
                contentContainerStyle,
              ]}
            >
              {children}
            </View>
          </View>
        </BottomSheetInternalContext.Provider>
      </View>
    ) : null;

    const anchorMeasurementContent = needsAnchorMeasurement ? (
      <View pointerEvents="none" style={styles.measurementRoot}>
        <BottomSheetInternalContext.Provider value={contextValue}>
          <View
            style={[
              styles.measurementSheet,
              detached
                ? {
                    marginLeft: resolvedDetachedPadding.left,
                    marginRight: resolvedDetachedPadding.right,
                  }
                : null,
            ]}
          >
            <View
              ref={contentRootRef}
              style={[
                styles.content,
                applyContentInset
                  ? {
                      paddingBottom: contentInsets.bottom,
                    }
                  : null,
                contentContainerStyle,
              ]}
            >
              {children}
            </View>
          </View>
        </BottomSheetInternalContext.Provider>
      </View>
    ) : null;

    return (
      <View pointerEvents="box-none" style={[styles.root, style]}>
        {measurementContent}
        {anchorMeasurementContent}
        <AnimatedPressable
          onPress={handleBackdropPress}
          pointerEvents={backdropPointerEvents}
          style={[backdropBaseStyle, animatedBackdropStyle, backdropStyle]}
        />
        {shouldRenderSheet
          ? dragRegion === "sheet"
            ? <GestureDetector gesture={panGesture}>{content}</GestureDetector>
            : content
          : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    flexShrink: 1,
    gap: 0,
  },
  handleArea: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: DEFAULT_HANDLE_AREA_HEIGHT,
  },
  handleIndicator: {
    borderRadius: DEFAULT_HANDLE_THICKNESS,
    height: DEFAULT_HANDLE_THICKNESS,
    width: DEFAULT_HANDLE_WIDTH,
  },
  hiddenHandleArea: {
    minHeight: 8,
  },
  measurementRoot: {
    left: 0,
    opacity: 0,
    pointerEvents: "none",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: -1,
  },
  measurementSheet: {
    overflow: "hidden",
  },
  root: {
    bottom: 0,
    justifyContent: "flex-end",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: "#101317",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      height: -10,
      width: 0,
    },
    shadowRadius: 24,
  },
});
