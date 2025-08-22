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
import { CatalogoAlimentos } from '../../../../data/cat-code-preselect/cat-code-preselect';
import { CatCodePreselectService } from '../../../../services/cat-code-preselect.service';


@Component({
  standalone: true,
  selector: 'app-cat-code-preselect-edit',
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
  templateUrl: './cat-code-preselect-edit.html',
  styleUrls: ['./cat-code-preselect-edit.scss']
})
export class CatCodePreselectEdit implements OnInit {

  form: FormGroup;

  departureStations = [
    {value: 'EZE', viewValue: 'EZE'},
    {value: 'MEX', viewValue: 'MEX'},
    {value: 'MAD', viewValue: 'MAD'}
  ];

  ngOnInit(): void {
    if (this.data && this.data.code) {
      const code = this.data.code;
      const departureStation = Array.isArray(this.data.departureStation) 
        ? this.data.departureStation 
        : [this.data.departureStation];
      this.form.patchValue({
        departureStation: departureStation,
        mealCode: code.substring(0, 3),
        serviceCode: code.substring(3, 6),
        cabin: code.substring(6, 7),
        cycle: code.substring(7, 8),
        option: code.substring(8),
        code: this.data.code
      });
      console.log(this.form);
    }
    this.setupCodeGeneration();
  }

  private setupCodeGeneration(): void {
    const fieldsToWatch = ['mealCode', 'serviceCode', 'cabin', 'cycle', 'option'];
    
    fieldsToWatch.forEach(field => {
      this.form.get(field)?.valueChanges.subscribe(() => {
        this.generateCode();
      });
    });
  }

  private generateCode(): void {
    const mealCode = this.form.get('mealCode')?.value || '';
    const serviceCode = this.form.get('serviceCode')?.value || '';
    const cabin = this.form.get('cabin')?.value || '';
    const cycle = this.form.get('cycle')?.value || '';
    const option = this.form.get('option')?.value || '';
    
    const code = mealCode + serviceCode + cabin + cycle + option;
    this.form.get('code')?.setValue(code);
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CatCodePreselectEdit>,
    @Inject(MAT_DIALOG_DATA) public data: CatalogoAlimentos,
    private catCodePreselectService: CatCodePreselectService
  ) {
    this.form = this.fb.group({
      departureStation: [{ value: '', disabled: true }],
      mealCode: ['', Validators.required],
      serviceCode: ['', Validators.required],
      cabin: ['', Validators.required],
      cycle: ['', Validators.required],
      option: ['', Validators.required],
      code: [{ value: '', disabled: true }]
    });
  }

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {
    if (this.form.valid) {
      const body = {
        idPreselect: this.data.id,
        mealCode: this.form.get('mealCode')?.value,
        serviceCode: this.form.get('serviceCode')?.value,
        cycle: this.form.get('cycle')?.value,
        option: this.form.get('option')?.value
      };
      
      this.catCodePreselectService.editCodPreselect(body).subscribe({
        next: (response) => {
          this.dialogRef.close({ action: 'guardado', data: response });
        },
        error: (error) => {
          console.error('Error al editar:', error);
        }
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }
}
