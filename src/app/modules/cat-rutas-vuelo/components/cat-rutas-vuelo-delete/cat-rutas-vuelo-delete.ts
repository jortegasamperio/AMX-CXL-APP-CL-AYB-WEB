import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RutasVuelo } from '../../../../data/cat-rutas-vuelo/cat-rutas-vuelo';
import { CatRutasVueloService } from '../../../../services/cat-rutas-vuelo.service';


@Component({
  standalone: true,
  selector: 'app-cat-rutas-vuelo-delete',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatOptionModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cat-rutas-vuelo-delete.html',
  styleUrls: ['./cat-rutas-vuelo-delete.scss']
})
export class CatRutasVueloDelete {

  onOptionChange(): void {
    console.log('Opción seleccionada:');
  }

  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;

  constructor(
    private rutasVueloService: CatRutasVueloService,
    public dialogRef: MatDialogRef<CatRutasVueloDelete>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo
  ) {
    this.flightNumber = this.data.flightNumber;
    this.departureAirport = this.data.departureAirport;
    this.arrivalAirport = this.data.arrivalAirport;
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }

  eliminar(): void {
    if (this.data?.id) {
      this.rutasVueloService.deleteRutaVuelo(this.data.id).subscribe({
        next: (data) => {
          if (data.status == 200) {
            console.log('Ruta de vuelo eliminada');
            this.dialogRef.close({ action: 'cerrar', data: this.data });
          }
        },
        error: (err) => {
          console.error('Error eliminando ruta de vuelo:', err);
        },
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }
}
