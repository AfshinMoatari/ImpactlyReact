import React from "react";
import {Box, CircularProgress, Hidden} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";


const DashboardSplash = () => {
    return (
        <Box
            display='flex'
            style={{height: '100vh'}}
        >
            <Hidden smDown implementation='css'>
                <Box pl={2} pr={2}
                     display='flex'
                     flexDirection='column'
                     style={{height: '100vh', flexShrink: 0, width: 200, background: '#FDF7EC'}}>
                    <div>
                        <div style={{height: 12}}/>
                        <Skeleton
                            height={47}
                            style={{borderRadius: 8, transform: "none"}}
                        />
                    </div>
                </Box>
            </Hidden>
        </Box>
    )
}

export default DashboardSplash;