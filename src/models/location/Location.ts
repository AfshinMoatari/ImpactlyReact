import Region from "./Region";
import Municipality from "./Municipality";
import Postal from "./Postal";

interface Location {
    region: Region,
    municipality: Municipality,
    postal: Postal,
}

export default Location;