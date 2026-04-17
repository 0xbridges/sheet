import * as React from "react";
import { NativeScrollEvent, ScrollViewProps, StyleProp, ViewProps, ViewStyle } from "react-native";
export type BottomSheetInsets = {
    bottom: number;
};
export type BottomSheetAnchorPoint = Readonly<{
    key: string;
    offset?: number;
    type: "anchor";
}>;
export type BottomSheetDetachedPadding = number | Partial<{
    bottom: number;
    horizontal: number;
    left: number;
    right: number;
    top: number;
    vertical: number;
}>;
export type BottomSheetSnapPoint = number | `${number}%` | "content" | BottomSheetAnchorPoint;
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
export declare function createBottomSheetAnchor(key: string, options?: {
    offset?: number;
}): BottomSheetAnchorPoint;
export declare function useBottomSheetInsets(): BottomSheetInsets;
export declare function BottomSheetAnchor({ name, onLayout, ...props }: BottomSheetAnchorProps): import("react/jsx-runtime").JSX.Element;
export declare function BottomSheetScrollView({ alwaysBounceVertical, bounces, onScroll, scrollEnabled, scrollEventThrottle, ...props }: BottomSheetScrollViewProps): import("react/jsx-runtime").JSX.Element;
export declare const BottomSheet: React.ForwardRefExoticComponent<BottomSheetProps & React.RefAttributes<BottomSheetRef>>;
