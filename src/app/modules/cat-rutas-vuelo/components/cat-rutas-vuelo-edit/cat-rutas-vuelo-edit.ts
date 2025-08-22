import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RutasVuelo } from '../../../../data/cat-rutas-vuelo/cat-rutas-vuelo';


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
    public dialogRef: MatDialogRef<CatRutasVueloEdit>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo
  ) {
    this.rutaVueloForm = this.fb.group({
      carrier: ['', Validators.required],
      region: [this.data?.region || '', Validators.required],
      flightNumber: [this.data?.flightNumber || '', Validators.required],
      departureStation: [this.data?.departureStation || '', Validators.required],
      arrivalStation: [this.data?.arrivalStation || '', Validators.required],
      group: ['', Validators.required],
      iataCj: ['', Validators.required],
      iataCy: ['', Validators.required],
      preselect: [this.data?.preselect || '', Validators.required],
      comentario: ['', Validators.required]
    });
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {
    if (this.rutaVueloForm.valid) {
      this.dialogRef.close({ action: 'guardado', data: this.rutaVueloForm.value });
    }
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrado' });
  }
}
