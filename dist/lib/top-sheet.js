"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopSheet = void 0;
exports.createTopSheetAnchor = createTopSheetAnchor;
exports.useTopSheetInsets = useTopSheetInsets;
exports.TopSheetAnchor = TopSheetAnchor;
exports.TopSheetScrollView = TopSheetScrollView;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const AnimatedPressable = react_native_reanimated_1.default.createAnimatedComponent(react_native_1.Pressable);
const SPRING_CONFIG = {
    damping: 32,
    mass: 0.92,
    overshootClamping: false,
    stiffness: 320,
};
const CLOSE_SPRING_CONFIG = {
    ...SPRING_CONFIG,
    damping: 36,
    overshootClamping: true,
};
const PRESENT_TIMING_CONFIG = {
    duration: 340,
    easing: react_native_reanimated_1.Easing.bezier(0.32, 0.72, 0, 1),
};
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
const TopSheetInternalContext = React.createContext(null);
function isAnchorSnapPoint(snapPoint) {
    return typeof snapPoint === "object" && snapPoint.type === "anchor";
}
function clampIndex(index, maxIndex) {
    if (!Number.isFinite(index)) {
        return 0;
    }
    return Math.max(0, Math.min(maxIndex, Math.round(index)));
}
function uniqueHeights(values) {
    if (values.length === 0) {
        return [];
    }
    if (values.length === 1) {
        const single = values[0];
        return single > 0 ? [single] : [];
    }
    const sorted = values.slice().sort((left, right) => left - right);
    const next = [];
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
function rubberBand(distance) {
    "worklet";
    if (distance <= 0) {
        return 0;
    }
    return (distance * RUBBER_BAND_FACTOR) / (1 + distance / 140);
}
function normalizeDetachedPadding(value) {
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
        bottom: value?.bottom ?? vertical,
        left: value?.left ?? horizontal,
        right: value?.right ?? horizontal,
        top: value?.top ?? DEFAULT_DETACHED_EDGE + vertical,
    };
}
function resolveSnapPoint(snapPoint, availableHeight, contentHeight, anchors) {
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
function buildSnapPoints(snapPoints, collapsedHeight) {
    const next = snapPoints != null && snapPoints.length > 0 ? [...snapPoints] : ["content"];
    if (collapsedHeight != null) {
        next.unshift(collapsedHeight);
    }
    return next;
}
function snapPointEqual(a, b) {
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
    return (a.type === b.type &&
        a.key === b.key &&
        (a.offset ?? 0) === (b.offset ?? 0));
}
function snapPointsArrayEqual(a, b) {
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
function useStableRequestedSnapPoints(snapPoints, collapsedHeight) {
    const cacheRef = React.useRef(null);
    const cache = cacheRef.current;
    if (cache != null &&
        snapPointsArrayEqual(cache.snapPoints, snapPoints) &&
        snapPointEqual(cache.collapsedHeight, collapsedHeight)) {
        return cache.result;
    }
    const result = buildSnapPoints(snapPoints, collapsedHeight);
    cacheRef.current = { collapsedHeight, result, snapPoints };
    return result;
}
function useLatestRef(value) {
    const ref = React.useRef(value);
    React.useInsertionEffect(() => {
        if (ref.current !== value) {
            ref.current = value;
        }
    }, [value]);
    return ref;
}
function getNearestSnapIndex(height, snapHeights) {
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
function createTopSheetAnchor(key, options) {
    return {
        key,
        offset: options?.offset,
        type: "anchor",
    };
}
function useTopSheetInsets() {
    return React.useContext(TopSheetInternalContext)?.contentInsets ?? {
        top: 0,
    };
}
function TopSheetAnchor({ name, onLayout, ...props }) {
    const context = React.useContext(TopSheetInternalContext);
    const anchorRef = React.useRef(null);
    const performMeasureRef = React.useRef(() => { });
    const pendingFrameRef = React.useRef(null);
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
        const anchorNode = anchorRef.current;
        const contentRootNode = context.contentRootRef.current;
        if (anchorNode == null || contentRootNode == null) {
            scheduleMeasure();
            return;
        }
        anchorNode.measureLayout(contentRootNode, (_left, top, _width, height) => {
            context.registerAnchor(name, { height, y: top });
        }, () => {
            scheduleMeasure();
        });
    }, [context, name, scheduleMeasure]);
    performMeasureRef.current = performMeasure;
    const handleLayout = React.useCallback((event) => {
        onLayout?.(event);
        if (context == null) {
            return;
        }
        scheduleMeasure();
    }, [context, onLayout, scheduleMeasure]);
    React.useEffect(() => {
        return () => {
            cancelPendingMeasure();
            context?.unregisterAnchor(name);
        };
    }, [cancelPendingMeasure, context, name]);
    return (0, jsx_runtime_1.jsx)(react_native_1.View, { ...props, onLayout: handleLayout, ref: anchorRef });
}
function TopSheetScrollView({ alwaysBounceVertical = true, bounces = true, onScroll, scrollEnabled, scrollEventThrottle = 16, ...props }) {
    const context = React.useContext(TopSheetInternalContext);
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
    (0, react_native_reanimated_1.useAnimatedReaction)(() => {
        if (context == null) {
            return false;
        }
        return (context.sheetMaxHeight.value > 0 &&
            context.sheetHeight.value >= context.sheetMaxHeight.value - SNAP_EPSILON);
    }, (next, previous) => {
        if (next === previous) {
            return;
        }
        (0, react_native_reanimated_1.runOnJS)(setDerivedScrollEnabled)(next);
    }, [context]);
    const handleScroll = (0, react_native_reanimated_1.useAnimatedScrollHandler)({
        onScroll: (event) => {
            if (context != null) {
                context.scrollableOffsetY.value = Math.max(event.contentOffset.y, 0);
            }
            const callback = onScrollRef.current;
            if (callback == null) {
                return;
            }
            if (callback.__workletHash != null) {
                callback(event);
            }
            else {
                (0, react_native_reanimated_1.runOnJS)(callback)(event);
            }
        },
    }, [context, onScrollRef]);
    const fallbackOnScroll = React.useMemo(() => {
        if (onScroll == null) {
            return undefined;
        }
        return (event) => {
            onScroll(event.nativeEvent);
        };
    }, [onScroll]);
    const effectiveScrollEnabled = scrollEnabled ?? derivedScrollEnabled;
    const sheetPanGesture = context?.sheetPanGesture;
    const nativeGesture = React.useMemo(() => sheetPanGesture != null
        ? react_native_gesture_handler_1.Gesture.Native().simultaneousWithExternalGesture(sheetPanGesture)
        : null, [sheetPanGesture]);
    if (context == null || nativeGesture == null) {
        return ((0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.ScrollView, { ...props, alwaysBounceVertical: alwaysBounceVertical, bounces: bounces, onScroll: fallbackOnScroll, scrollEnabled: scrollEnabled, scrollEventThrottle: scrollEventThrottle }));
    }
    return ((0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: nativeGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.ScrollView, { ...props, alwaysBounceVertical: alwaysBounceVertical, bounces: bounces, onScroll: handleScroll, scrollEnabled: effectiveScrollEnabled, scrollEventThrottle: scrollEventThrottle }) }));
}
exports.TopSheet = React.forwardRef(function TopSheet({ allowFullScreen = false, applyContentInset = true, backdropColor = DEFAULT_BACKDROP_COLOR, backdropOpacity = DEFAULT_BACKDROP_OPACITY, backdropPressBehavior = "close", backdropStyle, bottomInset = 0, children, collapsedHeight, contentContainerStyle, contentTopInset = 0, cornerRadius = DEFAULT_CORNER_RADIUS, defaultOpen = true, detached = false, detachedPadding, dismissible = true, dragRegion = "sheet", fullScreenCornerRadius, handleColor = "rgba(255, 255, 255, 0.42)", handleStyle, handleVisible = true, initialSnapIndex = 0, onDismiss, onOpenChange, onSnapChange, open: controlledOpen, sheetStyle, snapPoints, style, }, ref) {
    const isControlled = controlledOpen != null;
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const open = controlledOpen ?? uncontrolledOpen;
    const [isVisible, setIsVisible] = React.useState(open);
    const [settledIndex, setSettledIndex] = React.useState(-1);
    const [contentHeight, setContentHeight] = React.useState(0);
    const anchorsRef = React.useRef(new Map());
    const [anchorsVersion, setAnchorsVersion] = React.useState(0);
    const pendingAnchorBumpRef = React.useRef(null);
    const dimensions = (0, react_native_1.useWindowDimensions)();
    const safeAreaInsets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const latestOpenChange = useLatestRef(onOpenChange);
    const latestDismiss = useLatestRef(onDismiss);
    const latestSnapChange = useLatestRef(onSnapChange);
    const latestSettledIndex = useLatestRef(settledIndex);
    const contentRootRef = React.useRef(null);
    const hasPresentedRef = React.useRef(false);
    const isMountedRef = React.useRef(true);
    const isVisibleRef = React.useRef(isVisible);
    const animationTargetRef = React.useRef(null);
    const resolvedDetachedPadding = React.useMemo(() => normalizeDetachedPadding(detachedPadding), [detachedPadding]);
    const contentInsets = React.useMemo(() => ({
        top: contentTopInset + safeAreaInsets.top,
    }), [contentTopInset, safeAreaInsets.top]);
    const availableHeight = allowFullScreen
        ? dimensions.height
        : Math.max(dimensions.height - bottomInset, 0);
    const requestedSnapPoints = useStableRequestedSnapPoints(snapPoints, collapsedHeight);
    const requestedAnchorKeys = React.useMemo(() => {
        const keys = [];
        for (let index = 0; index < requestedSnapPoints.length; index += 1) {
            const snapPoint = requestedSnapPoints[index];
            if (isAnchorSnapPoint(snapPoint)) {
                keys.push(snapPoint.key);
            }
        }
        return keys;
    }, [requestedSnapPoints]);
    const hasAnchorSnapPoints = requestedAnchorKeys.length > 0;
    const needsContentMeasurement = React.useMemo(() => requestedSnapPoints.some((snapPoint) => snapPoint === "content"), [requestedSnapPoints]);
    const [anchorsSettled, setAnchorsSettled] = React.useState(!hasAnchorSnapPoints);
    const initialAnchorSettleRef = React.useRef(!hasAnchorSnapPoints);
    const shouldDeferAnchorSnaps = hasAnchorSnapPoints && open && settledIndex < 0 && !anchorsSettled;
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
        const allAnchorsRegistered = requestedAnchorKeys.every((key) => map.has(key));
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
            .map((height) => (0, react_native_reanimated_1.clamp)(height, 0, availableHeight));
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
    const initialIndex = React.useMemo(() => clampIndex(initialSnapIndex, Math.max(resolvedSnapHeights.length - 1, 0)), [initialSnapIndex, resolvedSnapHeights.length]);
    const currentHeight = (0, react_native_reanimated_1.useSharedValue)(0);
    const dismissOffset = (0, react_native_reanimated_1.useSharedValue)(0);
    const dragStartHeight = (0, react_native_reanimated_1.useSharedValue)(0);
    const dragStartDismissOffset = (0, react_native_reanimated_1.useSharedValue)(0);
    const snapHeights = (0, react_native_reanimated_1.useSharedValue)([]);
    const currentIndex = (0, react_native_reanimated_1.useSharedValue)(-1);
    const isDragging = (0, react_native_reanimated_1.useSharedValue)(false);
    const isSlideMode = (0, react_native_reanimated_1.useSharedValue)(false);
    const scrollableOffsetY = (0, react_native_reanimated_1.useSharedValue)(0);
    const scrollableRegistered = (0, react_native_reanimated_1.useSharedValue)(false);
    const scrollGestureCanCaptureSheet = (0, react_native_reanimated_1.useSharedValue)(true);
    const sheetGestureOwnsTouch = (0, react_native_reanimated_1.useSharedValue)(false);
    const interactiveMaxHeight = (0, react_native_reanimated_1.useDerivedValue)(() => {
        const heights = snapHeights.value;
        return heights.length > 0 ? heights[heights.length - 1] : 0;
    });
    const fullscreenRadius = fullScreenCornerRadius ?? (detached ? 0 : cornerRadius);
    const lowestSnapHeight = resolvedSnapHeights[0] ?? 0;
    const highestSnapHeight = resolvedSnapHeights[resolvedSnapHeights.length - 1] ?? 0;
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
    const registerAnchor = React.useCallback((name, layout) => {
        const map = anchorsRef.current;
        const previous = map.get(name);
        if (previous != null &&
            Math.abs(previous.y - layout.y) <= 0.5 &&
            Math.abs(previous.height - layout.height) <= 0.5) {
            return;
        }
        if (previous != null &&
            previous.height > 0 &&
            layout.height <= 0) {
            return;
        }
        map.set(name, layout);
        scheduleAnchorVersionBump();
    }, [scheduleAnchorVersionBump]);
    const unregisterAnchor = React.useCallback((name) => {
        if (initialAnchorSettleRef.current) {
            return;
        }
        const map = anchorsRef.current;
        if (!map.has(name)) {
            return;
        }
        map.delete(name);
        scheduleAnchorVersionBump();
    }, [scheduleAnchorVersionBump]);
    const requestOpenChange = React.useCallback((nextOpen) => {
        if (!isControlled) {
            setUncontrolledOpen(nextOpen);
        }
        latestOpenChange.current?.(nextOpen);
    }, [isControlled, latestOpenChange]);
    const finalizeSnap = React.useCallback((index, height) => {
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
    const finalizeDismiss = React.useCallback((shouldCallDismiss, shouldCallOpenChange) => {
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
    }, [latestDismiss, requestOpenChange]);
    const finalizeSlideOffDismiss = React.useCallback(() => {
        if (!isMountedRef.current) {
            return;
        }
        currentHeight.value = 0;
        dismissOffset.value = 0;
        finalizeDismiss(true, true);
    }, [currentHeight, dismissOffset, finalizeDismiss]);
    const markAnimationTargetClosed = React.useCallback(() => {
        animationTargetRef.current = {
            type: "closed",
        };
    }, []);
    const animateToIndex = React.useCallback((index, options) => {
        if (resolvedSnapHeights.length === 0) {
            return;
        }
        const nextIndex = clampIndex(index, resolvedSnapHeights.length - 1);
        const targetHeight = resolvedSnapHeights[nextIndex];
        const currentTarget = animationTargetRef.current;
        if (options?.force !== true &&
            currentTarget?.type === "index" &&
            currentTarget.index === nextIndex &&
            Math.abs(currentTarget.height - targetHeight) <= SNAP_EPSILON &&
            isVisibleRef.current) {
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
            dismissOffset.value = (0, react_native_reanimated_1.withTiming)(0, PRESENT_TIMING_CONFIG);
            currentHeight.value = (0, react_native_reanimated_1.withTiming)(targetHeight, PRESENT_TIMING_CONFIG, (finished) => {
                if (!finished) {
                    return;
                }
                (0, react_native_reanimated_1.runOnJS)(finalizeSnap)(nextIndex, targetHeight);
            });
        }
        else {
            dismissOffset.value = (0, react_native_reanimated_1.withSpring)(0, SPRING_CONFIG);
            currentHeight.value = (0, react_native_reanimated_1.withSpring)(targetHeight, SPRING_CONFIG, (finished) => {
                if (!finished) {
                    return;
                }
                (0, react_native_reanimated_1.runOnJS)(finalizeSnap)(nextIndex, targetHeight);
            });
        }
    }, [currentHeight, currentIndex, dismissOffset, finalizeSnap, resolvedSnapHeights]);
    const animateToClosed = React.useCallback(({ callDismiss = true, callOpenChange = true, force = false, } = {}) => {
        if (!force && animationTargetRef.current?.type === "closed") {
            return;
        }
        animationTargetRef.current = {
            type: "closed",
        };
        (0, react_native_reanimated_1.cancelAnimation)(currentHeight);
        (0, react_native_reanimated_1.cancelAnimation)(dismissOffset);
        dismissOffset.value = 0;
        currentIndex.value = -1;
        currentHeight.value = (0, react_native_reanimated_1.withSpring)(0, CLOSE_SPRING_CONFIG, (finished) => {
            if (!finished) {
                return;
            }
            (0, react_native_reanimated_1.runOnJS)(finalizeDismiss)(callDismiss, callOpenChange);
        });
    }, [currentHeight, currentIndex, dismissOffset, finalizeDismiss]);
    React.useImperativeHandle(ref, () => ({
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
        snapToIndex: (index) => {
            animateToIndex(index);
        },
    }), [animateToClosed, animateToIndex, initialIndex, requestOpenChange, resolvedSnapHeights.length]);
    React.useLayoutEffect(() => {
        snapHeights.value = resolvedSnapHeights;
        if (!open) {
            if (isVisibleRef.current) {
                animateToClosed({
                    callDismiss: true,
                    callOpenChange: false,
                });
            }
            else if (animationTargetRef.current?.type === "closed") {
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
        const fallbackIndex = latestSettledIndex.current >= 0 ? latestSettledIndex.current : initialIndex;
        const targetIndex = clampIndex(fallbackIndex, resolvedSnapHeights.length - 1);
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
            (0, react_native_reanimated_1.cancelAnimation)(currentHeight);
            (0, react_native_reanimated_1.cancelAnimation)(dismissOffset);
            if (pendingAnchorBumpRef.current != null) {
                cancelAnimationFrame(pendingAnchorBumpRef.current);
                pendingAnchorBumpRef.current = null;
            }
        };
    }, [currentHeight, dismissOffset]);
    const handleContentLayout = React.useCallback((event) => {
        if (!needsContentMeasurement) {
            return;
        }
        const nextHeight = event.nativeEvent.layout.height;
        setContentHeight((current) => Math.abs(nextHeight - current) <= 0.5 ? current : nextHeight);
    }, [needsContentMeasurement]);
    const panGesture = React.useMemo(() => {
        return react_native_gesture_handler_1.Gesture.Pan()
            .activeOffsetY([-10, 10])
            .failOffsetX([-24, 24])
            .onBegin(() => {
            (0, react_native_reanimated_1.cancelAnimation)(currentHeight);
            (0, react_native_reanimated_1.cancelAnimation)(dismissOffset);
            dragStartHeight.value = currentHeight.value;
            dragStartDismissOffset.value = dismissOffset.value;
            isDragging.value = true;
            sheetGestureOwnsTouch.value = false;
            // At fullscreen, use slide mode: translateY-based dismiss
            isSlideMode.value =
                allowFullScreen &&
                    currentHeight.value >= interactiveMaxHeight.value - SNAP_EPSILON;
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
            if (isSlideMode.value) {
                // Fullscreen slide mode: drag down slides the sheet down (like bottom sheet dismiss)
                const shouldAllowScrollableCapture = !hasScrollable ||
                    (scrollGestureCanCaptureSheet.value &&
                        scrollableOffsetY.value <= SNAP_EPSILON &&
                        event.translationY > 0);
                if (hasScrollable && !shouldAllowScrollableCapture) {
                    return;
                }
                sheetGestureOwnsTouch.value = true;
                const nextOffset = dragStartDismissOffset.value + event.translationY;
                if (nextOffset < 0) {
                    dismissOffset.value = -rubberBand(-nextOffset);
                    return;
                }
                if (!dismissible && nextOffset > 0) {
                    dismissOffset.value = rubberBand(nextOffset);
                    return;
                }
                dismissOffset.value = nextOffset;
            }
            else {
                // Expand mode: drag down increases height (top sheet grows downward)
                const shouldAllowScrollableCapture = !hasScrollable ||
                    currentHeight.value < maxHeight - SNAP_EPSILON ||
                    (scrollGestureCanCaptureSheet.value &&
                        scrollableOffsetY.value <= SNAP_EPSILON &&
                        event.translationY < 0);
                if (hasScrollable && !shouldAllowScrollableCapture) {
                    return;
                }
                sheetGestureOwnsTouch.value = true;
                const floorHeight = heights[0];
                const nextHeight = dragStartHeight.value + event.translationY;
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
            }
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
            if (isSlideMode.value) {
                // Slide mode: either dismiss fully or snap back to fullscreen
                const maxHeight = interactiveMaxHeight.value;
                const projectedOffset = dismissOffset.value + event.velocityY * SNAP_PROJECTION_TIME;
                const shouldDismiss = dismissible &&
                    (projectedOffset > maxHeight * 0.5 ||
                        event.velocityY > DISMISS_VELOCITY);
                if (shouldDismiss) {
                    (0, react_native_reanimated_1.runOnJS)(markAnimationTargetClosed)();
                    currentIndex.value = -1;
                    dismissOffset.value = (0, react_native_reanimated_1.withSpring)(maxHeight, CLOSE_SPRING_CONFIG, (finished) => {
                        if (!finished) {
                            return;
                        }
                        (0, react_native_reanimated_1.runOnJS)(finalizeSlideOffDismiss)();
                    });
                    return;
                }
                if (!dismissible && heights.length > 1) {
                    const shouldCollapse = projectedOffset > maxHeight * 0.3 ||
                        event.velocityY > DISMISS_VELOCITY;
                    if (shouldCollapse) {
                        const targetIndex = 0;
                        const targetHeight = heights[0];
                        currentIndex.value = targetIndex;
                        dismissOffset.value = (0, react_native_reanimated_1.withSpring)(0, SPRING_CONFIG);
                        currentHeight.value = (0, react_native_reanimated_1.withSpring)(targetHeight, SPRING_CONFIG, (finished) => {
                            if (!finished) {
                                return;
                            }
                            (0, react_native_reanimated_1.runOnJS)(finalizeSnap)(targetIndex, targetHeight);
                        });
                        return;
                    }
                }
                // Not enough to dismiss/collapse: snap back to fullscreen
                dismissOffset.value = (0, react_native_reanimated_1.withSpring)(0, SPRING_CONFIG);
            }
            else {
                // Expand mode: project height via top-sheet physics
                const projectedHeight = currentHeight.value + event.velocityY * SNAP_PROJECTION_TIME;
                const floorHeight = heights[0];
                const shouldDismiss = dismissible &&
                    (projectedHeight < Math.max(floorHeight * 0.5, DISMISS_DISTANCE) ||
                        (-event.velocityY > DISMISS_VELOCITY &&
                            currentHeight.value <= floorHeight + 48));
                if (shouldDismiss) {
                    (0, react_native_reanimated_1.runOnJS)(markAnimationTargetClosed)();
                    currentIndex.value = -1;
                    currentHeight.value = (0, react_native_reanimated_1.withSpring)(0, CLOSE_SPRING_CONFIG, (finished) => {
                        if (!finished) {
                            return;
                        }
                        (0, react_native_reanimated_1.runOnJS)(finalizeDismiss)(true, true);
                    });
                    return;
                }
                const targetIndex = getNearestSnapIndex(projectedHeight, heights);
                const targetHeight = heights[targetIndex];
                currentIndex.value = targetIndex;
                currentHeight.value = (0, react_native_reanimated_1.withSpring)(targetHeight, SPRING_CONFIG, (finished) => {
                    if (!finished) {
                        return;
                    }
                    (0, react_native_reanimated_1.runOnJS)(finalizeSnap)(targetIndex, targetHeight);
                });
            }
        })
            .onFinalize(() => {
            isDragging.value = false;
            sheetGestureOwnsTouch.value = false;
            scrollGestureCanCaptureSheet.value = true;
        });
    }, [
        allowFullScreen,
        currentHeight,
        currentIndex,
        dismissOffset,
        dismissible,
        dragStartDismissOffset,
        dragStartHeight,
        finalizeDismiss,
        finalizeSlideOffDismiss,
        finalizeSnap,
        interactiveMaxHeight,
        isDragging,
        isSlideMode,
        markAnimationTargetClosed,
        sheetGestureOwnsTouch,
        scrollGestureCanCaptureSheet,
        scrollableOffsetY,
        scrollableRegistered,
        snapHeights,
    ]);
    const animatedBackdropStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const maxHeight = highestSnapHeight;
        const floorHeight = lowestSnapHeight;
        // Factor in dismiss slide offset for backdrop fade
        const effectiveHeight = Math.max(0, currentHeight.value - dismissOffset.value);
        let progress = 0;
        if (effectiveHeight > 0) {
            if (maxHeight <= floorHeight + SNAP_EPSILON) {
                progress = (0, react_native_reanimated_1.clamp)(effectiveHeight / Math.max(maxHeight, 1), 0, 1);
            }
            else if (effectiveHeight <= floorHeight) {
                progress =
                    (0, react_native_reanimated_1.clamp)(effectiveHeight / Math.max(floorHeight, 1), 0, 1) *
                        BACKDROP_MIN_VISIBILITY;
            }
            else {
                const range = Math.max(maxHeight - floorHeight, 1);
                const steppedProgress = (0, react_native_reanimated_1.clamp)((effectiveHeight - floorHeight) / range, 0, 1);
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
    const animatedSheetStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const maxHeight = highestSnapHeight;
        const minHeight = lowestSnapHeight;
        const morphRange = Math.max(maxHeight - minHeight, 1);
        const morphProgress = useDetachedMargins
            ? (0, react_native_reanimated_1.clamp)((currentHeight.value - minHeight) / morphRange, 0, 1)
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
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
            borderTopLeftRadius: detachedRadius,
            borderTopRightRadius: detachedRadius,
            height: currentHeight.value,
            marginBottom: detachedBottom * marginScale,
            marginLeft: detachedLeft * marginScale,
            marginRight: detachedRight * marginScale,
            marginTop: detachedTop * marginScale,
            shadowOpacity: 0.24 - 0.12 * morphProgress,
            transform: [
                {
                    translateY: dismissOffset.value +
                        (heightDelta > 0 ? heightDelta * 0.08 : 0),
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
    const topSafeArea = safeAreaInsets.top;
    const handleAreaHeight = handleVisible ? DEFAULT_HANDLE_AREA_HEIGHT : 8;
    const handleMorph = (0, react_native_reanimated_1.useDerivedValue)(() => {
        if (!allowFullScreen) {
            return 0;
        }
        const maxHeight = highestSnapHeight;
        const minHeight = lowestSnapHeight;
        const morphRange = Math.max(maxHeight - minHeight, 1);
        return (0, react_native_reanimated_1.clamp)((currentHeight.value - minHeight) / morphRange, 0, 1);
    });
    // Handle at top: fades in as sheet approaches fullscreen, includes safe area padding
    const animatedTopHandleStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const morph = handleMorph.value;
        return {
            minHeight: morph * (handleAreaHeight + topSafeArea),
            paddingTop: morph * topSafeArea,
            opacity: morph,
        };
    }, [handleAreaHeight, topSafeArea]);
    // Handle at bottom: visible when collapsed, fades out approaching fullscreen
    const animatedBottomHandleStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const inverseMorph = 1 - handleMorph.value;
        return {
            minHeight: inverseMorph * handleAreaHeight,
            opacity: inverseMorph,
        };
    }, [handleAreaHeight]);
    const contextValue = React.useMemo(() => ({
        contentInsets,
        contentRootRef,
        registerAnchor,
        scrollableOffsetY,
        scrollableRegistered,
        sheetHeight: currentHeight,
        sheetMaxHeight: interactiveMaxHeight,
        sheetPanGesture: panGesture,
        unregisterAnchor,
    }), [
        contentInsets,
        currentHeight,
        interactiveMaxHeight,
        panGesture,
        registerAnchor,
        scrollableOffsetY,
        scrollableRegistered,
        unregisterAnchor,
    ]);
    const needsAnchorMeasurement = hasAnchorSnapPoints && open && resolvedSnapHeights.length === 0;
    const shouldRenderMeasurement = needsContentMeasurement && open && contentHeight === 0;
    const shouldRenderSheet = isVisible && !needsAnchorMeasurement;
    const backdropPressEnabled = dismissible && backdropPressBehavior === "close";
    const handleBackdropPress = React.useCallback(() => {
        if (!backdropPressEnabled) {
            return;
        }
        animateToClosed();
    }, [animateToClosed, backdropPressEnabled]);
    const backdropBaseStyle = React.useMemo(() => [
        react_native_1.StyleSheet.absoluteFillObject,
        { backgroundColor: backdropColor },
    ], [backdropColor]);
    const backdropPointerEvents = isVisible && backdropPressBehavior === "close" ? "auto" : "none";
    const handleIndicatorStyle = React.useMemo(() => [styles.handleIndicator, { backgroundColor: handleColor }], [handleColor]);
    if (!shouldRenderMeasurement && !shouldRenderSheet && !needsAnchorMeasurement) {
        return null;
    }
    const handleIndicator = handleVisible ? ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: handleIndicatorStyle })) : null;
    const topHandle = dragRegion === "handle" ? ((0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: panGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
                styles.handleArea,
                animatedTopHandleStyle,
                handleStyle,
            ], children: handleIndicator }) })) : ((0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
            styles.handleArea,
            animatedTopHandleStyle,
            handleStyle,
        ], children: handleIndicator }));
    const bottomHandle = dragRegion === "handle" ? ((0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: panGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
                styles.handleArea,
                animatedBottomHandleStyle,
                handleStyle,
            ], children: handleIndicator }) })) : ((0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
            styles.handleArea,
            animatedBottomHandleStyle,
            handleStyle,
        ], children: handleIndicator }));
    const content = ((0, jsx_runtime_1.jsxs)(react_native_reanimated_1.default.View, { pointerEvents: "auto", style: [
            styles.sheet,
            animatedSheetStyle,
            sheetStyle,
        ], children: [topHandle, (0, jsx_runtime_1.jsx)(TopSheetInternalContext.Provider, { value: contextValue, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { onLayout: needsContentMeasurement ? undefined : handleContentLayout, ref: contentRootRef, style: [
                        styles.content,
                        applyContentInset
                            ? {
                                paddingTop: contentInsets.top,
                            }
                            : null,
                        contentContainerStyle,
                    ], children: children }) }), bottomHandle] }));
    const measurementContent = shouldRenderMeasurement ? ((0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "none", style: styles.measurementRoot, children: (0, jsx_runtime_1.jsx)(TopSheetInternalContext.Provider, { value: contextValue, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                    styles.measurementSheet,
                    detached
                        ? {
                            marginLeft: resolvedDetachedPadding.left,
                            marginRight: resolvedDetachedPadding.right,
                        }
                        : null,
                ], children: (0, jsx_runtime_1.jsx)(react_native_1.View, { onLayout: handleContentLayout, style: [
                        styles.content,
                        applyContentInset
                            ? {
                                paddingTop: contentInsets.top,
                            }
                            : null,
                        contentContainerStyle,
                    ], children: children }) }) }) })) : null;
    const anchorMeasurementContent = needsAnchorMeasurement ? ((0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "none", style: styles.measurementRoot, children: (0, jsx_runtime_1.jsx)(TopSheetInternalContext.Provider, { value: contextValue, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                    styles.measurementSheet,
                    detached
                        ? {
                            marginLeft: resolvedDetachedPadding.left,
                            marginRight: resolvedDetachedPadding.right,
                        }
                        : null,
                ], children: (0, jsx_runtime_1.jsx)(react_native_1.View, { ref: contentRootRef, style: [
                        styles.content,
                        applyContentInset
                            ? {
                                paddingTop: contentInsets.top,
                            }
                            : null,
                        contentContainerStyle,
                    ], children: children }) }) }) })) : null;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { pointerEvents: "box-none", style: [styles.root, style], children: [measurementContent, anchorMeasurementContent, (0, jsx_runtime_1.jsx)(AnimatedPressable, { onPress: handleBackdropPress, pointerEvents: backdropPointerEvents, style: [backdropBaseStyle, animatedBackdropStyle, backdropStyle] }), shouldRenderSheet
                ? dragRegion === "sheet"
                    ? (0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: panGesture, children: content })
                    : content
                : null] }));
});
const styles = react_native_1.StyleSheet.create({
    content: {
        flexShrink: 1,
        gap: 0,
    },
    handleArea: {
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    handleIndicator: {
        borderRadius: DEFAULT_HANDLE_THICKNESS,
        height: DEFAULT_HANDLE_THICKNESS,
        width: DEFAULT_HANDLE_WIDTH,
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
        justifyContent: "flex-start",
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
            height: 10,
            width: 0,
        },
        shadowRadius: 24,
    },
});
