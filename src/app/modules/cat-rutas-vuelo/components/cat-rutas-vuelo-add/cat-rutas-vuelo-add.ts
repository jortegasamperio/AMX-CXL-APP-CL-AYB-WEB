import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RutasVuelo } from '../../../../data/cat-rutas-vuelo/cat-rutas-vuelo';
import { CatRutasVueloService } from '../../../../services/cat-rutas-vuelo.service';


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
    private fb: FormBuilder,
    private rutasVueloService: CatRutasVueloService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CatRutasVueloAdd>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo
  ) {
    this.addForm = this.fb.group({
      carrier: ['', Validators.required],
      region: ['', Validators.required],
      flightNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      departureAirport: ['', Validators.required],
      arrivalAirport: ['', Validators.required],
      group: ['', Validators.required],
      iatacj: ['', Validators.required],
      iatacy: ['', Validators.required],
      preselect: ['', [Validators.required, Validators.pattern(/^(Si|No)$/)]],
      comment: ['']
    });
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }

  guardar(): void {
    if (this.addForm.valid) {
      const request = {
        carrier: this.addForm.get('carrier')?.value,
        region: this.addForm.get('region')?.value,
        flightNumber: parseInt(this.addForm.get('flightNumber')?.value),
        departureAirport: this.addForm.get('departureAirport')?.value,
        arrivalAirport: this.addForm.get('arrivalAirport')?.value,
        group: this.addForm.get('group')?.value,
        iatacj: this.addForm.get('iatacj')?.value,
        iatacy: this.addForm.get('iatacy')?.value,
        preselect: this.addForm.get('preselect')?.value === 'Si' ? true : this.addForm.get('preselect')?.value === 'No' ? false : null,
        comment: this.addForm.get('comment')?.value
      };

      this.rutasVueloService.addRuta(request).subscribe({
        next: (data) => {
          if (data.status == 201) {
            console.log('Ruta de vuelo agregada');
            this.dialogRef.close({ action: 'cerrar', data: request });
          }
        },
        error: (err) => {
          console.error('Error agregando ruta de vuelo:', err);
        },
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }
}
