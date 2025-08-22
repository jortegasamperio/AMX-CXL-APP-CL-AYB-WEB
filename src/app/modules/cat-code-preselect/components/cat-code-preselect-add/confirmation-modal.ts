import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-confirmation-modal',
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  template: `
    <mat-dialog-content>
      <h2>{{data.title}}</h2>
      <p [innerHTML]="data.message"></p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onAccept()">Aceptar</button>
    </mat-dialog-actions>
  `
})
export class ConfirmationModal {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationModal>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; foundStations?: string[] }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onAccept(): void {
    this.dialogRef.close(true);
  }
}