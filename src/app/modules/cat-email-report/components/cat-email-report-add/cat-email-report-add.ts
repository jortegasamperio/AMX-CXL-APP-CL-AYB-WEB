import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatOptionModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';

import { AddForm, DialogData, RequestAddEmail } from '../../../../data/cat-email-report/add/add-email';
import { CatEmailService } from '../../../../services/cat-email.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const REPORT_TYPE_INTERNATIONAL = 3;


@Component({
  standalone: true,
  selector: 'app-cat-email-report-add',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cat-email-report-add.html',
  styleUrls: ['./cat-email-report-add.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatEmailReportAdd implements OnInit, OnDestroy {

  // Services and dependencies
  private readonly dialogRef = inject(MatDialogRef<CatEmailReportAdd>);
  private readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly emailService = inject(CatEmailService);
  private readonly snackBar = inject(MatSnackBar);

  // Form
  readonly form: AddForm = this.formBuilder.group({
    email: this.formBuilder.control<string>('', [Validators.required, Validators.email]),
    departureStations: this.formBuilder.control<string[] | null>([])
  });

  // Lifecycle management
  private readonly destroy$ = new Subject<void>();

  // Getters for template
  get isInternationalReport(): boolean {
    return this.data.reportType.key === REPORT_TYPE_INTERNATIONAL;
  }

  get reportTypeName(): string {
    return this.data.reportType.name;
  }

  get stationList(): string[] {
    return this.data.stationList;
  }

  ngOnInit(): void {
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormValidation(): void {
    const departureStationsControl = this.form.get('departureStations');
    if (!departureStationsControl) return;

    if (this.isInternationalReport) {
      departureStationsControl.setValidators(Validators.required);
    } else {
      departureStationsControl.clearValidators();
    }
    departureStationsControl.updateValueAndValidity();
  }

  selectAllStations(event: MatOptionSelectionChange, select: MatSelect): void {
    const action = event.source.selected ? 'select' : 'deselect';
    select.options.forEach((option: MatOption) => {
      option[action]();
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: RequestAddEmail = {
      typeReport: this.data.reportType.name,
      email: this.form.value.email ?? '',
      departureStations: this.getDepartureStations()
    };

    this.emailService.addEmail(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 201) {
            this.snackBar.open(response.message, 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.close(true);
          }
        },
        error: (err) => {
          this.snackBar.open(err.error.message, 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          console.error('Error adding email:', err);
        }
      });
  }

  private getDepartureStations(): string[] | null {
    const stations = this.form.value.departureStations;
    return stations && stations.length > 0 ? stations.filter(Boolean) : null;
  }

  close(result: boolean = false): void {
    this.dialogRef.close(result);
  }

}
