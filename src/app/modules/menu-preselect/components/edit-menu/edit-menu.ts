import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { catchError, EMPTY, finalize, forkJoin, map, of } from 'rxjs';

import { SearchMenu } from '../../../../data/menu-preselect/search/search-menu';
import { MenuEdit, PlatilloForm } from '../../../../data/menu-preselect/edit/form-edit-menu';
import { RequestEditMenu, RequestEdit } from '../../../../data/menu-preselect/edit/request-edit';
import { DeletePlatillo } from '../delete-platillo/delete-platillo';
import { TabField } from '../../../../data/menu-preselect/name-fields';
import { RutaVueloService } from '../../../../services/ruta-vuelo.service';
import { MenuPreselectService } from '../../../../services/menu-preselect.service';
import { environment } from '../../../../../environments/environment';
import { VueloData } from '../../../../data/menu-preselect/vuelo-data';
import { MenuData } from '../../../../data/menu-preselect/edit/edit-data';
import { MatSnackBar } from '@angular/material/snack-bar';

// Constants
const MIN_PLATILLOS_REQUIRED = 6;
const IMAGE_DIMENSIONS = { width: 900, height: 900 };
const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg'];
const DEFAULT_IMAGE_NAME = 'Seleccionar imagen';
const preconnect = environment.preconnect;

const NOMBRE_CAMPOS_TAB: TabField[] = [
  { tab_name: 'Español', form: [{ control_Name: 'nombre_es', name: 'Nombre de platillo' }, { control_Name: 'descripcion_es', name: 'Descripción' }] },
  { tab_name: 'Inglés', form: [{ control_Name: 'nombre_en', name: 'Nombre de platillo' }, { control_Name: 'descripcion_en', name: 'Descripción' }] },
  { tab_name: 'Francés', form: [{ control_Name: 'nombre_fr', name: 'Nombre de platillo' }, { control_Name: 'descripcion_fr', name: 'Descripción' }] },
  { tab_name: 'Portugués', form: [{ control_Name: 'nombre_pt', name: 'Nombre de platillo' }, { control_Name: 'descripcion_pt', name: 'Descripción' }] },
  { tab_name: 'Italiano', form: [{ control_Name: 'nombre_it', name: 'Nombre de platillo' }, { control_Name: 'descripcion_it', name: 'Descripción' }] },
  { tab_name: 'Japonés', form: [{ control_Name: 'nombre_ja', name: 'Nombre de platillo' }, { control_Name: 'descripcion_ja', name: 'Descripción' }] },
  { tab_name: 'Coreano', form: [{ control_Name: 'nombre_ko', name: 'Nombre de platillo' }, { control_Name: 'descripcion_ko', name: 'Descripción' }] }
];

