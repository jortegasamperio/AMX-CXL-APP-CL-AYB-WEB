import { Component, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { CatRutasVueloAdd } from './components/cat-rutas-vuelo-add/cat-rutas-vuelo-add';
import { CatRutasVueloEdit } from './components/cat-rutas-vuelo-edit/cat-rutas-vuelo-edit';
import { CatCodePreselectDelete } from './components/cat-rutas-vuelo-delete/cat-rutas-vuelo-delete';
import { CatCodePreselectBulkUpload } from './components/cat-rutas-vuelo-bulk-upload/cat-rutas-vuelo-bulk-upload';
import { CatCodePreselectDetail } from './components/cat-rutas-vuelo-detail/cat-rutas-vuelo-detail';
import { RutasVuelo } from '../../data/cat-rutas-vuelo/cat-rutas-vuelo';


@Component({
  standalone: true,
  selector: 'app-cat-rutas-vuelo',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
    RouterModule
  ],
  templateUrl: './cat-rutas-vuelo.html',
  styleUrls: ['./cat-rutas-vuelo.scss']
})
export class CatRutasVuelo implements AfterViewInit {
  
      // Signals para estado reactivo
  readonly panelOpenState = signal(false);
  searchForm: FormGroup;
  
  constructor(private dialog: MatDialog, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      flightNumber: ['', Validators.required],
      departureStation: ['', Validators.required],
      arrivalStation: ['', Validators.required]
    });
  }

  abrirPopupBulk(): void {
    const dialogRef = this.dialog.open(CatCodePreselectBulkUpload, {
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Datos del formulario:', resultado);
      }
    });
  }
  
  abrirPopup(): void {
    const dialogRef = this.dialog.open(CatRutasVueloAdd, {
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Datos del formulario:', resultado);
      }
    });
  }

  abrirPopupEdit(registroSeleccionado: any): void {
    const dialogRef = this.dialog.open(CatRutasVueloEdit, {
      data: registroSeleccionado
    });
  
    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Datos del formulario:', resultado);
      }
    });
  }

  abrirPopupDetail(registroSeleccionado: any): void {
    const dialogRef = this.dialog.open(CatCodePreselectDetail, {
      data: registroSeleccionado
    });
  
    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Datos del formulario:', resultado);
      }
    });
  }

  mostrarContenido = true;

  toggleContenido(): void {
    this.mostrarContenido = !this.mostrarContenido;
  }

  abrirPopupDelete(): void {
    const dialogRef = this.dialog.open(CatCodePreselectDelete, {
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Datos del formulario:', resultado);
      }
    });
  }

  //image = '../../assets/images/Menu/Vuelos.jpg';

  rutasVuelo: RutasVuelo[] = [];
  colsPreselect = [
    { field: 'region', header: 'Región' },
    { field: 'flightNumber', header: 'No. vuelo' },
    { field: 'departureStation', header: 'Estación salida' },
    { field: 'arrivalStation', header: 'Estación llegada' },
    { field: 'preselect', header: 'Preselect' },
    { field: 'specialMeal', header: 'Special Meal' },
  ];

  languageGlobal = {
    add: 'Agregar',
    download: 'Descargar'
  };

  dataSource = new MatTableDataSource<any>();
  filters: { [key: string]: string } = {};
  
  advancedSearch(): void {
    const formValues = this.searchForm.value;
    console.log('Buscar:', formValues.flightNumber, formValues.departureStation, formValues.arrivalStation);
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.dataSource.data = ELEMENT_DATA;

    this.colsPreselect.forEach(col => {
      this.filters[col.field] = '';
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      return this.colsPreselect.every(col => {
        const fieldValue = (data[col.field] || '').toString().toLowerCase();
        const searchValue = (searchTerms[col.field] || '').toLowerCase();
        return fieldValue.includes(searchValue);
      });
    };
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify(this.filters);
  }

  get columns() {
    return this.colsPreselect;
  }

  get displayedColumns(): string[] {
  return [...this.colsPreselect.map(col => col.field), 'detail', 'edit', 'delete'];
  }

  download(row: any): void {
    console.log('Descargar manual:', row);
  }

  openAddModal(): void {
    console.log('Abrir modal para agregar');
  }
}

const ELEMENT_DATA: RutasVuelo[] = [
  { region: 'EUR', flightNumber: '1', departureStation: 'MEX', arrivalStation: 'MAD', preselect: 'Si', specialMeal: 'J,Y'},
  { region: 'EUR', flightNumber: '2', departureStation: 'MAD', arrivalStation: 'MEX', preselect: 'Si', specialMeal: 'J,Y'},
  { region: 'EUR', flightNumber: '3', departureStation: 'MEX', arrivalStation: 'CDG', preselect: 'Si', specialMeal: 'J,Y'},
  { region: 'EUR', flightNumber: '4', departureStation: 'CDG', arrivalStation: 'MEX', preselect: 'Si', specialMeal: 'J,Y'},
  { region: 'EUR', flightNumber: '5', departureStation: 'MEX', arrivalStation: 'CDG', preselect: 'Si', specialMeal: 'J,Y'}
];