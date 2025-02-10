import React from "react";
import ProjectTag from "../models/ProjectTag";
import { Chip, ChipProps, Theme, Tooltip } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useTranslation } from 'react-i18next';

interface TagChipProps extends Omit<ChipProps, "color"> {
    tag: ProjectTag;
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

const TagChip: React.FC<TagChipProps> = ({ tag, color, ...props }) => {
    const classes = useStyles({ color: color || tag.color });
    const { t } = useTranslation();

    const chip = <Chip label={tag.name} className={classes.root} {...props} />;

    if (props.onDelete) return (
        <Tooltip title={t('Tags.removeTagTooltip', { tagName: tag.name })}>
            {chip}
        </Tooltip>
    )

    return chip
}

export default TagChip;