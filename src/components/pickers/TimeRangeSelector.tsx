import React, {useState} from "react";
import Button from "@material-ui/core/Button";
import {Divider, IconButton, Popover, Typography} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import CalendarTodoLineIcon from "remixicon-react/CalendarTodoLineIcon";
import makeStyles from "@material-ui/core/styles/makeStyles";
import useTheme from "@material-ui/core/styles/useTheme";
import {DatePicker} from "@material-ui/pickers";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CloseIcon from "remixicon-react/CloseLineIcon";
import useURIData from "../../hooks/useURIData";
import {customTime, TimeData, TimePreset, timePresets} from "../../lib/date/fromPreset";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles((theme) => ({
    button: {
        borderRadius: 18,
        borderColor: theme.palette.primary.light,
        color: theme.palette.primary.light,
        fontSize: 16
    },
    link: {
        fontSize: 16,
        marginTop: 4,
        marginBottom: 8,
    }
}))

const TimeRangeSelector = () => {
    const classes = useStyles();
    const theme = useTheme();

    const [timeData, setTimeData] = useURIData<TimeData>("timeData");
    const allTimePresets = timePresets();
    const initialPreset = allTimePresets.find(p => p.id === timeData.preset)
    const initialStart = timeData.start ? new Date(timeData.start) : null;
    const initialEnd = timeData.end ? new Date(timeData.end) : null;
    const {t} = useTranslation();

    const [preset, setPreset] = useState<TimePreset | undefined>(initialPreset);
    const [startDate, setStartDate] = useState<Date | null>(initialStart);
    const [endDate, setEndDate] = useState<Date | null>(initialEnd);

    const [isCustom, setIsCustom] = useState(false);

    const handleRange = (p: TimePreset) => () => {
        const now = new Date();
        const start = p.start(now);
        const end = p.end(now);

        setPreset(p);
        setStartDate(start);
        setEndDate(end);

        setTimeData({
            preset: p.id,
            start: start?.getTime(),
            end: end?.getTime()
        })
    }

    const handleApplyCustom = () => {
        if (startDate && endDate) {
            setTimeData({
                preset: "custom",
                start: startDate?.getTime(),
                end: endDate?.getTime()
            })
        }
        setIsCustom(false);
        setPreset(customTime);
        setAnchorEl(null);
    }

    const handleClear = () => {
        setTimeData(null);
        setPreset(undefined);
        setStartDate(null);
        setEndDate(null);
    }

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => {
        if (!isCustom) setAnchorEl(null);
    }
    const forceClose = () => setAnchorEl(null);

    let timeRange = "";
    if (startDate && endDate) {
        const isSameYear = startDate.getFullYear() === endDate.getFullYear();
        const start = startDate.toLocaleDateString("da-DK", {
            day: "numeric",
            month: "short",
            year: isSameYear ? undefined : "2-digit"
        });
        const end = endDate.toLocaleDateString("da-DK", {
            day: "numeric",
            month: "short",
            year: isSameYear ? "numeric" : "2-digit"
        });

        timeRange = start + " - " + end;
    }

    return (
        <React.Fragment>
            <Button
                id="time-button"
                aria-controls="time-menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleButtonClick}
                variant="outlined"
                endIcon={<CalendarTodoLineIcon color={theme.palette.primary.light}/>}
                className={classes.button}
            >
                {preset === undefined ? t("CitizenPage.setTimeIntervalButton") : (preset?.id === "custom" ? timeRange : preset.name)}
            </Button>
            <Popover
                id="time-menu"
                aria-labelledby="time-button"
                anchorEl={anchorEl}
                open={open}
                onClose={forceClose}
                onClick={handleClose}
                anchorOrigin={{
                    horizontal: "right",
                    vertical: "top"
                }}
                transformOrigin={{
                    horizontal: "right",
                    vertical: "top"
                }}
                PaperProps={{
                    style: {display: "flex", flexDirection: "column"},
                }}
            >
                <Box pl={2} pr={2} pt={1} pb={1} display="flex" justifyContent="space-between" alignItems="center">
                    <div>
                        <Typography
                            variant="subtitle1">{preset === undefined ? t("CitizenPage.setTimeIntervalButton") : (preset?.id !== "custom" ? preset.name : "")}</Typography>
                        <Typography variant="h5">{timeRange}</Typography>
                    </div>
                    {isCustom && (
                        <IconButton onClick={forceClose} style={{width: 48, height: 48}}>
                            <CloseIcon/>
                        </IconButton>
                    )}
                </Box>

                <Divider orientation="horizontal"/>
                {!isCustom && (
                    <Box pl={2} pr={2} pt={1}>
                        <Typography variant="subtitle1">{t("CitizenPage.frequentlyUsed")}</Typography>
                    </Box>
                )}
                {!isCustom && (
                    <Box pl={2} pr={2} pt={1} pb={1} display="flex" justifyContent="space-between">
                        <Box display="flex" flexDirection="column" alignItems="baseline" pr={4}>
                            {allTimePresets.slice(0, allTimePresets.length / 2).map(p => (
                                <Link
                                    key={p.id}
                                    component="button"
                                    onClick={handleRange(p)}
                                    className={classes.link}
                                >
                                    {p.name}
                                </Link>
                            ))}
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="baseline">
                            {allTimePresets.slice(allTimePresets.length / 2, allTimePresets.length).map(p => (
                                <Link
                                    key={p.id}
                                    component="button"
                                    onClick={handleRange(p)}
                                    className={classes.link}
                                >
                                    {p.name}
                                </Link>
                            ))}
                        </Box>
                    </Box>
                )}

                {isCustom && (
                    <Box display="flex">
                        <div>
                            <Typography style={{paddingTop: 8, paddingLeft: 24}}
                                        variant="subtitle1">{t("CitizenPage.startDate")}</Typography>
                            <DatePicker autoOk disableToolbar variant="static" value={startDate}
                                        onChange={setStartDate}/>
                        </div>
                        <div>
                            <Typography style={{paddingTop: 8, paddingLeft: 24}}
                                        variant="subtitle1">{t("CitizenPage.endDate")}</Typography>
                            <DatePicker disableToolbar variant="static" value={endDate} onChange={setEndDate}/>
                        </div>
                    </Box>
                )}

                <Divider orientation="horizontal"/>
                <Box pl={2} pr={2} pt={1.5} pb={1}>
                    {!isCustom && (
                        <Box display="flex" justifyContent="space-between">
                            <Link
                                component="button"
                                className={classes.link}
                                onClick={(e) => {
                                    setIsCustom(true);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                {t("CitizenPage.customize")}
                            </Link>
                            {preset !== undefined && (
                                <Link
                                    component="button"
                                    onClick={handleClear}
                                    className={classes.link}
                                >
                                    {t("CitizenPage.clear")}
                                </Link>
                            )}
                        </Box>
                    )}
                    {isCustom && (
                        <Box display="flex" justifyContent="space-between">
                            <Link
                                component="button"
                                className={classes.link}
                                onClick={(e) => {
                                    setIsCustom(false);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <ArrowLeftLineIcon/>
                            </Link>
                            <Link
                                component="button"
                                className={classes.link}
                                onClick={handleApplyCustom}
                            >
                                {t("CitizenPage.apply")}
                            </Link>
                        </Box>
                    )}
                </Box>
            </Popover>
        </React.Fragment>
    )
}

export default TimeRangeSelector;
