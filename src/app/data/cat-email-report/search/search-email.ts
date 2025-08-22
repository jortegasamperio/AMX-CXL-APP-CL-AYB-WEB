import { FormControl, FormGroup } from "@angular/forms";

export type SearchForm = FormGroup<{
    email: FormControl<string>;
    status: FormControl<string>;
    departureStations: FormControl<Array<string>|null>;
}>;
