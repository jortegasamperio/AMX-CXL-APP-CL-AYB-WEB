import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { CatRutasVueloAdd } from './components/cat-rutas-vuelo-add/cat-rutas-vuelo-add';
import { CatRutasVueloEdit } from './components/cat-rutas-vuelo-edit/cat-rutas-vuelo-edit';
import { CatRutasVueloDelete } from './components/cat-rutas-vuelo-delete/cat-rutas-vuelo-delete';
import { CatRutasVueloBulkUpload } from './components/cat-rutas-vuelo-bulk-upload/cat-rutas-vuelo-bulk-upload';
import { CatRutasVueloDetail } from './components/cat-rutas-vuelo-detail/cat-rutas-vuelo-detail';
import { RutasVuelo } from '../../data/cat-rutas-vuelo/cat-rutas-vuelo';
import { CatRutasVueloService } from '../../services/cat-rutas-vuelo.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-cat-rutas-vuelo',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule
  ],
  templateUrl: './cat-rutas-vuelo.html',
  styleUrls: ['./cat-rutas-vuelo.scss']
})
export class CatRutasVuelo implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  totalRecords = 0;
  pageSize = 5;
  pageNumber = 1;
  pageSizes = [5, 10, 25, 50];

  dataSource: RutasVuelo[] = [];
  filters: { [key: string]: string } = {};

  currentFlightNumber: number | null = null;
  currentDepartureAirport: string = "";
  currentArrivalAirport: string = "";

  private destroy$ = new Subject<void>();

  searchForm: FormGroup;
  
  constructor(private dialog: MatDialog, private fb: FormBuilder, private rutasVueloService: CatRutasVueloService, private cdr: ChangeDetectorRef) {
    this.searchForm = this.fb.group({
      flightNumber: [''],
      departureStation: [''],
      arrivalStation: ['']
    });
  }

  abrirPopupBulk(): void {
    const dialogRef = this.dialog.open(CatRutasVueloBulkUpload, {
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error en diálogo:', error);
        return of(null);
      })
    ).subscribe(resultado => {
      if (resultado) {
        this.handleDialogResult(resultado);
      }
    });
  }
  
  abrirPopup(): void {
    const dialogRef = this.dialog.open(CatRutasVueloAdd, {
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error en diálogo:', error);
        return of(null);
      })
    ).subscribe(resultado => {
      if (resultado) {
        this.handleDialogResult(resultado);
      }
    });
  }

  abrirPopupEdit(registroSeleccionado: RutasVuelo): void {
    const dialogRef = this.dialog.open(CatRutasVueloEdit, {
      data: registroSeleccionado
    });
  
    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error en diálogo:', error);
        return of(null);
      })
    ).subscribe(resultado => {
      if (resultado) {
        this.handleDialogResult(resultado);
      }
    });
  }

  abrirPopupDetail(registroSeleccionado: RutasVuelo): void {
    const dialogRef = this.dialog.open(CatRutasVueloDetail, {
      data: registroSeleccionado
    });
  
    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error en diálogo:', error);
        return of(null);
      })
    ).subscribe(resultado => {
      if (resultado) {
        this.handleDialogResult(resultado);
      }
    });
  }

  mostrarContenido = true;

  toggleContenido(): void {
    this.mostrarContenido = !this.mostrarContenido;
  }

  abrirPopupDelete(registroSeleccionado: RutasVuelo): void {
    const dialogRef = this.dialog.open(CatRutasVueloDelete, {
      data: registroSeleccionado
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error en diálogo:', error);
        return of(null);
      })
    ).subscribe(resultado => {
      if (resultado) {
        this.handleDialogResult(resultado);
      }
    });
  }

  image = '../../assets/images/Menu/Vuelos.png';

  colsPreselect = [
    { field: 'region', header: 'Region' },
    { field: 'flightNumber', header: 'No. vuelo' },
    { field: 'departureAirport', header: 'Estacion salida' },
    { field: 'arrivalAirport', header: 'Estacion llegada' },
    { field: 'preselect', header: 'Preselect' },
    { field: 'specialmeal', header: 'Special Meal' }
  ];

  languageGlobal = {
    add: 'Agregar',
    download: 'Descargar'
  };

  advancedSearch(): void {
    const formValues = this.searchForm.value;
    this.currentFlightNumber = formValues.flightNumber ? Number(formValues.flightNumber) : null;
    this.currentDepartureAirport = formValues.departureAirport || "";
    this.currentArrivalAirport = formValues.arrivalAirport || "";
    this.pageNumber = 1;
    
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    let requestSearch = { 
      flightNumber: this.currentFlightNumber,
      departureAirport: this.currentDepartureAirport,
      arrivalAirport: this.currentArrivalAirport,
      pageNumber: this.pageNumber, 
      pageSize: this.pageSize
    };
    this.getRutasVuelo(requestSearch);
  }

  ngOnInit(): void {
    this.colsPreselect.forEach(col => {
      this.filters[col.field] = '';
    });
    let requestSearch = { 
      flightNumber: null, 
      departureAirport: "", 
      arrivalAirport: "", 
      pageNumber: this.pageNumber, 
      pageSize: this.pageSize 
    };
    this.getRutasVuelo(requestSearch);
  }

  getRutasVuelo(request: any): void {
    this.rutasVueloService.getRutasVuelo(request).subscribe({
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
        console.error('Error fetching rutas vuelo:', err);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    let requestSearch = { 
      flightNumber: this.currentFlightNumber,
      departureAirport: this.currentDepartureAirport,
      arrivalAirport: this.currentArrivalAirport,
      pageNumber: event.pageIndex + 1, 
      pageSize: event.pageSize 
    };
    this.getRutasVuelo(requestSearch);
  }

  get columns() {
    return this.colsPreselect;
  }

  get displayedColumns(): string[] {
  return [...this.colsPreselect.map(col => col.field), 'detail', 'edit', 'delete'];
  }

  openAddModal(): void {
    console.log('Abrir modal para agregar');
  }

  handleDialogResult(resultado: any): void {
    console.log('Datos del formulario:', resultado);
    if (resultado.action === 'cerrar') {
      let requestSearch = { 
        flightNumber: null, 
        departureAirport: "", 
        arrivalAirport: "", 
        pageNumber: this.pageNumber, 
        pageSize: this.pageSize 
      };
      this.getRutasVuelo(requestSearch);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}