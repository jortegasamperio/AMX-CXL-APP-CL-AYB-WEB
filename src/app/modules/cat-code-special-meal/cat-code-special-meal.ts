import { Component, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { CatCodeSpecialMealImage } from './components/cat-code-special-meal-image/cat-code-special-meal-image';
import { CatalogoSpecialMeal } from '../../data/cat-code-special-meal/cat-code-special-meal';
import { CatSpecialmealService } from '../../services/cat-specialmeal.service';

@Component({
  standalone: true,
  selector: 'app-cat-code-special-meal',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatInputModule, MatButtonModule,
    MatIconModule, FormsModule, MatCardModule, RouterModule
  ],
  templateUrl: './cat-code-special-meal.html',
  styleUrls: ['./cat-code-special-meal.scss']
})
export class CatCodeSpecialMeal implements OnInit, AfterViewInit {

  //Variables para el paginador
  totalRecords = 0;
  pageSize = 5;
  pageNumber = 1;
  pageSizes = [5, 10, 25, 50];

  //table
  dataSource: CatalogoSpecialMeal[] = [];
  filters: { [key: string]: string } = {};

  imageSm: string = '';

  constructor(private dialog: MatDialog, private specialMealService: CatSpecialmealService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.colsPreselect.forEach(col => {
      this.filters[col.field] = '';
    });
  }

  ngAfterViewInit(): void {
    let requestSearch = { pageNumber: this.pageNumber, pageSize: this.pageSize };
    this.getSpecialMeal(requestSearch);
  }

  colsPreselect = [
    { field: 'code', header: 'Código' },
    { field: 'nameEs', header: 'Nombre Es' },
    { field: 'DescriptionEs', header: 'Descripción Es' },
    { field: 'nameEn', header: 'Nombre En' },
    { field: 'DescriptionEn', header: 'Descripción En' }
  ];

  showImage(reg: any): void {
    const buttonElement = document.activeElement as HTMLElement; // Get the currently focused element
    buttonElement.blur();
    this.dialog.open(CatCodeSpecialMealImage, {
      data: {
        id: reg.id,
        code: reg.code
      } 
    });
  }

  //======Funciones del paginador
  getSpecialMeal(request: any): void {

    this.specialMealService.getSpecialMeal(request).subscribe({
      next: (data) => {
        if (data.status == 200) {
          this.dataSource = data.data.items;
          this.totalRecords = data.data.totalRecords;
          this.pageSize = data.data.pageSize;
          this.pageNumber = data.data.pageNumber;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    let requestSearch = { pageNumber: event.pageIndex + 1, pageSize: event.pageSize };
    this.getSpecialMeal(requestSearch);
  }

  get columns() {
    return this.colsPreselect;
  }

  get displayedColumns(): string[] {
    return [...this.colsPreselect.map(col => col.field), 'imagen'];
  }

}