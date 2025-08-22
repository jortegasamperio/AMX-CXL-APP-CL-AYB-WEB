import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-platillo',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './delete-platillo.html',
  styleUrl: './delete-platillo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePlatillo {

  readonly dialogRef = inject(MatDialogRef<DeletePlatillo>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  isDelete = true;

  close(): void {
    this.dialogRef.close();
  }

}