import React from "react";
import { NuvoImporter, ResultValues } from 'nuvo-react';
import { useLanguage } from "../../../LanguageContext"
import da from './bulk_import_language.json';


interface BulkImportProps {
    onBulkImportClick: (result: ResultValues) => void;
    onCancelClick: () => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ onBulkImportClick, onCancelClick }) => {

    const { language } = useLanguage();
    const i18nOverrides = language === 'da' ? da : undefined;

    function formatDateForBackend(dateString: string) {
        const [day, month, year] = dateString.split("-");
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }


    return (
        <NuvoImporter
            licenseKey="JT2/duORRxQLqs742/AkCEU7k8pNzOZjkMSll6pYsIw="
            settings={{
                developerMode: false,
                maxEntries: 1500,
                identifier: "bulk_import",
                modal: true,
                i18nOverrides,
                columns: [
                    {
                        key: "name",
                        label: "Fornavn",
                        description: "Text",
                        columnType: "string",
                        validations: [
                            {
                                validate: "required"
                            }
                        ]
                    },
                    {
                        key: "lastName",
                        label: "Efternavn",
                        description: "Text",
                        columnType: "string",
                        validations: [
                            {
                                validate: "required",
                                errorMessage: "Feltet er påkrævet"
                            }
                        ]
                    },
                    {
                        key: "email",
                        label: "Email",
                        description: "xx@yy.xx",
                        columnType: "email"
                    },
                    {
                        key: "phoneNumber",
                        label: "Telefonnr.",
                        description: "Indtast et dansk telefonnummer uden at inkludere landekoden (+45)",
                        example: "11 11 11 11 ",
                        columnType: "string",
                        alternativeMatches: [
                            "Telefonnr (XX XX XX XX)",
                            ""
                        ]
                    },
                    {
                        key: "sex",
                        label: "Køn",
                        description: "Han, Hun, Andet",
                        columnType: "category",
                        dropdownOptions: [
                            {
                                label: "Han",
                                value: "Han",
                                type: "string"
                            },
                            {
                                label: "Hun",
                                value: "Hun",
                                type: "string"
                            },
                            {
                                label: "Andet",
                                value: "Andet",
                                type: "string"
                            }
                        ],
                        isMultiSelect: false
                    },
                    {
                        key: "birthDate",
                        label: "Fødselsdag",
                        description: "DD-MM-YYYY",
                        columnType: "date",
                        outputFormat: "DD-MM-YYYY"
                    },
                    {
                        key: "postalNumber",
                        label: "Postnummer",
                        description: "Text",
                        columnType: "string"
                    },
                    {
                        key: "municipality",
                        label: "Kommune",
                        description: "Text",
                        columnType: "string"
                    },
                    {
                        key: "region",
                        label: "Region",
                        description: "Text",
                        columnType: "string"
                    },
                    {
                        key: "isActive",
                        label: "Aktiv",
                        description: "Ja/Nej",
                        columnType: "boolean",
                        validations: [
                            {
                                validate: "required"
                            }
                        ]
                    },
                    {
                        key: "tags",
                        label: "Tags",
                        description: "Skriv alle de tags, som du gerne vil tilføje til borgerne, separeret med kommaer." +
                            "HUSK: Tagget SKAL være oprettet i dit Impactly projekt og skrives identisk i dette upload ark.",
                        example: "tag 1, tag 2, tag 3",
                        columnType: "string"
                    },
                    {
                        key: "strategy",
                        label: "Strategi",
                        columnType: "string"
                    }
                ]
            }}
            onResults={async (result, identifier, complete) => {
                const transformedResult = result.map((item) => {
                    const transformedItem = { ...item };

                    if (!transformedItem.birthDate) {
                        transformedItem.birthDate = null; // Change empty birthDate to null
                    } else {
                        const inputDate = transformedItem.birthDate.toString(); // Convert to string
                        const formattedBirthDate = formatDateForBackend(inputDate);
                        transformedItem.birthDate = formattedBirthDate;
                    }

                    return transformedItem;
                });

                onBulkImportClick(transformedResult);
                complete();
            }}
            onCancel={() => { onCancelClick() }}
        >
            Select File
        </NuvoImporter>
    )
}

export default BulkImport;

