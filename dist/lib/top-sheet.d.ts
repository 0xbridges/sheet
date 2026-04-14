import * as React from "react";
import { ScrollViewProps, StyleProp, ViewProps, ViewStyle } from "react-native";
export type TopSheetInsets = {
    top: number;
};
export type TopSheetAnchorPoint = Readonly<{
    key: string;
    offset?: number;
    type: "anchor";
}>;
export type TopSheetDetachedPadding = number | Partial<{
    bottom: number;
    horizontal: number;
    left: number;
    right: number;
    top: number;
    vertical: number;
}>;
export type TopSheetSnapPoint = number | `${number}%` | "content" | TopSheetAnchorPoint;
export type TopSheetRef = {
    dismiss: () => void;
    expand: () => void;
    present: () => void;
    snapToIndex: (index: number) => void;
};
export type TopSheetProps = {
    allowFullScreen?: boolean;
    applyContentInset?: boolean;
    backdropColor?: string;
    backdropOpacity?: number;
    backdropPressBehavior?: "close" | "none";
    backdropStyle?: StyleProp<ViewStyle>;
    bottomInset?: number;
    children: React.ReactNode;
    collapsedHeight?: TopSheetSnapPoint;
    contentContainerStyle?: StyleProp<ViewStyle>;
    contentTopInset?: number;
    cornerRadius?: number;
    defaultOpen?: boolean;
    detached?: boolean;
    detachedPadding?: TopSheetDetachedPadding;
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
    snapPoints?: readonly TopSheetSnapPoint[];
    style?: StyleProp<ViewStyle>;
};
export type TopSheetAnchorProps = ViewProps & {
    name: string;
};
export type TopSheetScrollViewProps = ScrollViewProps;
export declare function createTopSheetAnchor(key: string, options?: {
    offset?: number;
}): TopSheetAnchorPoint;
export declare function useTopSheetInsets(): TopSheetInsets;
export declare function TopSheetAnchor({ name, onLayout, ...props }: TopSheetAnchorProps): import("react/jsx-runtime").JSX.Element;
export declare function TopSheetScrollView({ alwaysBounceVertical, bounces, onScroll, scrollEnabled, scrollEventThrottle, ...props }: TopSheetScrollViewProps): import("react/jsx-runtime").JSX.Element;
export declare const TopSheet: React.ForwardRefExoticComponent<TopSheetProps & React.RefAttributes<TopSheetRef>>;
