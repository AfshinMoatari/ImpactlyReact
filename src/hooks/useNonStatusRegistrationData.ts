import {useAppServices} from "../providers/appServiceProvider";
import {useEffect, useState} from "react";
import Registration from "../models/Registration";
import {ReportModuleConfig} from "../models/Report";

const useNonStatusRegistrationData = (config: ReportModuleConfig): [Registration[], boolean] => {
    const services = useAppServices();
    const [data, setData] = useState<Registration[]>([] as Registration[]);
    const [loading, setLoading] = useState(true);

    // config.tags = config.tags ?? [];
    // useEffect(() => {
    //     const fetch = async () => {
    //         const res = await services.reports.getRegistrationData(config);
    //         if (res.success) {
    //             setData(res.value);
    //         }
    //         setLoading(false);
    //     }
    //     fetch();
    // }, [config.tags.length, config.effectId, config.timeUnit, config.timePreset])

    return [data, loading];
}

export default useNonStatusRegistrationData;