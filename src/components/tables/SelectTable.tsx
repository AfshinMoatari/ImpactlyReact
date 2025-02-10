import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import { NamedObject } from "../../types";
import BaseTable from "./BaseTable";
import HeadItem from "./HeadItem";
import BaseTableCell from "./BaseTableCell";
import BaseTableHead from "./BaseTableHead";
import { theme } from "../../constants/theme";
import { Box, CircularProgress } from "@material-ui/core";

interface SelectTableProps<T extends NamedObject> {
    heads: Array<HeadItem<T>>;
    elements: T[];
    selected: string[];
    setSelected: (selected: string[]) => void;
    onClick?: (e: React.MouseEvent<HTMLTableRowElement>, id: string) => void;
    endCell?: (row: T, i: number) => JSX.Element;
    startCell?: (row: T, i: number) => JSX.Element;
    endActions?: JSX.Element;
    initialOrderKey?: string;
    isLoading?: boolean;
}

const SelectTable = <T extends NamedObject>
    ({
        heads,
        elements,
        selected,
        setSelected,
        onClick,
        endCell,
        startCell,
        endActions,
        initialOrderKey,
        isLoading
    }: SelectTableProps<T>) => {

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelecteds = elements.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
        event.preventDefault();
        event.stopPropagation();
    };

    const isSelected = (id: string) => selected?.indexOf(id) !== -1;

    const hasSelected = selected?.length > 0;

    const SelectHead = (
        <Checkbox
            indeterminate={selected?.length > 0 && selected.length < elements.length}
            checked={elements?.length > 0 && selected.length === elements.length}
            onChange={handleSelectAllClick}
            inputProps={{ 'aria-label': 'select all' }}
            style={{ padding: 0, color: theme.palette.common.white }}
        />
    )

    const SelectCell = (row: T, index: number) => {
        const isItemSelected = isSelected(row.id);
        const labelId = `select-table-checkbox-${index}`;
        return (
            <BaseTableCell padding="checkbox">
                <Checkbox
                    checked={isItemSelected}
                    onClick={(e) => handleClick(e, row.id)}
                    inputProps={{ 'aria-labelledby': labelId }}
                />
            </BaseTableCell>
        );
    }

    return (
        <Box position="relative">
            <BaseTable
                heads={heads}
                elements={elements}
                onClick={hasSelected ? handleClick : (onClick ?? handleClick)}
                startActions={SelectHead}
                endActions={endActions ? endActions : endCell ? <BaseTableHead /> : undefined}
                startCell={SelectCell}
                endCell={endCell}
                selected={selected}
                initialOrderKey={initialOrderKey}
            />
            {isLoading && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="rgba(255, 255, 255, 0.7)"
                    style={{
                        zIndex: 999,
                        pointerEvents: 'none'
                    }}
                >
                    <CircularProgress size={30} />
                </Box>
            )}
        </Box>
    );
}

export default SelectTable;
