import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { MenuAlimentos, MenuColumn } from '../../../../data/menu-preselect/menu-preselect';
import { PreviewMenu } from '../preview-menu/preview-menu';
import { MenuPreselectService } from '../../../../services/menu-preselect.service';
import { DeleteMenu } from '../delete-menu/delete-menu';
import { UploadMenu } from '../uploadMenu/uploadMenu';
import { SearchForm } from '../../../../data/menu-preselect/search/search-menu';
import { RequestSearch } from '../../../../data/menu-preselect/search/request-search';
import { RutaVueloService } from '../../../../services/ruta-vuelo.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-page-menu',
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './page-menu.html',
  styleUrl: './page-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMenu implements OnInit, OnDestroy {

  // Servicios inyectados
  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly menuService = inject(MenuPreselectService);
  private readonly rutaVueloService = inject(RutaVueloService);

  // Signals para estado reactivo
  readonly panelOpenState = signal(false);
  readonly dataSource = signal<MenuAlimentos[]>([]);
  readonly flightNumbers = signal<number[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(5);
  readonly pageNumber = signal(1);
  readonly isLoading = signal(false);

  // Constantes
  private readonly CURRENT_YEAR = new Date().getFullYear();
  readonly monthNames: readonly string[] = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ] as const;

  readonly menuColumns: readonly MenuColumn[] = [
    { field: 'flightNumber', header: 'No. Vuelo' },
    { field: 'departureAirport', header: 'Estacion Salida' },
    { field: 'arriveAirport', header: 'Estacion Llegada' },
    { field: 'ciclo', header: 'Ciclo' },
    { field: 'mesCiclo', header: 'Mes Ciclo' },
    { field: 'annio', header: 'Año' },
    { field: 'createdBy', header: 'Creado Por' }
  ] as const;

  readonly pageSizes = [5, 10, 25, 50] as const;

  // Computed values
  readonly yearOptions = computed(() => [
    (this.CURRENT_YEAR - 1).toString(),
    this.CURRENT_YEAR.toString(),
    (this.CURRENT_YEAR + 1).toString()
  ]);

  readonly displayedColumns = computed(() => [
    ...this.menuColumns.map(col => col.field),
    'preview',
    'edit',
    'duplicate',
    'delete'
  ]);

  // Formulario reactivo
  readonly searchForm: SearchForm = this.formBuilder.group({
    mesCiclo: this.formBuilder.control<string[]>([]),
    annio: this.formBuilder.control<string[]>([]),
    flightNumber: this.formBuilder.control<(number | null)[]>([])
  });



  /**
   * Inicializa el componente al montarse
   */
  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Limpia recursos al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa los datos del componente
   */
  private initializeComponent(): void {
    this.getFlights();
    this.loadInitialMenu();
  }

  /**
   * Obtiene el nombre del mes en español
   */
  private getSpanishMonthName(date: Date = new Date()): string {
    return date.toLocaleDateString('es-ES', { month: 'long' });
  }

  /**
   * Ejecuta la búsqueda de menús con los filtros aplicados
   */
  searchMenu(): void {
    this.resetPagination();
    const requestSearch = this.buildSearchRequest();
    this.getMenu(requestSearch);
  }

  /**
   * Reinicia la paginación a los valores por defecto
   */
  private resetPagination(): void {
    this.pageNumber.set(1);
    this.pageSize.set(5);
  }

  /**
   * Construye el objeto de solicitud de búsqueda con los valores del formulario
   */
  private buildSearchRequest(): RequestSearch {
    const { annio = [], mesCiclo = [], flightNumber = null } = this.searchForm.value;
    return {
      flightNumber,
      mesCiclo,
      annio: annio.map(Number),
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize()
    };
  }

  /**
   * Limpia todos los campos del formulario de búsqueda
   */
  clearForm(): void {
    this.searchForm.reset();
  }

  /**
   * Navega a la página de agregar nuevo menú
   */
  openAdd(): void {
    this.router.navigate(['/alimentos-bebidas/menu-preselect/add-menu']);
  }

  /**
   * Navega a la página de edición de menú con parámetros
   */
  openEdit(menu: MenuAlimentos, url: string): void {
    this.router.navigate([url], {
      queryParams: {
        f: menu.flightNumber,
        m: menu.mesCiclo,
        a: menu.annio
      }
    });
  }

  /**
   * Abre el diálogo de vista previa del menú
   */
  previewDialog(menu: MenuAlimentos): void {
    this.blurActiveElement();
    this.dialog.open(PreviewMenu, {
      disableClose: true,
      data: this.createMenuDialogData(menu)
    });
  }

  /**
   * Abre el diálogo de confirmación para eliminar menú
   */
  deleteMenuDialog(menu: MenuAlimentos): void {
    //this.updateMenuService(menu);
    const dialogRef = this.dialog.open(DeleteMenu, {
      disableClose: true,
      data: menu
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result !== undefined) {
          let request = {
            "flightNumber": menu.flightNumber,
            "mesCiclo": menu.mesCiclo,
            "annio": menu.annio
          }
          this.menuService.deleteMenu(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (data) => {
                this.isLoading.set(false);
                if (data.status === 200) {
                  alert(data.message);
                  this.loadInitialMenu();
                }
              },
              error: () => {
                this.isLoading.set(false);
                this.snackBar.open('Error al cargar los menús', 'Cerrar', { duration: 3000 });
              }
            });
        }
      });
  }

  /**
   * Abre el diálogo para cargar menú desde archivo
   */
  uploadDialog(): void {
    this.blurActiveElement();
    const dialogRef = this.dialog.open(UploadMenu, {
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.loadInitialMenu();
        }
      });
  }

  /**
   * Crea el objeto de datos para los diálogos de menú
   */
  private createMenuDialogData(menu: MenuAlimentos) {
    return {
      flightNumber: menu.flightNumber,
      mesCiclo: menu.mesCiclo,
      annio: menu.annio,
      departureAirport: menu.departureAirport,
      arriveAirport: menu.arriveAirport
    };
  }

  /**
   * Quita el foco del elemento activo en el DOM
   */
  private blurActiveElement(): void {
    (document.activeElement as HTMLElement)?.blur();
  }

  /**
   * Actualiza los datos del servicio de menú
   */
  private updateMenuService(menu: MenuAlimentos): void {
    this.menuService.actualizarDatos(this.createMenuDialogData(menu));
  }

  /**
   * Obtiene la lista de menús desde el servicio
   */
  private getMenu(request: RequestSearch): void {
    this.isLoading.set(true);
    this.menuService.getMenu(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.isLoading.set(false);
          if (data.status === 200) {
            this.dataSource.set(data.data.items);
            this.totalRecords.set(data.data.totalRecords);
            this.pageSize.set(data.data.pageSize);
            this.pageNumber.set(data.data.pageNumber);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.snackBar.open('Error al cargar los menús', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * Carga el menú inicial con filtros del mes y año actual
   */
  private loadInitialMenu(): void {
    const currentMonth = this.getSpanishMonthName();
    const currentYear = this.CURRENT_YEAR;

    this.searchForm.patchValue({
      mesCiclo: [currentMonth],
      annio: [currentYear.toString()],
      flightNumber: []
    });

    const requestSearch: RequestSearch = {
      flightNumber: null,
      mesCiclo: [currentMonth],
      annio: [currentYear],
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize()
    };

    this.getMenu(requestSearch);
  }

  /**
   * Función de tracking para ngFor de columnas
   */
  trackByField(index: number, column: MenuColumn): string {
    return column.field;
  }

  /**
   * Maneja el cambio de página en el paginador
   */
  /* onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    const requestSearch = this.buildSearchRequest();
    this.getMenu(requestSearch);
  } */

  /**
   * Obtiene la lista de números de vuelo disponibles
   */
  private getFlights(): void {
    this.rutaVueloService.getFlightsByPreselect()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.status === 200) {
            this.flightNumbers.set(data.data.flights);
          }
        },
        error: () => {
          this.showErrorMessage('Error al cargar los números de vuelo');
        }
      });
  }

  /**
   * Maneja el cambio de página en el paginador
   */
  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    const requestSearch = this.buildSearchRequest();
    this.getMenu(requestSearch);
  }

  /**
   * Muestra un mensaje de error usando SnackBar
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
