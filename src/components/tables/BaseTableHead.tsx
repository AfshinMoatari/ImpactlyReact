import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";

export const BaseTableHead = withStyles({
    root: {
        border: 'none',
    }
})(TableCell);

export default BaseTableHead;