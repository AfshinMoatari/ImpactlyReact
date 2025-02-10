import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import clsx from "clsx";

const useStyles = makeStyles(() => ({
    root: {
        width: "100%",
        // height: "100%",
        borderRadius: 8,
        '& > div:first-child': {
        background: "#FFFFFF",
            padding: 16,
            border: '2px solid #eceef0',
            borderRadius: 8,
            '& > span#label:first-child': {
                fontWeight: 'bold'
            }
        }
    },
}))

interface NiceOutlinerProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    label?: string;
    className?: string;
    innerStyle?: React.CSSProperties;
}

const NiceOutliner: React.FC<NiceOutlinerProps> = ({ className, children, label, innerStyle, ...props }) => {
    const classes = useStyles();

    return (
        <div className={clsx(classes.root, className)} {...props}>
            <div style={innerStyle}>
                {label && <span id="label">{label}</span>}
                {children}
            </div>
        </div>

    )
}

export default NiceOutliner;
