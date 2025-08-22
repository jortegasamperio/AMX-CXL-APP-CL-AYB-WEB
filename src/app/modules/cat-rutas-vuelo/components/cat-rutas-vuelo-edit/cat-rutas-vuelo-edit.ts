import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RutasVuelo } from '../../../../data/cat-rutas-vuelo/cat-rutas-vuelo';
import { CatRutasVueloService } from '../../../../services/cat-rutas-vuelo.service';


@Component({
  standalone: true,
  selector: 'app-cat-rutas-vuelo-edit',
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
  templateUrl: './cat-rutas-vuelo-edit.html',
  styleUrls: ['./cat-rutas-vuelo-edit.scss']
})
export class CatRutasVueloEdit implements OnInit {

  rutaVueloForm: FormGroup;

  departureStations = [
    { value: 'MEX', viewValue: 'MEX' }
  ];

  ngOnInit(): void {
    console.log('Datos recibidos:', this.data);
  }


  onOptionChange(): void {
    console.log('Opción seleccionada:');
  }

  constructor(
    private fb: FormBuilder,
    private rutasVueloService: CatRutasVueloService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CatRutasVueloEdit>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo
  ) {
    this.rutaVueloForm = this.fb.group({
      carrier: ['', Validators.required],
      region: [this.data?.region || '', Validators.required],
      flightNumber: [{value: this.data?.flightNumber || '', disabled: true}, Validators.required],
      departureStation: [this.data?.departureAirport || '', Validators.required],
      arrivalStation: [this.data?.arrivalAirport || '', Validators.required],
      group: ['', Validators.required],
      iataCj: ['', Validators.required],
      iataCy: ['', Validators.required],
      preselect: [this.data?.preselect || '', Validators.required],
      comentario: ['', Validators.required]
    });
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }

  guardar(): void {
    if (this.rutaVueloForm.valid) {
      const request = {
        id: this.data.id || 0,
        carrier: this.rutaVueloForm.get('carrier')?.value,
        region: this.rutaVueloForm.get('region')?.value,
        departureAirport: this.rutaVueloForm.get('departureStation')?.value,
        arrivalAirport: this.rutaVueloForm.get('arrivalStation')?.value,
        group: this.rutaVueloForm.get('group')?.value,
        preselect: Boolean(this.rutaVueloForm.get('preselect')?.value),
        iatacj: this.rutaVueloForm.get('iataCj')?.value,
        iatacy: this.rutaVueloForm.get('iataCy')?.value,
        comment: this.rutaVueloForm.get('comentario')?.value
      };

      this.rutasVueloService.editRutaVuelo(request).subscribe({
        next: (data) => {
          if (data.status == 200) {
            console.log('Ruta de vuelo editada');
            this.dialogRef.close({ action: 'cerrar', data: request });
          }
        },
        error: (err) => {
          console.error('Error editando ruta de vuelo:', err);
        },
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }
}
