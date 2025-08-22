import { AfterViewInit, Component, inject, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CatSpecialmealService } from '../../../../services/cat-specialmeal.service';


@Component({
  standalone: true,
  selector: 'app-cat-code-special-meal-image',
  imports: [MatDialogModule, MatFormFieldModule, FormsModule, MatOptionModule, MatIconModule,
    MatSelectModule, CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule
  ],
  templateUrl: './cat-code-special-meal-image.html',
  styleUrls: ['./cat-code-special-meal-image.scss']
})
export class CatCodeSpecialMealImage implements AfterViewInit {

  readonly dialogRef = inject(MatDialogRef<CatCodeSpecialMealImage>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  imageSm: string = '';

  constructor(private specialMealService: CatSpecialmealService, private cdr: ChangeDetectorRef) { }

  /**
   * Después de que se creó el formulario insertamos las imágenes
   */
  ngAfterViewInit(): void {
    this.getImageSm(this.data.id);
    console.log(this.imageSm);
  }

  getImageSm(id: number): void {
    this.specialMealService.getImageSm(id).subscribe({
      next: (data) => {
        if (data.status == 200) {
          setTimeout(() => {
            this.imageSm = data.data.path;
            this.cdr.detectChanges();
          }, 500);
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
