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
import { CatalogoAlimentos } from '../../../../data/cat-code-preselect/cat-code-preselect';
import { CatCodePreselectService } from '../../../../services/cat-code-preselect.service';


@Component({
  standalone: true,
  selector: 'app-cat-code-preselect-bulk-upload',
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
  templateUrl: './cat-code-preselect-bulk-upload.html',
  styleUrls: ['./cat-code-preselect-bulk-upload.scss']
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
    @Inject(MAT_DIALOG_DATA) public data: CatalogoAlimentos,
    private catCodePreselectService: CatCodePreselectService
  ) { }

  cancelar(): void {
    this.dialogRef.close({ action: 'cancelado' });
  }

  guardar(): void {
    if (this.filesList.length === 0) return;
    
    const formData = new FormData();
    formData.append('file', this.filesList[0].file);
    
    this.catCodePreselectService.addPreselectByFile(formData).subscribe({
      next: (response) => {
        this.dialogRef.close({ action: 'guardado', data: response });
      },
      error: (error) => {
        console.error('Error al subir archivo:', error);
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close({ action: 'cerrar' });
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
      if (item.type.includes('sheet') || item.name.endsWith('.xlsx') || item.name.endsWith('.xls')) {
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
          mensaje = `El archivo: ${item.name} no cumple con el formato Excel`;
        } else {
          mensaje = `The file: ${item.name} is not Excel format`;
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
