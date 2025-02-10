import {RequestMethod, restClient} from "./restClient";
import PostalData, {DawaPostalData, DawaPostalMunicipality, postalDataFromDawa,} from "../models/location/PostalData";
import RestResponse from "../models/rest/RestResponse";
import storageService from "./storageService";
import DawaPostal from "../models/location/DawaPostal";
import {IdListRequestFunction, ListRequestFunction} from "./crudService";
import {DawaMunicipality, DawaMunicipalityRegion} from "../models/location/Municipality";

export interface DawaServiceType {
    getRegions: IdListRequestFunction<Required<DawaMunicipalityRegion>>;
    getMunicipalities: IdListRequestFunction<Required<DawaPostalMunicipality>>;
    getAllPostalData: ListRequestFunction<Required<PostalData>>;

    autoCompletePostal(postal: string): RestResponse<DawaPostal[]>;
}

export const dawaService = (): DawaServiceType => {
    const dawa = "https://dawa.aws.dk";
    const storage = storageService(dawa);
    const client = restClient(dawa, storage);
    return {
        async autoCompletePostal(postal) {
            const response = await client.fetchJSON<DawaPostal[]>(RequestMethod.GET, `/postnumre/autocomplete?q=${postal}`)
            const value = response.success ? response.value : [];
            return {
                ...response,
                value
            }
        },
        async getRegions(search: string) {
            if (!search) return {
                status: 404,
                success: false,
                feedback: {
                    severity: "warning",
                    message: "Tomt søgetekst",
                },
                value: undefined,
            };
            const response = await client.fetchJSON<DawaMunicipality[]>(RequestMethod.GET, `/kommuner?q=${search}`);
            const value = response.success ? response.value.map(m => m.region) : [];
            return {
                ...response,
                value
            }
        },
        async getMunicipalities(postalNumber: string) {
            if (postalNumber.length !== 4) return {
                status: 404,
                success: false,
                feedback: {
                    severity: "warning",
                    message: "Ikke validt postnummer",
                },
                value: undefined,
            };
            const response = await client.fetchJSON<DawaPostalData>(RequestMethod.GET, "/postnumre/" + postalNumber);
            const value: DawaPostalMunicipality[] = response.success ? response.value.kommuner : [];
            return {
                ...response,
                value,
            }
        },
        async getAllPostalData() {
            const response = await client.fetchJSON<DawaPostalData[]>(RequestMethod.GET, "/postnumre");
            const value = response.success ? response.value.map(e => postalDataFromDawa(e)) : [];
            return {
                ...response,
                value: value,
            };
        }
    };
}

export default dawaService;