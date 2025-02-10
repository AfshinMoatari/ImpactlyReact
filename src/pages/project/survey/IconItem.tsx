import React from "react";
import {Grid} from "@material-ui/core";

const IconItem: React.FC = ({children}) => (
    <Grid item xs={1} style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "end",
        opacity: 0.5,
    }}>
        {children}
    </Grid>
)

export default IconItem;
