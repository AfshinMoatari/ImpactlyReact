import {InputBase, withStyles} from "@material-ui/core";
import {CustomTheme} from "../../constants/theme";

const RoundTextField = withStyles((theme) => ({
    root: {
        'label + &': {
            marginTop: theme.spacing(3),
        },
        borderRadius: 8,
        position: 'relative',
        padding: '4px 10px',
        boxShadow: `${(theme as CustomTheme).custom.palePrimary} 0 0 0 0.1rem`,
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:focus-within': {
            boxShadow: `${theme.palette.primary.light} 0 0 0 0.1rem`,
        },
        '& .remixicon-icon ': {
            color: theme.palette.primary.main,
        }
    },
}))(InputBase);

export default RoundTextField;