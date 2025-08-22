import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, takeUntil } from 'rxjs';

import { DialogData, EditForm, RequestEditEmail } from '../../../../data/cat-email-report/edit/edit-email';
import { CatEmailService } from '../../../../services/cat-email.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const REPORT_TYPE_INTERNATIONAL = 3;
const STATUS_ACTIVE = 'Activo';
const STATUS_INACTIVE = 'Inactivo';


@Component({
  standalone: true,
  selector: 'app-cat-email-report-edit',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatOptionModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './cat-email-report-edit.html',
  styleUrls: ['./cat-email-report-edit.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatEmailReportEdit implements OnInit, OnDestroy {

  // Services and dependencies
  private readonly dialogRef = inject(MatDialogRef<CatEmailReportEdit>);
  private readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly emailService = inject(CatEmailService);
  private readonly snackBar = inject(MatSnackBar);

  // Form
  readonly form: EditForm = this.formBuilder.group({
    email: this.formBuilder.control<string>({ value: this.data.email, disabled: true }),
    departureStations: this.formBuilder.control<string | null>({ value: this.data.station ?? null, disabled: true }),
    status: this.formBuilder.control<boolean>(this.isActiveStatus())
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

  ngOnInit(): void {
    // Component initialization if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isActiveStatus(): boolean {
    return this.data.status === STATUS_ACTIVE;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: RequestEditEmail = {
      id: this.data.id,
      status: this.getStatusValue()
    };

    this.emailService.editEmail(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
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
          console.error('Error updating email:', err);
        }
      });
  }

  private getStatusValue(): string {
    return this.form.value.status ? STATUS_ACTIVE : STATUS_INACTIVE;
  }

  close(result: boolean = false): void {
    this.dialogRef.close(result);
  }
}
