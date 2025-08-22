import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CatalogoAlimentos } from '../../../../data/cat-code-preselect/cat-code-preselect';
import { CatCodePreselectService } from '../../../../services/cat-code-preselect.service';


@Component({
  standalone: true,
  selector: 'app-cat-code-preselect-detail',
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
  templateUrl: './cat-code-preselect-detail.html',
  styleUrls: ['./cat-code-preselect-detail.scss']
})
export class CatCodePreselectDetail implements OnInit {

  form: FormGroup;

  departureStations = [
    { value: 'MEX', viewValue: 'MEX' }
  ];

  ngOnInit(): void {
    this.getPreselectDetails(this.data.id);
  }

  getPreselectDetails(id: number): void {
    this.catCodePreselectService.getPreselectDetails(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          const code = data.mealCode + data.serviceCode + data.cabin + data.cycle + data.option;
          this.form.patchValue({
            departureStation: data.departureStation,
            mealCode: data.mealCode,
            serviceCode: data.serviceCode,
            cabin: data.cabin,
            cycle: data.cycle,
            option: data.option,
            code: code
          });
        }
      },
      error: (error) => {
        console.error('Error loading preselect details:', error);
      }
    });
  }


  onOptionChange(): void {
    console.log('Opción seleccionada:');
  }

  constructor(
    private fb: FormBuilder,
    private catCodePreselectService: CatCodePreselectService,
    public dialogRef: MatDialogRef<CatCodePreselectDetail>,
    @Inject(MAT_DIALOG_DATA) public data: CatalogoAlimentos
  ) {
    this.form = this.fb.group({
      departureStation: [''],
      mealCode: [''],
      serviceCode: [''],
      cabin: [''],
      cycle: [''],
      option: [''],
      code: ['']
    });
    
    this.form.disable();
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {
    this.dialogRef.close({ action: 'guardado', data: this.form.value });
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }
}
