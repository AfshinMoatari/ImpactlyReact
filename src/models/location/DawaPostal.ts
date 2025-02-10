export interface DawaPostnummer {
    nr: string;
    navn: string;
    href: string;
    stormodtager: boolean;
}

interface DawaPostal {
    text: string;
    postnummer: DawaPostnummer;
}

export default DawaPostal;