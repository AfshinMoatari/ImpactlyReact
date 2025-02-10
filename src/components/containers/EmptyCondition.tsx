import React, {ReactNode} from "react";
import LoadingOverlay from "../feedback/LoadingOverlay";

interface EmptyConditionProps {
    isEmpty?: boolean;
    isLoading?: boolean;
    empty?: React.ReactElement;
}

export const EmptyCondition: React.FC<EmptyConditionProps> =
    ({children, isEmpty = false, empty = null, isLoading = false}) => {
        if (isLoading) return <LoadingOverlay size={40}/>;
        if (isEmpty) return empty;
        return (<>{children}</>)
    }

interface EmptyConditionElementsProps<T> {
    isLoading?: boolean;
    empty: React.ReactElement;
    data?: T[];
    children: (element: Required<T[]>) => ReactNode;
}

export const EmptyConditionElements = <T, >
({empty, data, children, isLoading = false}: EmptyConditionElementsProps<T>) => {
    if (isLoading) return <LoadingOverlay size={40}/>;
    if (!data || data.length == 0) return empty;
    return (<>{children(data as Required<T[]>)}</>)
}

interface EmptyConditionElementProps<T> {
    isLoading?: boolean;
    empty: React.ReactElement;
    data?: T | unknown;
    children: (element: Required<T>) => ReactNode;
}

export const EmptyConditionElement = <T, >
({empty, data, children, isLoading = false}: EmptyConditionElementProps<T>) => {
    if (isLoading) return <LoadingOverlay size={40}/>;
    if (!data) return empty;
    return (<>{children(data as Required<T>)}</>)
}