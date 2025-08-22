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
export class CatCodePreselectDelete {

  onOptionChange(): void {
    console.log('Opción seleccionada:');
  }

  constructor(
    public dialogRef: MatDialogRef<CatCodePreselectDelete>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo
  ) {}

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {}

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrado' });
  }
}
