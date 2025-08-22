import { FormControl, FormGroup } from "@angular/forms";

export interface SearchMenu {
    flightNumber: number;
    mesCiclo: string;
    annio: number;
}


export type SearchForm = FormGroup<{
    mesCiclo: FormControl<Array<string>>;
    annio: FormControl<Array<string>>;
    flightNumber: FormControl<Array<number|null>>;
}>;
