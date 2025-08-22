export interface CorreoElectronico {
    id: number;
    email: string;
    status: string;
    station: string;
}

export interface ReportType {
  key: number;
  name: string;
}

export interface TableColumn {
  field: string;
  header: string;
}
