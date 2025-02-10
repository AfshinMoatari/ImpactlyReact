import React from "react";
import { CircularProgress, Box } from "@material-ui/core";
import BaseTable from "../../../../components/tables/BaseTable";
import HeadItem from "../../../../components/tables/HeadItem";
import { Order } from "../../../../lib/list/getComparator";

// Define the props interface
interface TableViewContainerProps<T extends Record<string, any>> {
    loading: boolean;
    config: any;
    heads: Array<HeadItem<T>>;
    initialOrderKey?: keyof T;
    initialOrder?: Order;
    elements: T[];
    startActions?: JSX.Element;
    endActions?: JSX.Element | false;
    onClick?: ((e: React.MouseEvent<HTMLTableRowElement>, id: string) => void) | false;
    startCell?: (row: T, i: number) => JSX.Element;
    endCell?: ((row: T, i: number) => JSX.Element) | false;
    row?: (row: T, i: number) => JSX.Element;
    children?: React.ReactNode;
    selected?: string | string[];
    disabledSorting?: true;
}

const TableViewContainer = <T extends { id: string }>(props: TableViewContainerProps<T>) => {
    const {
        loading,
        elements,
        config,
        heads,
        endActions,
        initialOrder,
        initialOrderKey,
        endCell,
        startActions,
        startCell,
        row,
        disabledSorting,
    } = props;

    // Render loading spinner
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    // Render no data available message
    if (!elements || elements.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                No data available
            </Box>
        );
    }

    return (
        <BaseTable<T>
            heads={heads}
            elements={elements}
            initialOrderKey={initialOrderKey}
            initialOrder={initialOrder}
            startActions={startActions}
            endActions={endActions}
            startCell={startCell}
            endCell={endCell}
            row={row}
            disabledSorting={disabledSorting}
        />
    );
};

export default TableViewContainer;
