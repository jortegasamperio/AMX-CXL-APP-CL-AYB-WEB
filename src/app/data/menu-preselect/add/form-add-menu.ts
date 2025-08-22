import { FormArray, FormControl, FormGroup } from "@angular/forms";
import moment from "moment";

export type Form = FormGroup<{
  flightNumber: FormControl<number>;
  mesCicloIni: FormControl<moment.Moment>;
  mesCicloFin: FormControl<moment.Moment>;
  platillo: FormArray<PlatilloForm>;
  createdBy: FormControl<string>;
  creationDate: FormControl<Date>;
}>;

export type PlatilloForm = FormGroup<{
  codAlimento: FormControl<string>;
  codServicio: FormControl<string>;
  cabina: FormControl<string>;
  ciclo: FormControl<string>;
  opcion: FormControl<string>;
  tipoMenu: FormControl<string>;
  codPsml: FormControl<string>;
  nombre_es: FormControl<string>;
  descripcion_es: FormControl<string>;
  nombre_en: FormControl<string>;
  descripcion_en: FormControl<string>;
  nombre_fr: FormControl<string>;
  descripcion_fr: FormControl<string>;
  nombre_pt: FormControl<string>;
  descripcion_pt: FormControl<string>;
  nombre_it: FormControl<string>;
  descripcion_it: FormControl<string>;
  nombre_ja: FormControl<string>;
  descripcion_ja: FormControl<string>;
  nombre_ko: FormControl<string>;
  descripcion_ko: FormControl<string>;
  image: FormControl<string | null>;
  nombreImg: FormControl<string>;
}>;