export class DragableItem {
    id: string;
    index?: number;
    primary: string;
    secondary: string;

    constructor(id: string, primary: string, secondary: string);
    constructor(id: string, index: number, primary: string, secondary: string);
    constructor(id: string, indexOrPrimary: number | string, primaryOrSecondary?: string, secondary?: string) {
        this.id = id;
        
        if (typeof indexOrPrimary === 'number') {
            this.index = indexOrPrimary;
            this.primary = primaryOrSecondary!;
            this.secondary = secondary!;
        } else {
            this.primary = indexOrPrimary;
            this.secondary = primaryOrSecondary!;
        }
    }
}
