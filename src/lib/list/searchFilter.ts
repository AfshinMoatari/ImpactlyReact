// TODO ASYNC SEARCH
export const searchFilter = (value: { [key: string]: string }, search: string): boolean => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return Object.keys(value).reduce<boolean>((prev, current) => {
        return prev || value[current]?.toLowerCase()?.includes(searchLower);
    }, false);
};

export type NamedObject = { name: string; }
export const nameSearchFilter = (search: string) => ({name}: NamedObject) => searchFilter({name: name}, search)

export default searchFilter;
