import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UploadDirective } from '../../../../directives/upload.directive';
import { MenuPreselectService } from '../../../../services/menu-preselect.service';

@Component({
  selector: 'app-upload-menu',
  templateUrl: './uploadMenu.html',
  styleUrl: './uploadMenu.scss',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatIconModule, UploadDirective, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadMenu implements OnInit {

  filesList: any[] = [];

  private readonly menuService = inject(MenuPreselectService);
  isUpload = true;

  readonly dialogRef = inject(MatDialogRef<UploadMenu>);

  @ViewChild('fileDropRef') fileDropRef!: ElementRef;

  ngOnInit(): void {
  }

  /**
   * on file drop handler
   */
  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler($event: any) {

    this.prepareFilesList($event.target.files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    if (this.fileDropRef?.nativeElement) {
      this.fileDropRef.nativeElement.value = null;
    }
    this.filesList.splice(index, 1);
  }

  upload(): void {
    let formData = new FormData();
    formData.append('archivo', this.filesList[0]);
    formData.append('createdBy', 'Usuario Prueba');
    formData.append('creationDate', new Date().toString());
    this.menuService.addMenuByFile(formData).subscribe({
      next: (data) => {
        if (data.status == 200) {
          this.close(true);
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }

  /**
   * Convert Files list to normal array list
   * @param filesList (Files List)
   */
  prepareFilesList(filesList: Array<any>) {
    let formatFile = filesList[0].name.split(".");
    if (formatFile[1] !=="xlsx" && formatFile[1] !=="xls") {
      alert(`El nombre del archivo: ${filesList[0].name} no cumple con la nomenclatura correcta`);
    } else {
      this.filesList = [];
      this.filesList.push(filesList[0]);
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: any, decimals: any) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  close(data: Boolean): void {
    this.dialogRef.close(data);
  }

}