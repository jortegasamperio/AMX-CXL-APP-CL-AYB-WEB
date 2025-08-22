import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RutasVuelo } from '../../../../data/cat-rutas-vuelo/cat-rutas-vuelo';
import { CatRutasVueloService } from '../../../../services/cat-rutas-vuelo.service';


@Component({
  standalone: true,
  selector: 'app-cat-rutas-vuelo-detail',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatOptionModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cat-rutas-vuelo-detail.html',
  styleUrls: ['./cat-rutas-vuelo-detail.scss']
})
export class CatRutasVueloDetail implements OnInit {

  rutasVueloForm: FormGroup;

  departureStations = [
    { value: 'MEX', viewValue: 'MEX' }
  ];

  ngOnInit(): void {
    console.log('Datos recibidos:', this.data);
    if (this.data?.id) {
      this.loadRutaVueloDetails();
    }
  }

  loadRutaVueloDetails(): void {
    this.rutasVueloService.getRutaVueloDetails(this.data.id).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data) {
          this.rutasVueloForm.patchValue(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading ruta vuelo details:', err);
      }
    });
  }

  onOptionChange(): void {
    console.log('Opción seleccionada:');
  }

  constructor(
    private fb: FormBuilder,
    private rutasVueloService: CatRutasVueloService,
    public dialogRef: MatDialogRef<CatRutasVueloDetail>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo
  ) {
    this.rutasVueloForm = this.fb.group({
      carrier: [this.data?.carrier || ''],
      region: [this.data?.region || ''],
      flightNumber: [this.data?.flightNumber || ''],
      departureAirport: [this.data?.departureAirport || ''],
      arrivalAirport: [this.data?.arrivalAirport || ''],
      group: [this.data?.group || ''],
      iatacj: [this.data?.iatacj || ''],
      iatacy: [this.data?.iatacy || ''],
      preselect: [this.data?.preselect || ''],
      comentarios: ['']
    });

    this.rutasVueloForm.disable();
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }
}
