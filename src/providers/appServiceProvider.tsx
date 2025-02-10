import React, {createContext, useContext, useState} from "react";
import {AppRestServiceType, appServices} from "../services/appServices";

export const AppServicesContext = createContext<AppRestServiceType | null>(null);

export const AppServiceProvider: React.FC = ({children}) => {

    const [restService] = useState(appServices());

    return (
        <AppServicesContext.Provider
            value={restService}
        >
            {children}
        </AppServicesContext.Provider>
    )
}

export const useAppServices = (): AppRestServiceType => {
    const services = useContext(AppServicesContext);
    if (!services) throw new Error('use Servics must be used within AppServicesContext');
    return services;
};

export const useAppService = <T extends AppRestServiceType>(
    selector: (services: AppRestServiceType) => T
): T => {
    const services = useAppServices();
    return selector(services);
};