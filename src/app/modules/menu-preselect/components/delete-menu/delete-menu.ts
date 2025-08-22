import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MenuAlimentos } from '../../../../data/menu-preselect/menu-preselect';

@Component({
  selector: 'app-delete-menu',
  templateUrl: './delete-menu.html',
  styleUrl: './delete-menu.scss',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteMenu {
  readonly dialogRef = inject(MatDialogRef<DeleteMenu>);
  readonly data = inject<MenuAlimentos>(MAT_DIALOG_DATA);
  isDelete = true;

  close(): void {
    this.dialogRef.close();
  }
}
