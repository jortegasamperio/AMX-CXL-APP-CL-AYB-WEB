import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
    selector: '[appUpload]',
    standalone: true
})
export class UploadDirective {

    /* @HostBinding('class.fileover')
    fileOver: boolean = false; */

    @Output() fileDropped = new EventEmitter<any>();

    // Dragover listener
    @HostListener('dragover', ['$event']) onDragOver(evt: any) {
        evt.preventDefault();
        evt.stopPropagation();
        //this.fileOver = true;
    }

    // Dragleave listener
    @HostListener('dragleave', ['$event']) public onDragLeave(evt: any) {
        evt.preventDefault();
        evt.stopPropagation();
        //this.fileOver = false;
    }

    // Drop listener
    @HostListener('drop', ['$event']) public onDrop(evt: any) {
        evt.preventDefault();
        evt.stopPropagation();
        //this.fileOver = false;
        let filesList = evt.dataTransfer.files;
        if (filesList.length > 0) {
            this.fileDropped.emit(filesList);
        }
    }
}
