import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
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
import { RutaVueloService } from '../../../../services/ruta-vuelo.service';
import { ConfirmationModal } from './confirmation-modal';


@Component({
  standalone: true,
  selector: 'app-cat-code-preselect-add',
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
  templateUrl: './cat-code-preselect-add.html',
  styleUrls: ['./cat-code-preselect-add.scss']
})
export class CatCodePreselectAdd {

  form: FormGroup;
  departureStations: {value: string, viewValue: string}[] = [];

  constructor(
    private fb: FormBuilder,
    private preselectService: CatCodePreselectService,
    private rutaVueloService: RutaVueloService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CatCodePreselectAdd>,
    @Inject(MAT_DIALOG_DATA) public data: CatalogoAlimentos
  ) {
    this.form = this.fb.group({
      departureStation: [[], Validators.required],
      mealCode: ['', Validators.required],
      serviceCode: ['', Validators.required],
      cabin: ['', Validators.required],
      cycle: ['', Validators.required],
      option: ['', Validators.required],
      code: [{ value: '', disabled: true }]
    });
    this.loadDepartureStations();
    this.setupCodeGeneration();
  }

  loadDepartureStations(): void {
    this.rutaVueloService.getStationsByPreselect().subscribe({
      next: (response) => {
        if (response.success && response.data?.stations) {
          this.departureStations = response.data.stations.map((station: string) => ({
            value: station,
            viewValue: station
          }));
        }
      },
      error: (err) => {
        console.error('Error loading departure stations:', err);
      }
    });
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

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {
    if (this.form.valid) {
      const departureStationValue = this.form.get('departureStation')?.value;
      const departureStations = Array.isArray(departureStationValue) ? departureStationValue : [departureStationValue];
      const code = this.form.get('code')?.value;
      const validateRequest = {
        departureStations,
        preselectCode: code
      };

      this.preselectService.validateCodPreselect(validateRequest).subscribe({
        next: (response) => {
          if (response.success && response.data?.found?.length > 0) {
            const confirmationDialog = this.dialog.open(ConfirmationModal, {
              data: {
                title: 'Código Preselect',
                message: `Las estaciones <strong>${response.data.found.join(', ')}</strong> ya cuentan con el siguiente código <strong>${code}</strong> y no sufrirán ninguna actualización.`,
                foundStations: response.data.found || []
              }
            });
            confirmationDialog.afterClosed().subscribe(result => {
              if (result === true && response.data.notFound.length > 0) {
                this.savePreselect(response.data.notFound);
              }
              this.dialogRef.close({ action: 'cerrar' });
            });
          } else {
            this.savePreselect(departureStations);
            this.dialogRef.close({ action: 'cerrar' });
          }
        },
        error: (err) => {
          console.error('Error validating preselect:', err);
        }
      });
    }
  }

  private savePreselect(departureStations: string[]): void {
    const request = {
      departureStations,
      mealCode: this.form.get('mealCode')?.value,
      serviceCode: this.form.get('serviceCode')?.value,
      cabin: this.form.get('cabin')?.value,
      cycle: this.form.get('cycle')?.value,
      option: this.form.get('option')?.value
    };
    this.preselectService.addCodPreselect(request).subscribe({
      next: (data) => {
        if (data.status == 200) {
          console.log('Registro agregado');
          this.dialogRef.close({ action: 'guardado', data: request });
        }
      },
      error: (err) => {
        console.error('Error fetching preselect:', err);
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
  }
}
