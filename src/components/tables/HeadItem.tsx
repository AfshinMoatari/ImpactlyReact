import React from "react";

interface HeadItem<T extends Record<string, any>> {
    id: keyof T;
    label: string | React.ReactNode;
    tooltip?: string;
    render?: (e: T) => React.ReactNode;
    numeric?: boolean;
    percent?: boolean;
    hideNull?: boolean;
    hidden?: boolean;
    disablePadding?: boolean;
}

export default HeadItem;
