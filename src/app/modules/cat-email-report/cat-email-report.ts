import { Component, signal, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule, NonNullableFormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil } from 'rxjs';

import { CatEmailReportAdd } from './components/cat-email-report-add/cat-email-report-add';
import { CatEmailReportEdit } from './components/cat-email-report-edit/cat-email-report-edit';
import { CorreoElectronico, ReportType, TableColumn } from '../../data/cat-email-report/cat-email-report';
import { SearchForm } from '../../data/cat-email-report/search/search-email';
import { RutaVueloService } from '../../services/ruta-vuelo.service';
import { RequestSearch } from '../../data/cat-email-report/search/request-search';
import { CatEmailService } from '../../services/cat-email.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-cat-email-report',
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
    MatOptionModule,
    MatSelectModule,
    MatExpansionModule,
    RouterModule
  ],
  templateUrl: './cat-email-report.html',
  styleUrls: ['./cat-email-report.scss']
})
export class CatEmailReport implements OnInit, OnDestroy {

  // Constants
  private static readonly DEFAULT_PAGE_SIZE = 5;
  private static readonly DEFAULT_PAGE_NUMBER = 1;
  private static readonly PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
  private static readonly STATUS_LIST = ['Activo', 'Inactivo'] as const;
  private static readonly REPORT_TYPES: ReportType[] = [
    { key: 1, name: 'Semanal' },
    { key: 2, name: 'Nacional' },
    { key: 3, name: 'Internacional' }
  ];

  // Pagination properties
  totalRecords = 0;
  pageSize = CatEmailReport.DEFAULT_PAGE_SIZE;
  pageNumber = CatEmailReport.DEFAULT_PAGE_NUMBER;
  readonly pageSizes = CatEmailReport.PAGE_SIZE_OPTIONS;

  // Table properties
  emailCols: TableColumn[] = [];
  dataSource: CorreoElectronico[] = [];
  displayedColumns: string[] = [];

  // UI state
  readonly panelOpenState = signal(false);
  headerReportType = 1;
  typeReport = CatEmailReport.REPORT_TYPES[0].key;

  // Data properties
  stationList: string[] = [];
  readonly statusList = CatEmailReport.STATUS_LIST;
  readonly reportTypes = CatEmailReport.REPORT_TYPES;

  // Form
  private readonly formBuilder = inject(NonNullableFormBuilder);
  readonly searchForm: SearchForm = this.formBuilder.group({
    email: this.formBuilder.control<string>(''),
    status: this.formBuilder.control<string>(''),
    departureStations: this.formBuilder.control<string[] | null>([])
  });

  // Services
  private readonly dialog = inject(MatDialog);
  private readonly rutaVueloService = inject(RutaVueloService);
  private readonly emailService = inject(CatEmailService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);

  // Lifecycle management
  private readonly destroy$ = new Subject<void>();




  
  ngOnInit(): void {
    this.loadDefaultData();
    this.loadStations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStations(): void {
    this.rutaVueloService.getStationsByPreselect()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.stations) {
            this.stationList = response.data.stations;
          }
        },
        error: (err) => {
          console.error('Error loading departure stations:', err);
        }
      });
  }

  advancedSearch(): void {
    const reportType = this.reportTypes.find(tipo => tipo.key === this.headerReportType);
    if (!reportType) return;

    const request: RequestSearch = {
      typeReport: reportType.name,
      email: this.searchForm.value.email ?? '',
      status: this.searchForm.value.status ?? '',
      departureStations: this.headerReportType === 3 ? (this.searchForm.value.departureStations ?? null) : null,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.getEmailListByReportType(request);
  }

  openModalAdd(): void {
    const reportType = this.reportTypes.find(tipo => tipo.key === this.headerReportType);
    if (!reportType) return;

    const dialogRef = this.dialog.open(CatEmailReportAdd, {
      disableClose: true,
      data: {
        reportType,
        stationList: this.stationList
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.advancedSearch();
        }
      });
  }


  openModalEdit(selectedRecord: CorreoElectronico): void {
    const reportType = this.reportTypes.find(tipo => tipo.key === this.headerReportType);
    if (!reportType) return;

    const dialogRef = this.dialog.open(CatEmailReportEdit, {
      data: {
        reportType,
        ...selectedRecord
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.advancedSearch();
        }
      });
  }



  private loadEmailData(request: RequestSearch): void {
    this.loadColumnsName();
    this.emailService.getEmail(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.dataSource = response.data.items;
            this.totalRecords = response.data.totalRecords;
            this.pageSize = response.data.pageSize;
            this.pageNumber = response.data.pageNumber;
            this.updateDisplayedColumns();
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.dataSource = [];
          this.snackBar.open(err.error.message, 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          console.error('Error loading email data:', err);
          this.cdr.detectChanges();
        }
      });
  }

  changeReportType(typeReportId: number): void {
    const reportType = this.reportTypes.find(tipo => tipo.key === typeReportId);
    if (!reportType) return;

    this.resetPagination();
    this.clearForm();
    this.headerReportType = reportType.key;
    
    const request: RequestSearch = {
      typeReport: reportType.name,
      email: '',
      status: '',
      departureStations: null,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };
    
    this.getEmailListByReportType(request);
  }

  private loadDefaultData(): void {
    const defaultReportType = this.reportTypes[0];
    this.headerReportType = defaultReportType.key;
    
    const request: RequestSearch = {
      typeReport: defaultReportType.name,
      email: '',
      status: '',
      departureStations: null,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };
    
    this.getEmailListByReportType(request);
  }

  private getEmailListByReportType(request: RequestSearch): void {
    this.loadEmailData(request);
  }

  private loadColumnsName(): void {
    const baseColumns: TableColumn[] = [
      { field: 'email', header: 'Correo Electrónico' },
      { field: 'status', header: 'Estatus' }
    ];

    this.emailCols = this.headerReportType === 3 
      ? [
          { field: 'email', header: 'Correo Electrónico' },
          { field: 'station', header: 'Estación' },
          { field: 'status', header: 'Estatus' }
        ]
      : baseColumns;
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = [...this.emailCols.map(col => col.field), 'edit'];
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.advancedSearch();
  }

  clearForm(): void {
    this.searchForm.reset({
      email: '',
      status: '',
      departureStations: []
    });
  }

  private resetPagination(): void {
    this.pageNumber = CatEmailReport.DEFAULT_PAGE_NUMBER;
    this.pageSize = CatEmailReport.DEFAULT_PAGE_SIZE;
  }
}