import React from "react";
import HomeBasePage from "../home/HomeBasePage";
import Iframe from 'react-iframe';
import {useAuth} from "../../../providers/authProvider";
import {ResponsiveContainer} from "recharts";

export const DashboardMPV = () => {

    const url = useAuth().currentProject?.sroiUrl;
    return (
        <HomeBasePage>
            <ResponsiveContainer>
                <Iframe url={url ?? ""}
                        display="block"
                        position="relative"
                        frameBorder={0}
                />
            </ResponsiveContainer>
        </HomeBasePage>
    )
};

export default DashboardMPV;

