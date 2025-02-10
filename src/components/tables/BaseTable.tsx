import React from "react";
import HeadItem from "./HeadItem";
import SortTable from "./SortTable";
import TableRow from "@material-ui/core/TableRow";
import { alpha, Checkbox } from "@material-ui/core";
import { toLocalDateMothYearString } from "../../lib/date/toLocalISO";
import formatNumber from "../../lib/string/formatNumber";
import { Order } from "../../lib/list/getComparator";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import BaseTableCell from "./BaseTableCell";

interface BaseTableProps<T extends Record<string, any>> {
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

export const useStyles = makeStyles<Theme, { hover: boolean }>((theme: Theme) =>
    createStyles({
        tr: {
            borderRadius: '8px !important',
            '&:hover': {
                background: ({ hover }) => (hover ? `${alpha(theme.palette.primary.main, 0.08)} !important` : '')
            },
        },
        thead: {
            '& .MuiTableCell-root': {
                backgroundColor: theme.palette.secondary.light,
                color: theme.palette.common.white,
                fontWeight: 'bold',
            },
        },
    }),
);

const BaseTable = <T extends Record<string, any>>(
    {
        heads,
        elements,
        onClick,
        selected,
        endActions,
        initialOrder,
        initialOrderKey,
        endCell,
        startActions,
        startCell,
        row,
        children,
        disabledSorting,
    }: BaseTableProps<T>) => {
    const filteredHeads = heads.filter((e) => !e.hidden);
    const handleRowClick = (rowId: string) => (e: React.MouseEvent<HTMLTableRowElement>) => onClick && onClick(e, rowId);
    const renderRowValue = (row: T, head: HeadItem<T>) => {
        if (head.render) return head.render(row);
        if (head.hideNull && !Boolean(row[head.id])) return '';

        if (typeof row[head.id]?.getMonth === 'function') {
            return toLocalDateMothYearString(row[head.id]);
        }
        const valueType = typeof row[head.id];

        if (valueType === 'boolean') {
            return <Checkbox
                checked={row[head.id]}
                disabled={true}
                color="primary"
                style={{ padding: 0 }}
            />
        }
        if (valueType === 'number' || valueType === 'bigint') {
            if (head.percent) return (row[head.id] * 100) + ' %';
            return formatNumber(Math.round(row[head.id]))
        }

        if (head.numeric) {
            return formatNumber(row[head.id])
        }
        return row[head.id];
    }

    const classes = useStyles({ hover: Boolean(onClick) });

    const renderRow = row ?? (
        (element: T, i: number) => (
            <TableRow
                key={element.id}
                tabIndex={-1}
                className={classes.tr}
                hover={Boolean(onClick)}
                onClick={handleRowClick(element.id)}
                style={{ cursor: Boolean(onClick) ? 'pointer' : undefined }}
                selected={
                    Array.isArray(selected) ?
                        selected.includes(element.id)
                        :
                        selected !== undefined && selected === element.id
                }
            >
                {startCell && startCell(element, i)}
                {filteredHeads.map((head, index) => (
                    <BaseTableCell
                        key={index + (head.id as string)}
                        align={head.numeric ? 'right' : 'left'}
                    >
                        {renderRowValue(element, head)}
                    </BaseTableCell>
                ))}
                {endCell && endCell(element, i)}
            </TableRow>
        ))

    return (
        <SortTable
            heads={filteredHeads}
            initialOrder={initialOrder}
            initialOrderKey={initialOrderKey}
            elements={elements}
            startActions={startActions}
            actions={endActions ? endActions : undefined}
            disabledSorting={disabledSorting}
            classes={{ head: classes.thead }} // Apply the header styles here
        >
            {(sortedElements) => (
                <>
                    {sortedElements.map((element, i) => renderRow(element, i))}
                    {children}
                </>
            )}
        </SortTable>
    );
}

export default BaseTable;