@Component({
  selector: 'app-edit-menu',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTabsModule,
    MatDatepickerModule,
    MatToolbarModule,
    MatDialogModule
  ],
  templateUrl: './edit-menu.html',
  styleUrl: './edit-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMenu implements OnInit {
  // Dependency injection
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rutaVueloService = inject(RutaVueloService);
  private readonly menuService = inject(MenuPreselectService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly dialog = inject(MatDialog);
   private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  // Reactive state with signals
  readonly panelOpenState = signal(false);
  readonly dataMenu = signal<MenuData[]>([]);
  readonly dataFlightsByCode = signal<VueloData | null>(null);
  readonly menuSearch = signal<SearchMenu | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  protected readonly errorMessage = signal<string>('');
  readonly nombreCampos: TabField[] = NOMBRE_CAMPOS_TAB;

  // Computed properties
  readonly isFormValid = computed(() =>
    this.form.valid && this.platilloArray.length >= MIN_PLATILLOS_REQUIRED
  );

  readonly isButtonDisabled = computed(() => !this.isFormValid());

  // Main form
  readonly form: MenuEdit = this.formBuilder.group({
    platillo: this.formBuilder.array<PlatilloForm>([])
  });

  // Form array getter
  get platilloArray(): FormArray<PlatilloForm> {
    return this.form.get('platillo') as FormArray<PlatilloForm>;
  }

  /**
   * Inicializa el componente al cargar
   */
  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Inicializa el componente cargando parámetros de ruta y datos de vuelo
   */
  initializeComponent(): void {
    this.clearError();
    this.isLoading.set(true);

    this.route.queryParams
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (params) => {
          const searchParams: SearchMenu = {
            flightNumber: Number(params['f']),
            mesCiclo: params['m'],
            annio: Number(params['a'])
          };

          this.menuSearch.set(searchParams);
          this.loadFlightData(searchParams);
        },
        error: (error) => this.handleError('Error al cargar parámetros', error)
      });
  }

  /**
   * Agrega un nuevo platillo al formulario
   */
  addPlatillo(): void {
    try {
      this.platilloArray.push(this.createPlatilloForm());
    } catch (error) {
      console.error('Error al agregar platillo:', error);
    }
  }

  /**
   * Genera el código SPML concatenando los campos del platillo
   * @param index Índice del platillo en el FormArray
   * @returns Código SPML generado
   */
  getCodigoSpml(index: number): string {
    const platillo = this.platilloArray.at(index).value;
    return `${platillo.codAlimento}${platillo.codServicio}${platillo.cabina}${platillo.ciclo}${platillo.opcion}`;
  }

  /**
   * Elimina un platillo del formulario por índice
   * @param index Índice del platillo a eliminar
   */
  delete(index: number): void {
    this.platilloArray.removeAt(index);
  }

  /**
   * Abre diálogo de confirmación para eliminar platillo
   * @param index Índice del platillo a eliminar
   */
  deleteDialog(index: number): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement?.blur();

    const infoPlatillo = this.platilloArray.at(index).controls;
    const dialogRef = this.dialog.open(DeletePlatillo, {
      disableClose: true,
      data: {
        codigo: infoPlatillo.codigoAlimento.value,
        flightNumber: infoPlatillo.flightNumber.value,
        mesCiclo: infoPlatillo.mesCiclo.value,
        annio: infoPlatillo.annio.value
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined) {
          this.handlePlatilloDelete(infoPlatillo.id.value, index);
        }
      });
  }

  /**
   * Actualiza el código SPML y nombre de imagen cuando cambian los campos
   * @param index Índice del platillo a actualizar
   */
  changeCodigo(index: number): void {
    const platillo = this.platilloArray.at(index).value;
    const codigoSpml = this.getCodigoSpml(index);
    const nameImg = platillo.nombreImg !== DEFAULT_IMAGE_NAME ? `${codigoSpml}.jpg` : DEFAULT_IMAGE_NAME;

    this.platilloArray.at(index).patchValue({
      codigoAlimento: codigoSpml,
      nombreImg: nameImg
    });
  }

  /**
   * Guarda los cambios del menú validando formulario y enviando al backend
   */
  save(): void {
    if (!this.isFormValid()) {
      alert(`El formulario es inválido o debe contener al menos ${MIN_PLATILLOS_REQUIRED} platillos`);
      return;
    }

    const dataRequest: RequestEditMenu[] = this.form.controls.platillo.controls.map(control =>
      RequestEdit.FormToRequestEditMenu(control, 'usuario update')
    );

    this.isLoading.set(true);

    this.menuService.editMenu(dataRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            console.log('Menú guardado exitosamente');
            this.showMessage(response.message);
            this.redirectMenu();
          } else {
            console.error(response.message);
            this.showMessage(response.message)
          }
        },
        error: (error) => this.handleError('Error al guardar el menú', error)
      });
  }

  /**
   * Navega de vuelta al listado de menús preseleccionados
   */
  redirectMenu(): void {
    this.router.navigate(['/alimentos-bebidas/menu-preselect']);
  }

  /**
   * Maneja la selección de archivos de imagen
   * @param event Evento del input file
   * @param index Índice del platillo
   */
  selectFiles(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (!this.isValidImageFile(file)) {
      alert('Solo se permiten archivos JPG/JPEG');
      return;
    }

    this.validateAndProcessImage(file, index);
  }

  /**
   * Valida si un platillo tiene una imagen válida asignada
   * @param index Índice del platillo
   * @returns true si tiene imagen válida
   */
  validateImgForm(index: number): boolean {
    const nombreImg = this.platilloArray.at(index).value.nombreImg;
    return !!(nombreImg && nombreImg !== DEFAULT_IMAGE_NAME);
  }

  /**
   * Crea un nuevo formulario de platillo con valores por defecto
   * @returns FormGroup del platillo
   */
  private createPlatilloForm(): PlatilloForm {
    const flightData = this.dataFlightsByCode();
    const menuSearchData = this.menuSearch();

    if (!flightData) {
      this.setError('Datos de vuelo no disponibles');
      throw new Error('Datos de vuelo no disponibles');
    }

    const codigoSpml = this.generateCodigoSpml(flightData);

    return this.formBuilder.group({
      id: this.formBuilder.control<number>(0),
      codigoAlimento: this.formBuilder.control<string>({ value: codigoSpml, disabled: true }),
      codAlimento: this.formBuilder.control<string>(flightData.foodCode[0], Validators.required),
      codServicio: this.formBuilder.control<string>(flightData.foodService[0], Validators.required),
      cabina: this.formBuilder.control<string>(flightData.cabyn[0], Validators.required),
      ciclo: this.formBuilder.control<number | undefined>(Number(flightData.cycle[0]), Validators.required),
      opcion: this.formBuilder.control<string>(flightData.option[0], Validators.required),
      mesCiclo: this.formBuilder.control<string>(menuSearchData?.mesCiclo ?? ''),
      tipoMenu: this.formBuilder.control<string>(''),
      image: this.formBuilder.control<string | null>(null),
      nombreImg: this.formBuilder.control<string>(DEFAULT_IMAGE_NAME),
      flightNumber: this.formBuilder.control<number>(menuSearchData?.flightNumber ?? 0),
      annio: this.formBuilder.control<number>(menuSearchData?.annio ?? 0),
      ...this.createLanguageControls()
    });
  }

  /**
   * Crea un formulario de platillo a partir de datos existentes
   * @param element Datos del menú existente
   * @param flightData Datos de vuelo
   * @param imageName Nombre de la imagen
   * @returns FormGroup del platillo
   */
  private createPlatilloFormFromData(element: MenuData, flightData: VueloData, imageName: string): PlatilloForm {
    return this.formBuilder.group({
      id: this.formBuilder.control<number>(element.id),
      codigoAlimento: this.formBuilder.control<string>({ value: element.codigoAlimento, disabled: true }),
      codAlimento: this.formBuilder.control<string>(this.selectCode(element.codigoAlimento, flightData.foodCode), Validators.required),
      codServicio: this.formBuilder.control<string>(this.selectCode(element.codigoAlimento, flightData.foodService), Validators.required),
      cabina: this.formBuilder.control<string>(element.codigoAlimento.slice(-3, -2), Validators.required),
      ciclo: this.formBuilder.control<number | undefined>(this.selectCiclo(element.codigoAlimento, flightData), Validators.required),
      opcion: this.formBuilder.control<string>(element.codigoAlimento.slice(-1), Validators.required),
      mesCiclo: this.formBuilder.control<string>(element.mesCiclo),
      tipoMenu: this.formBuilder.control<string>(element.tipoMenu),
      image: this.formBuilder.control<string | null>(null),
      nombreImg: this.formBuilder.control<string>(imageName),
      flightNumber: this.formBuilder.control<number>(element.flightNumber),
      annio: this.formBuilder.control<number>(element.annio),
      ...this.createLanguageControlsFromData(element)
    });
  }

  /**
   * Genera código SPML a partir de datos de vuelo
   * @param flightData Datos de vuelo
   * @returns Código SPML generado
   */
  private generateCodigoSpml(flightData: VueloData): string {
    return `${flightData.foodCode[0]}${flightData.foodService[0]}${flightData.cabyn[0]}${flightData.cycle[0]}${flightData.option[0]}`;
  }

  /**
   * Crea controles de formulario para todos los idiomas soportados
   * @returns Objeto con controles de idioma
   */
  private createLanguageControls() {
    return {
      nombre_es: this.formBuilder.control<string>('', Validators.required),
      descripcion_es: this.formBuilder.control<string>('', Validators.required),
      nombre_en: this.formBuilder.control<string>('', Validators.required),
      descripcion_en: this.formBuilder.control<string>('', Validators.required),
      nombre_fr: this.formBuilder.control<string>(''),
      descripcion_fr: this.formBuilder.control<string>(''),
      nombre_pt: this.formBuilder.control<string>(''),
      descripcion_pt: this.formBuilder.control<string>(''),
      nombre_it: this.formBuilder.control<string>(''),
      descripcion_it: this.formBuilder.control<string>(''),
      nombre_ja: this.formBuilder.control<string>(''),
      descripcion_ja: this.formBuilder.control<string>(''),
      nombre_ko: this.formBuilder.control<string>(''),
      descripcion_ko: this.formBuilder.control<string>('')
    };
  }

  /**
   * Crea controles de idioma con datos existentes
   * @param element Datos del menú existente
   * @returns Objeto con controles de idioma poblados
   */
  private createLanguageControlsFromData(element: MenuData) {
    return {
      nombre_es: this.formBuilder.control<string>(element.nombre_es || '', Validators.required),
      descripcion_es: this.formBuilder.control<string>(element.descripcion_es || '', Validators.required),
      nombre_en: this.formBuilder.control<string>(element.nombre_en || '', Validators.required),
      descripcion_en: this.formBuilder.control<string>(element.descripcion_en || '', Validators.required),
      nombre_fr: this.formBuilder.control<string>(element.nombre_fr || ''),
      descripcion_fr: this.formBuilder.control<string>(element.descripcion_fr || ''),
      nombre_pt: this.formBuilder.control<string>(element.nombre_pt || ''),
      descripcion_pt: this.formBuilder.control<string>(element.descripcion_pt || ''),
      nombre_it: this.formBuilder.control<string>(element.nombre_it || ''),
      descripcion_it: this.formBuilder.control<string>(element.descripcion_it || ''),
      nombre_ja: this.formBuilder.control<string>(element.nombre_ja || ''),
      descripcion_ja: this.formBuilder.control<string>(element.descripcion_ja || ''),
      nombre_ko: this.formBuilder.control<string>(element.nombre_ko || ''),
      descripcion_ko: this.formBuilder.control<string>(element.descripcion_ko || ''),
    };
  }

  /**
   * Carga datos del menú y vuelo en paralelo
   * @param searchParams Parámetros de búsqueda del menú
   */
  private loadFlightData(searchParams: SearchMenu): void {
    this.isLoading.set(true);
    this.clearError();

    forkJoin({
      menuDetail: this.menuService.getMenuDetail(searchParams),
      flightData: this.rutaVueloService.getFlightByCode()
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(({ menuDetail, flightData }) => {
          if (menuDetail.status !== 200) {
            throw new Error('Error al cargar detalles del menú');
          }
          if (flightData.status !== 200) {
            throw new Error('Error al cargar datos de vuelo');
          }
          return { menuDetail, flightData };
        }),
        catchError(error => {
          this.handleError('Error al cargar datos', error);
          return EMPTY;
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(({ menuDetail, flightData }) => {
        this.dataMenu.set(menuDetail.data.data);

        const flight = flightData.data.find(
          (f: VueloData) => f.flightNumber === searchParams.flightNumber
        );

        if (!flight) {
          this.setError('No se encontró información del vuelo');
          return;
        }

        this.dataFlightsByCode.set(flight);
        this.initializeForm();
      });
  }

  /**
   * Inicializa el formulario con datos cargados y configura imágenes
   */
  private initializeForm(): void {
    const flightData = this.dataFlightsByCode();
    if (!flightData) return;

    this.dataMenu().forEach(element => {
      const imageName = this.extractImageName(element.rutaImage);
      const platilloForm = this.createPlatilloFormFromData(element, flightData, imageName);
      this.platilloArray.push(platilloForm);
    });

    // Load images after form initialization
    setTimeout(() => {
      this.dataMenu().forEach((element, index) => {
        if (element.rutaImage) {
          element.rutaImage = `${preconnect}/${element.rutaImage}`;
          this.loadImage(index, element.rutaImage);
        }
      });
    });
  }

  /**
   * Extrae el nombre del archivo de una ruta de imagen
   * @param rutaImage Ruta completa de la imagen
   * @returns Nombre del archivo o valor por defecto
   */
  private extractImageName(rutaImage: string | null): string {
    if (!rutaImage) return DEFAULT_IMAGE_NAME;
    const segments = rutaImage.split('/');
    return segments[segments.length - 1];
  }

  /**
   * Encuentra el código correspondiente en un array basado en coincidencias
   * @param codigo Código a buscar
   * @param arrayCode Array de códigos disponibles
   * @returns Código encontrado o string vacío
   */
  private selectCode(codigo: string, arrayCode: string[]): string {
    return arrayCode.find(code => codigo.includes(code)) ?? '';
  }

  /**
   * Extrae el ciclo del código SPML
   * @param codigo Código SPML
   * @param flightData Datos de vuelo
   * @returns Número de ciclo o undefined
   */
  private selectCiclo(codigo: string, flightData: VueloData): number | undefined {
    return Number(flightData.cycle.find(cycle => codigo.includes(cycle.toString())));
  }

  /**
   * Maneja la eliminación de platillos en backend y frontend
   * @param platilloId ID del platillo en base de datos
   * @param index Índice del platillo en el formulario
   */
  private handlePlatilloDelete(platilloId: number, index: number): void {
    if (platilloId !== 0) {
      this.menuService.deleteSaucer(platilloId)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(error => {
            console.error('Error al eliminar platillo:', error);
            return of({ status: 500 });
          })
        )
        .subscribe(response => {
          if (response.status === 200) {
            console.log('Platillo eliminado exitosamente');
          }
        });
    }
    this.platilloArray.removeAt(index);
  }

  /**
   * Valida si un archivo tiene extensión JPG/JPEG
   * @param file Archivo a validar
   * @returns true si es válido
   */
  private isValidImageFile(file: File): boolean {
    return VALID_IMAGE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
  }

  /**
   * Valida dimensiones de imagen y la procesa si es válida
   * @param file Archivo de imagen
   * @param index Índice del platillo
   */
  private validateAndProcessImage(file: File, index: number): void {
    const img = new Image();

    img.onload = () => {
      if (img.width !== IMAGE_DIMENSIONS.width || img.height !== IMAGE_DIMENSIONS.height) {
        alert(`La imagen debe ser de ${IMAGE_DIMENSIONS.width}x${IMAGE_DIMENSIONS.height} píxeles`);
        URL.revokeObjectURL(img.src);
        return;
      }

      this.processImageFile(file, index);
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      alert('Error al cargar la imagen');
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  }

  /**
   * Procesa archivo de imagen convirtiéndolo a Base64
   * @param file Archivo de imagen
   * @param index Índice del platillo
   */
  private processImageFile(file: File, index: number): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const codigoAlimento = this.platilloArray.at(index).controls.codigoAlimento.value;

      this.platilloArray.at(index).patchValue({
        image: base64,
        nombreImg: `${codigoAlimento}.jpg`
      });

      this.loadImage(index, base64);
    };

    reader.onerror = () => {
      alert('Error al procesar la imagen');
    };

    reader.readAsDataURL(file);
  }

  /**
   * Carga una imagen en un elemento HTML específico
   * @param index Índice del platillo
   * @param image URL o Base64 de la imagen
   */
  private loadImage(index: number, image: string): void {
    const imgId = `img-${index}`;
    const imgElement = document.getElementById(imgId) as HTMLImageElement;

    if (imgElement) {
      imgElement.src = image;
    }
  }

  /**
   * Muestra un mensaje al usuario
   * @param message Mensaje a mostrar
   */
  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  /**
   * Establece un estado de error con mensaje
   * @param message Mensaje de error
   */
  private setError(message: string): void {
    this.hasError.set(true);
    this.errorMessage.set(message);
  }

  /**
   * Limpia el estado de error
   */
  private clearError(): void {
    this.hasError.set(false);
    this.errorMessage.set('');
  }

  /**
   * Maneja errores de forma centralizada con contexto
   * @param context Contexto donde ocurrió el error
   * @param error Error capturado
   */
  private handleError(context: string, error: unknown): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`${context}:`, error);
    this.setError(`${context}: ${message}`);
  }
}

