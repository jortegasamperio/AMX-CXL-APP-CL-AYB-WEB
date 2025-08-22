import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { CatCodePreselectAdd } from './components/cat-code-preselect-add/cat-code-preselect-add';
import { CatCodePreselectEdit } from './components/cat-code-preselect-edit/cat-code-preselect-edit';
import { CatCodePreselectDelete } from './components/cat-code-preselect-delete/cat-code-preselect-delete';
import { CatCodePreselectBulkUpload } from './components/cat-code-preselect-bulk-upload/cat-code-preselect-bulk-upload';
import { CatCodePreselectDetail } from './components/cat-code-preselect-detail/cat-code-preselect-detail';
import { CatalogoAlimentos } from '../../data/cat-code-preselect/cat-code-preselect';
import { CatCodePreselectService } from '../../services/cat-code-preselect.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-cat-code-preselect',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
    RouterModule
  ],
  templateUrl: './cat-code-preselect.html',
  styleUrls: ['./cat-code-preselect.scss']
})
export class CatCodePreselect implements OnInit, OnDestroy {

    // Signals para estado reactivo
  readonly panelOpenState = signal(false);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  totalRecords = 0;
  pageSize = 5;
  pageNumber = 1;
  pageSizes = [5, 10, 25, 50];

  dataSource: CatalogoAlimentos[] = [];
  filters: { [key: string]: string } = {};

  currentDepartureStations: any[] = [];
  currentPreselectCode: string = "";
  currentCycle: any = null;

  private destroy$ = new Subject<void>();

  searchForm: FormGroup;
  
  constructor(private dialog: MatDialog, private fb: FormBuilder, private preselectService: CatCodePreselectService, private cdr: ChangeDetectorRef) {
    this.searchForm = this.fb.group({
      departureStation: [[]],
      code: [''],
      cycle: [null]
    });
  }

  ngOnInit(): void {
    this.colsPreselect.forEach(col => {
      this.filters[col.field] = '';
    });
    let requestSearch = { departureStations: [], preselectCode: "", cycle: null, pageNumber: this.pageNumber, pageSize: this.pageSize };
    this.getPreselect(requestSearch);
  }

  abrirPopupBulk(): void {
    const dialogRef = this.dialog.open(CatCodePreselectBulkUpload, {
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
    const dialogRef = this.dialog.open(CatCodePreselectAdd, {
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

  abrirPopupEdit(registroSeleccionado: CatalogoAlimentos): void {
    const dialogRef = this.dialog.open(CatCodePreselectEdit, {
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

  abrirPopupDetail(registroSeleccionado: CatalogoAlimentos): void {
    const dialogRef = this.dialog.open(CatCodePreselectDetail, {
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

  abrirPopupDelete(registroSeleccionado: CatalogoAlimentos): void {
    const dialogRef = this.dialog.open(CatCodePreselectDelete, {
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

  //image = '../../assets/images/Menu/Preselect.png';

  catalogs: CatalogoAlimentos[] = [];
  colsPreselect = [
    { field: 'departureStation', header: 'Estación Salida' },
    { field: 'code', header: 'Código Preselección' },
    { field: 'cycle', header: 'Ciclo' },
    { field: 'createdBy', header: 'Creado Por' },
    { field: 'createdDate', header: 'Fecha Creación' }
  ];

  languageGlobal = {
    add: 'Agregar',
    download: 'Descargar'
  };

  
  advancedSearch(): void {
    const formValues = this.searchForm.value;
    this.currentDepartureStations = formValues.departureStation ? [formValues.departureStation] : [];
    this.currentPreselectCode = formValues.code || "";
    this.currentCycle = formValues.cycle || null;
    this.pageNumber = 1;
    
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    let requestSearch = { 
      departureStations: this.currentDepartureStations, 
      preselectCode: this.currentPreselectCode, 
      cycle: this.currentCycle, 
      pageNumber: this.pageNumber, 
      pageSize: this.pageSize
    };
    this.getPreselect(requestSearch);
  }

  getPreselect(request: any): void {
    this.preselectService.getPreselect(request).subscribe({
      next: (data) => {
        if (data.status == 200) {
          this.dataSource = data.data.items.map((item: CatalogoAlimentos) => ({ ...item, cycle: item.code.substring(7, 8) }));
          this.totalRecords = data.data.totalRecords;
          this.pageSize = data.data.pageSize;
          this.pageNumber = data.data.pageNumber;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching preselect:', err);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    let requestSearch = { 
      departureStations: this.currentDepartureStations, 
      preselectCode: this.currentPreselectCode, 
      cycle: this.currentCycle, 
      pageNumber: event.pageIndex + 1, 
      pageSize: event.pageSize 
    };
    this.getPreselect(requestSearch);
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
      let requestSearch = { departureStations: [], preselectCode: "", cycle: null, pageNumber: this.pageNumber, pageSize: this.pageSize };
      this.getPreselect(requestSearch);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
