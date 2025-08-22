import { FormArray, FormControl, FormGroup } from "@angular/forms";

/**
 * Modelo que se utiliza para almacenar los menus a editar
 */
export type MenuEdit = FormGroup<{
  platillo: FormArray<PlatilloForm>;
}>;


export type PlatilloForm = FormGroup<{
    id: FormControl<number>
    codAlimento: FormControl<string>;
    codServicio: FormControl<string>;
    cabina: FormControl<string>;
    ciclo: FormControl<number|undefined>;
    opcion: FormControl<string>;
    codigoAlimento: FormControl<string>;
    mesCiclo: FormControl<string>;
    tipoMenu: FormControl<string>;
    image: FormControl<string | null>;
    nombreImg: FormControl<string>;
    flightNumber: FormControl<number>;
    annio: FormControl<number>;
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
}>;