export const mapLanguageCode = (lang: string): string => {
    // Define the mapping from language names to language codes
    const languageMapping: { [key: string]: string } = {
        English: 'en',
        Danish: 'da',
        // Add other mappings as needed
    };

    // Return the mapped code or the original if not found
    return languageMapping[lang] || lang;
};
