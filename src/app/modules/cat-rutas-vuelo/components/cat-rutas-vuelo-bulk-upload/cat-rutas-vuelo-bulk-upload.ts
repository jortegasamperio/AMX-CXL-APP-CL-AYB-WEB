import { Component, Inject, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RutasVuelo } from '../../../../data/cat-rutas-vuelo/cat-rutas-vuelo';


@Component({
  standalone: true,
  selector: 'app-cat-rutas-vuelo-bulk-upload',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatOptionModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cat-rutas-vuelo-bulk-upload.html',
  styleUrls: ['./cat-rutas-vuelo-bulk-upload.scss']
})
export class CatCodePreselectBulkUpload {

  @Output()
  public eventCatManual: EventEmitter<boolean> = new EventEmitter();

  public filesList: any[] = [];

  onOptionChange(): void {
    console.log('Opción seleccionada:');
  }

  fileBrowseHandler(filesList: any): void {
    this.prepareFilesList(filesList);
  }

  constructor(
    public dialogRef: MatDialogRef<CatCodePreselectBulkUpload>,
    @Inject(MAT_DIALOG_DATA) public data: RutasVuelo
  ) { }

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {}

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrado' });
  }

  onFileDropped($event: any): void {
    this.prepareFilesList($event);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number): void {
    this.filesList.splice(index, 1);
    this.disableBtn();
  }

  /**
   * Convert Files list to normal array list
   * @param filesList (Files List)
   */
  prepareFilesList(filesList: Array<File>): void {
    for (const item of filesList) {
      let mensaje = '';
      let index: any;
      if (item.type.includes('pdf')) {
        if (this.filesList.length != 0) {
          index = this.filesList.findIndex(x => x.file.name === item.name);
        }
        if (index >= 0) {
          this.deleteFile(index);
        }
        const fileWrapper: FileWrapper = {
          file: item,
          customName: localStorage.getItem('selectedOption') ?? ''
        };
        this.filesList.push(fileWrapper);
      } else {
        if (localStorage.getItem('language') === 'false') {
          mensaje = `El archivo: ${item.name} no cumple con el formato pdf`;
        } else {
          mensaje = `The file: ${item.name} is not pdf format`;
        }
      }

    }
    this.disableBtn();
  }

  disableBtn(): void {
    this.eventCatManual.emit(this.filesList.length == 0 ? true : false);
  }
}

interface FileWrapper {
  file: File;
  customName: string;
}
