export interface RequestSearch {
    departureStations: Array<string> | null;
    typeReport: string;
    email: string | null;
    status: string | null;
    pageNumber: number;
    pageSize: number;
}
  