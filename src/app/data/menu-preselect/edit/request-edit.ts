import { PlatilloForm } from "./form-edit-menu";

export interface RequestEditMenu {
    id?: number;
    codigoAlimento?: string;
    mesCiclo?: string;
    ciclo?: number;
    tipoMenu?: string;
    image?: string | null;
    flightNumber?: number;
    annio?: number;
    nombre_es?: string;
    descripcion_es?: string;
    nombre_en?: string;
    descripcion_en?: string;
    nombre_fr?: string;
    descripcion_fr?: string;
    nombre_pt?: string;
    descripcion_pt?: string;
    nombre_it?: string;
    descripcion_it?: string;
    nombre_ja?: string;
    descripcion_ja?: string;
    nombre_ko?: string;
    descripcion_ko?: string;
    updated_by?: string;
    updated_date?: Date;
}

export class RequestEdit {

    static FormToRequestEditMenu(e: PlatilloForm, userUpdate: string): RequestEditMenu {
        let data: RequestEditMenu = {
            id: e.controls.id.value,
            codigoAlimento: e.controls.codigoAlimento.value,
            mesCiclo: e.controls.mesCiclo.value,
            ciclo: e.controls.ciclo.value,
            tipoMenu: e.controls.tipoMenu.value,
            image: e.controls.image.value,
            flightNumber: e.controls.flightNumber.value,
            annio: e.controls.annio.value,
            nombre_es: e.controls.nombre_es.value,
            descripcion_es: e.controls.descripcion_es.value,
            nombre_en: e.controls.nombre_en.value,
            descripcion_en: e.controls.descripcion_en.value,
            nombre_fr: e.controls.nombre_fr.value,
            descripcion_fr: e.controls.descripcion_fr.value,
            nombre_pt: e.controls.nombre_pt.value,
            descripcion_pt: e.controls.descripcion_pt.value,
            nombre_it: e.controls.nombre_it.value,
            descripcion_it: e.controls.descripcion_it.value,
            nombre_ja: e.controls.nombre_ja.value,
            descripcion_ja: e.controls.descripcion_ja.value,
            nombre_ko: e.controls.nombre_ko.value,
            descripcion_ko: e.controls.descripcion_ko.value,
            updated_by: userUpdate,
            updated_date: new Date()
        };
        return data;
    }
}