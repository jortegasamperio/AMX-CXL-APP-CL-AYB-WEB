import { FormControl, FormGroup } from "@angular/forms";

export type EditForm = FormGroup<{
    email: FormControl<string>;
    departureStations: FormControl<string | null>;
    status: FormControl<boolean>;
}>;

export interface RequestEditEmail {
    id: number,
    status: string
}

export interface DialogData {
  id: number;
  email: string;
  station?: string;
  status: string;
  reportType: {
    key: number;
    name: string;
  };
}