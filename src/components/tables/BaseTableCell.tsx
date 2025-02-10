import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";


export const BaseTableCell = withStyles({
    root: {
        borderColor: '#eceef0',
        padding: 8,
    }
})(TableCell);

export default BaseTableCell;