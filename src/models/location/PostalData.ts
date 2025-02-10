
export interface DawaPostalMunicipality {
    href: string,
    kode: string,
    navn: string
}

export interface DawaPostalData {
    "href": string,
    "nr": string,
    "navn": string,
    "kommuner": DawaPostalMunicipality[]
}

export interface PostalMunicipality {
    link: string,
    id: string,
    name: string,
}

export interface PostalData {
    id: string,
    name: string,
    municipalities: PostalMunicipality[],
}

export const postalDataFromDawa = (pd: DawaPostalData): PostalData => {

    const municipalities = pd.kommuner.map((kommune) => {
        return {
            link: kommune.href,
            id: kommune.kode,
            name: kommune.navn,
        }
    })

    return {
        id: pd.nr,
        name: pd.navn,
        municipalities: municipalities,
    }
}

export default PostalData;