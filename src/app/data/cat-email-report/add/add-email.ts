import { FormControl, FormGroup } from "@angular/forms";

export type AddForm = FormGroup<{
  email: FormControl<string>;
  departureStations: FormControl<Array<string> | null>;
}>;


export interface RequestAddEmail {
  typeReport: string,
  email: string,
  departureStations: string[] | null
}

export interface DialogData {
  reportType: {
    key: number;
    name: string;
  };
  stationList: string[];
}
