import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {CustomTheme} from "../../constants/theme";
import Box from "@material-ui/core/Box";
import {Typography} from "@mui/material";


const useStyles = makeStyles<CustomTheme>((theme) => ({
    root: {
        background: 'white',
        border: '1px solid rgba(0,0,0,.1)',
        borderRadius: "8px",
        cursor: 'pointer'
    },
    cover: {
        height: 160,
        background: '#503e8e14',
        borderRadius: "8px 8px 0px 0px",
        borderBottom: '1px solid rgba(0,0,0,.1)',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        fontSize: 18,
        color: "#0a0812dd",
        fontWeight: 600,
        textAlign: 'center',
        padding: "12px 25px 0 25px",
    },
    strategyStats: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start"
    },
    subtitle: {
        fontSize: 14,
        color: "#0A081299",
    },
    iconButton: {
        width: "20px",
        height: "15px",
        color: "#0A08128F"
    }
}))

interface StrategyStatsProps {
    icon: React.ReactElement;
    text: string;
}

interface StrategyOverviewCardProps {
    title: string;
    strategyStats?: StrategyStatsProps[];
    onClick: VoidFunction;
    icon: React.ReactElement;
}

const OverviewCard: React.FC<StrategyOverviewCardProps> = ({title, icon, onClick, strategyStats}) => {
    const classes = useStyles();

    const styledIcon = React.cloneElement(icon, {style: {width: '35px', height: "30px", fill: '#503E8E'}});

    const renderItems = (strategyStats: StrategyStatsProps[]) => (
        <Box className={classes.itemsContainer}>
            {strategyStats.map((item, index) => (
                <Box key={index} className={classes.strategyStats}>
                    {React.cloneElement(item.icon, { className: classes.iconButton })}
                    <Typography variant="body2" className={classes.subtitle}>
                        {item.text}
                    </Typography>
                </Box>
            ))}
        </Box>
    );

    return (
        <Box className={classes.root}>
            <Box onClick={onClick}>
                <div className={classes.cover}>
                    {styledIcon}
                    <Box className={classes.title}>
                        {title}
                    </Box>
                </div>
                <Box style={{margin: 10}}>
                    {strategyStats && renderItems(strategyStats)}
                </Box>
            </Box>
        </Box>
    );
}

export default OverviewCard;
