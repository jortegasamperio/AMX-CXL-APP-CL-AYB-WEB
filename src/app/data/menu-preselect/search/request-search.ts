export interface RequestSearch {
    flightNumber: Array<number|null>|null;
    mesCiclo: Array<string>;
    annio: Array<number>;
    pageNumber: number;
    pageSize: number;
}