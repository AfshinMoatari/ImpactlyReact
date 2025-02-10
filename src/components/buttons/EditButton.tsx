import React from "react";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ColoredIconButton, {ColoredIconButtonProps} from "./ColoredIconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(() => ({
    btn: {
        width: 35,
        height: 35,
        padding: 8
    }
}))

type EditButtonProps = Omit<ColoredIconButtonProps, "flat" | "inverse" | "className">

const EditButton: React.FC<EditButtonProps> = (props) => {
    const classes = useStyles();

    return (
        <ColoredIconButton
            flat={true}
            inverse={true}
            className={classes.btn}
            {...props}
        >
            <EditOutlinedIcon/>
        </ColoredIconButton>
    )
}

export default EditButton;