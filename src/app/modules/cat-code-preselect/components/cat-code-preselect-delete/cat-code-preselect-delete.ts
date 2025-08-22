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
import { CatalogoAlimentos } from '../../../../data/cat-code-preselect/cat-code-preselect';
import { CatCodePreselectService } from '../../../../services/cat-code-preselect.service';


@Component({
  standalone: true,
  selector: 'app-cat-code-preselect-delete',
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
  templateUrl: './cat-code-preselect-delete.html',
  styleUrls: ['./cat-code-preselect-delete.scss']
})
export class CatCodePreselectDelete {

  onOptionChange(): void {
    console.log('Opción seleccionada:');
  }

  code: string;
  departureStation: any[];

  constructor(
    public dialogRef: MatDialogRef<CatCodePreselectDelete>,
    @Inject(MAT_DIALOG_DATA) public data: CatalogoAlimentos,
    private catCodePreselectService: CatCodePreselectService
  ) {
    this.code = this.data.code;
    this.departureStation = this.data.departureStation;
  }

  cancelar(): void {
    console.log(this.data);
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {
    if (this.data.id) {
      this.catCodePreselectService.deletePreselect(this.data.id).subscribe({
        next: (response) => {
          this.dialogRef.close({ action: 'eliminado', data: response });
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
        }
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }
}
