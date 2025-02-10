import React from "react";
import getComparator, { Order } from "../../lib/list/getComparator";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import stableSort from "../../lib/list/stableSort";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TableHead from "@material-ui/core/TableHead";
import { Paper, Tooltip } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import HeadItem from "./HeadItem";
import BaseTableHead from "./BaseTableHead";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            height: '100%',
            flex: 1,
            position: 'relative',
        },
        paper: {
            height: '100%',
            width: '100%',
            position: 'relative',
            boxShadow: 'none',
            borderRadius: 8,
        },
        table: {},
        container: {
            maxHeight: '100%',
            width: '100%',
        },
        visuallyHidden: {
            border: 0,
            clip: 'rect(0 0 0 0)',
            height: 1,
            margin: -1,
            overflow: 'hidden',
            padding: 0,
            position: 'absolute',
            top: 20,
            width: 1,
        },
        activeSortLabel: {
            color: theme.palette.common.white + ' !important',
            '& .MuiTableSortLabel-icon': {
                color: theme.palette.common.white + ' !important',
            },
        },
    })
);

interface SortTableProps<T extends Record<string, any>> {
    heads: Array<HeadItem<T>>;
    initialOrderKey?: keyof T;
    initialOrder?: Order;
    elements: T[];
    startActions?: JSX.Element;
    actions?: JSX.Element;
    children: (elements: T[]) => JSX.Element | JSX.Element[];
    disabledSorting?: true;
    classes?: { head?: string };
}

const SortTable = <T extends Record<string, any>>({
    heads,
    elements,
    actions,
    disabledSorting,
    startActions,
    initialOrder,
    initialOrderKey,
    classes: customClasses,
    children,
}: SortTableProps<T>) => {
    const classes = useStyles();
    const [order, setOrder] = React.useState<Order>(initialOrder ?? 'asc');
    const [orderBy, setOrderBy] = React.useState<keyof T>(initialOrderKey ?? 'name');

    const handleRequestSort = (property: keyof T) => () => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedRows = stableSort(elements, getComparator(order, orderBy)) as T[];

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <TableContainer className={classes.container}>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size="medium"
                        aria-label="enhanced table"
                        stickyHeader
                    >
                        <TableHead className={customClasses?.head}>
                            <TableRow>
                                {startActions && (
                                    <BaseTableHead>
                                        {startActions}
                                    </BaseTableHead>
                                )}
                                {heads.map((item) => {
                                    const header = (
                                        <>
                                            <Tooltip title={item.tooltip ?? ''}>
                                                <div style={{ whiteSpace: 'nowrap' }}>
                                                    {item.label}
                                                </div>
                                            </Tooltip>
                                            {orderBy === item.id && (
                                                <span className={classes.visuallyHidden}>
                                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                </span>
                                            )}
                                        </>
                                    );
                                    return (
                                        <BaseTableHead
                                            key={item.id as string}
                                            align={item.numeric ? 'right' : 'left'}
                                            padding={item.disablePadding ? 'none' : 'normal'}
                                            sortDirection={orderBy === item.id ? order : false}
                                        >
                                            {!disabledSorting ? (
                                                <TableSortLabel
                                                    active={orderBy === item.id}
                                                    direction={orderBy === item.id ? order : 'asc'}
                                                    onClick={handleRequestSort(item.id)}
                                                    classes={{ root: classes.activeSortLabel }}
                                                >
                                                    {header}
                                                </TableSortLabel>
                                            ) : (
                                                header
                                            )}
                                        </BaseTableHead>
                                    );
                                })}
                                {actions && (
                                    <BaseTableHead
                                        align="right"
                                        size="small"
                                        padding="none"
                                        style={{ paddingRight: 8 }}
                                        variant="head"
                                    >
                                        {actions}
                                    </BaseTableHead>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>{children(sortedRows)}</TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
};

export default SortTable;
