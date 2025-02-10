import React from "react";
import { Chip, ChipProps, Theme, Tooltip } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useTranslation } from 'react-i18next';

interface FormChipProps extends Omit<ChipProps, "color"> {
    itemName: string;
    color?: string;
}

const useStyles = makeStyles<Theme, { color: string | undefined }>((theme) => ({
    root: {
        borderRadius: 4,
        marginLeft: 4,
        marginRight: 4,
        wordWrap: "break-word",
        backgroundColor: ({ color }) => color,
        opacity: 0.7,
        marginBottom: 1,
        textColor: "black",
        color: theme.palette.text.primary,
    },
}));

const FormChip: React.FC<FormChipProps> = ({ itemName, color, ...props }) => {
    const classes = useStyles({ color: color });
    const { t } = useTranslation();

    const chip = <Chip label={itemName} className={classes.root} {...props} />;

    if (props.onDelete) return (
        <Tooltip title={t('Common.Chips.remove', { name: itemName })}>
            {chip}
        </Tooltip>
    )

    return chip
}

export default FormChip;