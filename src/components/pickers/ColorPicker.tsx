import React from "react";
import {Divider, Grid, Menu, MenuItem, Popover, Theme} from "@material-ui/core";
import NiceDivider from "../visual/NiceDivider";
import makeStyles from "@material-ui/core/styles/makeStyles";

export const COLORS = [
    "#61bd4f",
    "#f2d600",
    "#ff9f1a",
    "#eb5a46",
    "#c377e0",
    // "#0079bf",
    "#00c2e0",
    "#51e898",
    "#ff78cb",
    "#344563",
]

const useStyles = makeStyles<Theme, { color: string }>((theme) => ({
    pop: {
        overflow: "hidden",
    },
    box: {
        width: "100%",
        height: "100%",
        borderRadius: 4,
        cursor: "pointer",
        backgroundColor: ({ color }) => color,
        color: ({color}) => theme.palette.getContrastText(color),
        '&:hover': {
            opacity: .8,
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
    },
}))

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    const classes = useStyles({ color });
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () =>  setAnchorEl(null);
    const handlePick = (color: string) => () => {
        onChange(color);
        handleClose();
    }

    return (
        <div style={{ display: "flex", width: "100%" }}>
            <div className={classes.box} onClick={handleClick} >
                Farve
            </div>
            <Popover
                id="color-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    className: classes.pop
                }}
            >
                <Grid container spacing={2} style={{ padding: 8 }}>
                    {COLORS.map(color => (
                        <Grid item xs={4} style={{ height: 48 }}>
                            <div className={classes.box} style={{ backgroundColor: color }} onClick={handlePick(color)} />
                        </Grid>
                    ))}
                </Grid>

            </Popover>
        </div>
    )
}

export default ColorPicker;
