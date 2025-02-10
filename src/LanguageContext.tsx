import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "./i18n";

interface LanguageContextProps {
    language: string;
    setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider: React.FC = ({ children }) => {
    const [language, setLanguage] = useState(i18n.language);


    useEffect(() => {
        const onLanguageChange = (newLang: string) => {
            setLanguage(newLang);
        };

        i18n.on('languageChanged', onLanguageChange);
        return () => {
            i18n.off('languageChanged', onLanguageChange);
        };
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
