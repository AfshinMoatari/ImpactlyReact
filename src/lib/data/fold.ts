type FoldDataIn = { [key: string]: number | string };
type FoldDataOut = { [key: string | number]: string | number }
export const fold = (data: FoldDataIn[], foldKey: string, valueKey: string): FoldDataOut[] => {
    if (data.length === 0) return [];

    const foldMap = data.reduce((prev: { [key: string]: number }, curr: FoldDataIn) => {
        if (prev[curr[foldKey]] && curr.value != 0) prev[curr[foldKey]] += 1;
        else prev[curr[foldKey]] = <number>curr.value;
        return prev
    }, {} as { [key: string]: number })

    // @ts-ignore
    return Object.keys(foldMap).map((k: string) => {
        const key = typeof data[0][foldKey] === "string" ? k : Number(k);
        return {
            [foldKey]: key,
            [valueKey]: foldMap[key]
        };
    });
};

export default fold;
