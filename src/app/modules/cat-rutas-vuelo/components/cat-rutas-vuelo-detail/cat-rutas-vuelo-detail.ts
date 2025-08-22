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
export class CatCodePreselectDetail implements OnInit {

  rutasVueloForm: FormGroup;

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
    public dialogRef: MatDialogRef<CatCodePreselectDetail>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo
  ) {
    this.rutasVueloForm = this.fb.group({
      carrier: [''],
      region: [''],
      flightNumber: [''],
      departureStation: [''],
      arrivalStation: [''],
      group: [''],
      opcion: [''],
      descripcion: [''],
      preselect: [''],
      comentarios: ['']
    });

    this.rutasVueloForm.disable();
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {
    this.dialogRef.close({ action: 'guardado', data: this.rutasVueloForm.value });
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrado' });
  }
}
