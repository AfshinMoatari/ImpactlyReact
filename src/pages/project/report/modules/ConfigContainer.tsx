import { CircularProgress, Grid } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React from "react";
import { EmptyView } from "../../../../components/containers/EmptyView";


interface ModuleContainerProps {
    loading?: true;
    error?: boolean;
    message?: string;
}

const ConfigContainer: React.FC<ModuleContainerProps> = ({ loading, error, message, children }) => {
    if (loading) return (
        <Grid container style={{ minHeight: 400, padding: "8px 0" }}>
            <Grid item xs={4}>
                <Skeleton variant="rect" height={55} />
                <Skeleton variant="rect" height={55} style={{ marginTop: 16 }} />
                <Skeleton variant="rect" height={55} style={{ marginTop: 16 }} />
                <Skeleton variant="rect" height={55} style={{ marginTop: 16 }} />
            </Grid>
            <Grid item xs={8} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size="96px" />
            </Grid>
        </Grid>
    )

    if (error || children === undefined) return (
        <Grid container style={{ minHeight: 400, padding: "8px 0" }}>
            <Grid item xs={12}>
                <EmptyView title={message ?? "Noget gik galt"} />
            </Grid>
        </Grid>
    )

    return (
        <Grid container style={{ minHeight: 400, padding: "8px 0" }}>
            {children}
        </Grid>
    )
}

export default ConfigContainer;
