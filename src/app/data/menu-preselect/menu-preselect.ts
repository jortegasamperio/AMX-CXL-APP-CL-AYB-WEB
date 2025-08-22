export interface MenuAlimentos {
    flightNumber: number;
    departureAirport: string;
    arriveAirport: string;
    ciclo: string;
    mesCiclo: string;
    annio: string;
    createdBy: string;
}

export interface MenuColumn {
  readonly field: string;
  readonly header: string;
}

//PAra el manejo de fechas
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MMMM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};