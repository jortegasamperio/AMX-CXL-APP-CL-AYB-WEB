import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RutasVuelo } from '../../../../data/cat-rutas-vuelo/cat-rutas-vuelo';


@Component({
  standalone: true,
  selector: 'app-cat-rutas-vuelo-add',
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
  templateUrl: './cat-rutas-vuelo-add.html',
  styleUrls: ['./cat-rutas-vuelo-add.scss']
})
export class CatRutasVueloAdd {

  addForm: FormGroup;

  departureStations = [
    {value: 'MEX', viewValue: 'MEX'}
  ];

  onOptionChange(): void {
    console.log('Opción seleccionada:');
  }

  constructor(
    public dialogRef: MatDialogRef<CatRutasVueloAdd>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo,
    private fb: FormBuilder
  ) {
    this.addForm = this.fb.group({
      carrier: ['', Validators.required],
      region: ['', Validators.required],
      flightNumber: ['', Validators.required],
      departureStation: ['', Validators.required],
      arrivalStation: ['', Validators.required],
      group: ['', Validators.required],
      iataCj: ['', Validators.required],
      iataCy: ['', Validators.required],
      preselect: ['', Validators.required],
      comentarios: ['', Validators.required]
    });
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {
    const datosFormulario = this.addForm.value;
    this.dialogRef.close({ action: 'guardado', data: datosFormulario });
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrado' });
  }
}
