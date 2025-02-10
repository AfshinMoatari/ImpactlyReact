import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Tooltip } from "@material-ui/core";
import { Module } from "./modules";

const useStyles = makeStyles(() => ({
    root: {
        height: "100%",
        minHeight: 80,
        display: 'flex',
        alignItems: "center",
        borderRadius: 8,
        border: '1px solid #D3DAE6',
        transition: 'all 150ms cubic-bezier(0.694, 0.0482, 0.335, 1)',
        marginTop: 16,
        cursor: 'pointer',
        '&:hover': {
            boxShadow: '0 4px 8px 0 rgb(152 162 179 / 15%), 0 2px 2px -1px rgb(152 162 179 / 30%)',
            transform: 'translateY(-2px)',
        }
    },
    disabled: {
        height: "100%",
        minHeight: 80,
        display: 'flex',
        border: '1px solid #D3DAE6',
        boxShadow: '0 2px 2px -1px rgb(152 162 179 / 30%), 0 1px 5px -2px rgb(152 162 179 / 30%)',
        transition: 'all 150ms cubic-bezier(0.694, 0.0482, 0.335, 1)',
        marginTop: 16,
        opacity: 0.7,
    },
    container: {
        display: 'flex',
        flexDirection: "column",
        padding: 16,
        flex: 1,
    },
    icon: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 8,
    },
    textContainer: {
        display: 'flex',
        flexDirection: "column",
        justifyContent: "center",
    },
    title: {
        color: '#1a1c21',
        fontWeight: 600,
        marginBottom: 8,
        fontSize: 16,
        display: 'flex',
        justifyContent: "center",
    },
    description: {
        color: 'rgb(52, 55, 65)',
        display: 'flex',
        fontSize: 14,
        textAlign: "center",
        justifyContent: "center",
    },
}));

interface ReportItemCardProps {
    module: Module;
    onClick?: () => void;
}

const registrations = ["statusDistribution", "numericalAverage", "aggregatedCount"]
const surveys = ["surveyStats", "customDistribution", "correlativeDistribution"]
export const ReportItemCard: React.FC<ReportItemCardProps> = ({ module, onClick }) => {
    const classes = useStyles()
    const notImplemented = !Boolean(module.viewComponent);

    const card = (
        <div className={classes.container}>
            <div className={classes.icon}>
                {module.icon}
            </div>
            <div className={classes.textContainer}>
                <div className={classes.title}>
                    {module.title}
                </div>
                <div className={classes.description}>
                    {module.description}
                </div>
            </div>
        </div>
    )

    if (notImplemented) return (
        <Tooltip title="Ikke implementeret endnu" arrow={true}>
            <div className={classes.disabled}>
                {card}
            </div>
        </Tooltip>
    )

    return (
        <div style={{ backgroundColor: registrations.includes(module.type) ? "#04867314" : surveys.includes(module.type) ? "#ED4C2F14" : "#503E8E14" }} className={classes.root} onClick={onClick}>
            {card}
        </div>
    )
}

export default ReportItemCard;
