import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { FormArray, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, forkJoin, map, of } from 'rxjs';
import moment, { Moment } from 'moment';
import 'moment/locale/es-mx';

// Angular Material
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

// Data models
import { MY_FORMATS } from '../../../../data/menu-preselect/menu-preselect';
import { SearchMenu } from '../../../../data/menu-preselect/search/search-menu';
import { MenuDuplicate, PlatilloForm } from '../../../../data/menu-preselect/duplicate/form-duplicate-menu';
import { Menu, RequestMenu } from '../../../../data/menu-preselect/request-menu';
import { TabField } from '../../../../data/menu-preselect/name-fields';

// Services
import { RutaVueloService } from '../../../../services/ruta-vuelo.service';
import { MenuPreselectService } from '../../../../services/menu-preselect.service';
import { VueloData } from '../../../../data/menu-preselect/vuelo-data';
import { DuplicateMenuData } from '../../../../data/menu-preselect/duplicate/duplicate-menu';

// Constants
const MIN_PLATILLOS_REQUIRED = 6;
const IMAGE_DIMENSIONS = { width: 900, height: 900 } as const;
const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg'] as const;
const DEFAULT_IMAGE_NAME = 'Seleccionar imagen';

interface LoadDataResult {
  readonly menuDetail: { status: number; data: { data: DuplicateMenuData[] } };
  readonly flightData: { status: number; data: VueloData[] };
}

@Component({
  selector: 'app-duplicate-menu',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatDatepickerModule,
    MatToolbarModule
  ],
  templateUrl: './duplicate-menu.html',
  styleUrl: './duplicate-menu.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-mx' },
    provideMomentDateAdapter(MY_FORMATS)
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuplicateMenu implements OnInit {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly rutaVueloService = inject(RutaVueloService);
  private readonly menuService = inject(MenuPreselectService);

  // State signals
  readonly dataFlights = signal<readonly VueloData[]>([]);
  readonly dataMenu = signal<readonly DuplicateMenuData[]>([]);
  readonly menuSearch = signal<SearchMenu | undefined>(undefined);
  readonly panelOpenState = signal(false);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Computed values
  readonly vueloByCode = computed(() => {
    const flights = this.dataFlights();
    const search = this.menuSearch();
    return flights.find(flight => flight.flightNumber === search?.flightNumber);
  });

  readonly minDate = computed(() =>
    new Date(moment().year(), moment().month(), 1)
  );

  readonly maxDate = computed(() =>
    new Date(moment().year() + 2, 11, 31)
  );

  readonly isFormValid = computed(() =>
    this.form.valid && this.platilloArray.length >= MIN_PLATILLOS_REQUIRED
  );

  // Configuration
  readonly nombreCampos: readonly TabField[] = NOMBRE_CAMPOS_TAB;
  readonly form: MenuDuplicate = this.createForm();

  /**
   * Inicializa el componente cargando los datos iniciales
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Obtiene el FormArray de platillos del formulario
   * @returns FormArray con los controles de platillos
   */
  get platilloArray(): FormArray<PlatilloForm> {
    return this.form.controls.platillo;
  }

  /**
   * Maneja el cambio de código en un platillo específico
   * @param index Índice del platillo en el array
   */
  onCodigoChange(index: number): void {
    this.updateCodigoSpml(index);
  }

  /**
   * Agrega un nuevo platillo al formulario
   */
  addPlatillo(): void {
    const vuelo = this.form.value.flightNumber;
    if (vuelo) {
      this.platilloArray.push(this.createPlatilloForm(vuelo));
    }
  }

  /**
   * Elimina un platillo del formulario
   * @param index Índice del platillo a eliminar
   */
  deletePlatillo(index: number): void {
    if (this.isValidIndex(index)) {
      this.platilloArray.removeAt(index);
    }
  }

  /**
   * Establece el mes y año en un control de fecha
   * @param normalizedMonthAndYear Fecha normalizada con mes y año
   * @param datepicker Referencia al datepicker
   * @param formControl Control del formulario a actualizar
   */
  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>,
    formControl: FormControl
  ): void {
    const ctrlValue = formControl.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    formControl.setValue(ctrlValue);
    datepicker.close();
  }

  /**
   * Maneja la selección de archivos de imagen
   * @param event Evento del input file
   * @param index Índice del platillo al que pertenece la imagen
   */
  selectFiles(event: Event, index: number): void {
    const file = this.getFileFromEvent(event);
    if (!file) return;

    if (!this.isValidImageFile(file)) {
      this.setError('Solo se permiten archivos JPG/JPEG');
      return;
    }

    this.validateAndProcessImage(file, index);
  }

  /**
   * Valida si un platillo tiene imagen válida
   * @param index Índice del platillo a validar
   * @returns true si tiene imagen válida, false en caso contrario
   */
  validateImgForm(index: number): boolean {
    const nombreImg = this.platilloArray.at(index).value.nombreImg;
    return !!(nombreImg && nombreImg !== DEFAULT_IMAGE_NAME);
  }

  /**
   * Determina si el botón de guardar debe estar deshabilitado
   * @returns true si el botón debe estar deshabilitado
   */
  isButtonDisabled(): boolean {
    let isDisabled: boolean = true;
    if (this.form.valid && this.platilloArray.length >= MIN_PLATILLOS_REQUIRED) {
      isDisabled = false;
    }
    return isDisabled;
  }

  /**
   * Guarda el menú duplicado
   */
  save(): void {
    if (!this.validateFormBeforeSave()) return;
    this.performSave();
  }

  /**
   * Redirige a la página principal de menús
   */
  redirectMenu(): void {
    this.router.navigate(['/alimentos-bebidas/menu-preselect']);
  }

  /**
   * Función de tracking para el ngFor de vuelos
   * @param index Índice del elemento
   * @returns Índice como identificador único
   */
  trackByFlightIndex(index: number): number {
    return index;
  }

  /**
   * Crea el formulario principal del menú
   * @returns FormGroup configurado para el menú
   */
  private createForm(): MenuDuplicate {
    return this.formBuilder.group({
      flightNumber: this.formBuilder.control(0, Validators.required),
      mesCicloIni: this.formBuilder.control<moment.Moment>(moment(), Validators.required),
      mesCicloFin: this.formBuilder.control<moment.Moment>(moment().add(1, 'months'), Validators.required),
      platillo: this.formBuilder.array<PlatilloForm>([]),
      createdBy: this.formBuilder.control(''),
      creationDate: this.formBuilder.control(new Date())
    });
  }

  /**
   * Crea un formulario para un nuevo platillo
   * @param vuelo Número de vuelo para obtener los códigos disponibles
   * @returns FormGroup configurado para un platillo
   */
  private createPlatilloForm(vuelo: number): PlatilloForm {
    const flight = this.findFlightByNumber(vuelo);
    const codigoSpml = this.generateCodigoSpml(flight);

    return this.formBuilder.group({
      codAlimento: this.formBuilder.control(flight.foodCode[0], Validators.required),
      codServicio: this.formBuilder.control(flight.foodService[0], Validators.required),
      cabina: this.formBuilder.control(flight.cabyn[0], Validators.required),
      ciclo: this.formBuilder.control(flight.cycle[0], Validators.required),
      opcion: this.formBuilder.control(flight.option[0], Validators.required),
      tipoMenu: this.formBuilder.control(''),
      codPsml: this.formBuilder.control({ value: codigoSpml, disabled: true }),
      nombre_es: this.formBuilder.control('', Validators.required),
      descripcion_es: this.formBuilder.control('', Validators.required),
      nombre_en: this.formBuilder.control('', Validators.required),
      descripcion_en: this.formBuilder.control('', Validators.required),
      nombre_fr: this.formBuilder.control(''),
      descripcion_fr: this.formBuilder.control(''),
      nombre_pt: this.formBuilder.control(''),
      descripcion_pt: this.formBuilder.control(''),
      nombre_it: this.formBuilder.control(''),
      descripcion_it: this.formBuilder.control(''),
      nombre_ja: this.formBuilder.control(''),
      descripcion_ja: this.formBuilder.control(''),
      nombre_ko: this.formBuilder.control(''),
      descripcion_ko: this.formBuilder.control(''),
      image: this.formBuilder.control<string | null>(null, Validators.required),
      nombreImg: this.formBuilder.control(DEFAULT_IMAGE_NAME)
    });
  }

  /**
   * Crea un formulario de platillo basado en datos existentes
   * @param element Datos del menú existente
   * @param flight Datos del vuelo
   * @param imageName Nombre de la imagen
   * @returns FormGroup configurado con los datos existentes
   */
  private createPlatilloFormFromData(element: DuplicateMenuData, flight: VueloData, imageName: string): PlatilloForm {
    const codigo = element.codigoAlimento;

    return this.formBuilder.group({
      codAlimento: this.formBuilder.control(this.selectCode(codigo, flight.foodCode), Validators.required),
      codServicio: this.formBuilder.control(this.selectCode(codigo, flight.foodService), Validators.required),
      cabina: this.formBuilder.control(codigo.substring(codigo.length - 3, codigo.length - 2), Validators.required),
      ciclo: this.formBuilder.control(this.selectCiclo(codigo), Validators.required),
      opcion: this.formBuilder.control(codigo.slice(-1), Validators.required),
      tipoMenu: this.formBuilder.control(''),
      codPsml: this.formBuilder.control({ value: codigo, disabled: true }),
      nombre_es: this.formBuilder.control(element.nombre_es, Validators.required),
      descripcion_es: this.formBuilder.control(element.descripcion_es, Validators.required),
      nombre_en: this.formBuilder.control(element.nombre_en, Validators.required),
      descripcion_en: this.formBuilder.control(element.descripcion_en, Validators.required),
      nombre_fr: this.formBuilder.control(element.nombre_fr),
      descripcion_fr: this.formBuilder.control(element.descripcion_fr),
      nombre_pt: this.formBuilder.control(element.nombre_pt),
      descripcion_pt: this.formBuilder.control(element.descripcion_pt),
      nombre_it: this.formBuilder.control(element.nombre_it),
      descripcion_it: this.formBuilder.control(element.descripcion_it),
      nombre_ja: this.formBuilder.control(element.nombre_ja),
      descripcion_ja: this.formBuilder.control(element.descripcion_ja),
      nombre_ko: this.formBuilder.control(element.nombre_ko),
      descripcion_ko: this.formBuilder.control(element.descripcion_ko),
      image: this.formBuilder.control<string | null>(null, Validators.required),
      nombreImg: this.formBuilder.control(imageName)
    });
  }

  /**
   * Carga los datos iniciales del componente
   */
  private loadInitialData(): void {
    this.clearError();
    this.isLoading.set(true);

    this.route.queryParams
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (params) => {
          const searchParams = this.parseQueryParams(params);
          this.menuSearch.set(searchParams);
          this.loadFlightData(searchParams);
        },
        error: (error) => this.handleError('Error al cargar parámetros', error)
      });
  }

  /**
   * Parsea los parámetros de consulta de la URL
   * @param params Parámetros de la URL
   * @returns Objeto SearchMenu con los parámetros parseados
   */
  private parseQueryParams(params: any): SearchMenu {
    return {
      flightNumber: Number(params['f']),
      mesCiclo: params['m'],
      annio: Number(params['a'])
    };
  }

  /**
   * Carga los datos de vuelo y menú
   * @param searchParams Parámetros de búsqueda
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
        map((result: LoadDataResult) => this.validateLoadDataResult(result)),
        catchError(error => {
          this.handleError('Error al cargar datos', error);
          return EMPTY;
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((result) => {
        this.dataMenu.set(result.menuDetail.data.data);
        this.dataFlights.set(result.flightData.data);
        this.initializeForm();
      });
  }

  /**
   * Valida el resultado de la carga de datos
   * @param result Resultado de la carga de datos
   * @returns Resultado validado
   * @throws Error si alguna respuesta no es exitosa
   */
  private validateLoadDataResult(result: LoadDataResult): LoadDataResult {
    if (result.menuDetail.status !== 200) {
      throw new Error('Error al cargar detalles del menú');
    }
    if (result.flightData.status !== 200) {
      throw new Error('Error al cargar datos de vuelo');
    }
    return result;
  }

  /**
   * Inicializa el formulario con los datos cargados
   */
  private initializeForm(): void {
    const search = this.menuSearch();
    const flight = this.vueloByCode();
    const menuData = this.dataMenu();

    if (!this.isValidInitializationData(search, flight, menuData)) return;

    this.form.patchValue({
      flightNumber: Number(search!.flightNumber)
    });

    this.clearPlatilloArray();
    this.populatePlatilloArray(menuData, flight!);
  }

  /**
   * Valida que los datos de inicialización sean válidos
   * @param search Parámetros de búsqueda
   * @param flight Datos del vuelo
   * @param menuData Datos del menú
   * @returns true si los datos son válidos
   */
  private isValidInitializationData(
    search: SearchMenu | undefined,
    flight: VueloData | undefined,
    menuData: readonly DuplicateMenuData[]
  ): boolean {
    return !!(search && flight && menuData.length > 0);
  }

  /**
   * Limpia el array de platillos del formulario
   */
  private clearPlatilloArray(): void {
    while (this.platilloArray.length !== 0) {
      this.platilloArray.removeAt(0);
    }
  }

  /**
   * Puebla el array de platillos con los datos del menú
   * @param menuData Datos del menú
   * @param flight Datos del vuelo
   */
  private populatePlatilloArray(menuData: readonly DuplicateMenuData[], flight: VueloData): void {
    menuData.forEach((element, index) => {
      const imageName = this.getImageName(element.rutaImage);
      const platilloForm = this.createPlatilloFormFromData(element, flight, imageName);
      this.platilloArray.push(platilloForm);

      if (element.rutaImage) {
        setTimeout(() => this.loadImage(index, element.rutaImage!), 0);
      }
    });
  }

  /**
   * Actualiza el código SPML de un platillo
   * @param index Índice del platillo a actualizar
   */
  private updateCodigoSpml(index: number): void {
    const platillo = this.platilloArray.at(index);
    const { codAlimento, codServicio, cabina, ciclo, opcion, nombreImg } = platillo.value;

    const codigoSpml = `${codAlimento}${codServicio}${cabina}${ciclo}${opcion}`;
    const newImageName = nombreImg !== DEFAULT_IMAGE_NAME ? `${codigoSpml}.jpg` : DEFAULT_IMAGE_NAME;

    platillo.patchValue({
      codPsml: codigoSpml,
      nombreImg: newImageName
    });
  }

  /**
   * Valida el formulario antes de guardar
   * @returns true si el formulario es válido
   */
  private validateFormBeforeSave(): boolean {
    if (!this.isFormValid()) {
      const message = this.form.valid
        ? `El menú debe contener al menos ${MIN_PLATILLOS_REQUIRED} platillos`
        : 'El formulario es inválido';
      this.setError(message);
      return false;
    }

    return this.validateDateRange();
  }

  /**
   * Valida el rango de fechas del formulario
   * @returns true si el rango de fechas es válido
   */
  private validateDateRange(): boolean {
    const { mesCicloIni, mesCicloFin } = this.form.controls;

    if (mesCicloFin.value.isSameOrBefore(mesCicloIni.value)) {
      const mensaje = mesCicloFin.value.isSame(mesCicloIni.value)
        ? 'La fecha inicio de ciclo y la fecha fin de ciclo no pueden ser iguales'
        : 'La fecha fin de ciclo no puede ser menor que la fecha inicio de ciclo';
      this.setError(mensaje);
      return false;
    }

    return true;
  }

  /**
   * Valida si un índice es válido para el array de platillos
   * @param index Índice a validar
   * @returns true si el índice es válido
   */
  private isValidIndex(index: number): boolean {
    return index >= 0 && index < this.platilloArray.length;
  }

  /**
   * Ejecuta la operación de guardado
   */
  private performSave(): void {
    this.isLoading.set(true);
    this.clearError();

    const dataRequest = this.buildSaveRequest();

    this.menuService.duplicateMenu(dataRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            console.log('Menú guardado exitosamente');
            alert(response.message);
            this.redirectMenu();
          } else {
            console.error(response.message);
            alert(response.message);
          }
        },
        error: (error) => this.handleError('Error al guardar el menú', error)
      });
  }

  /**
   * Construye el objeto de solicitud para guardar
   * @returns Objeto Menu con los datos del formulario
   */
  private buildSaveRequest(): Menu {
    const { mesCicloIni, mesCicloFin } = this.form.controls;

    const platilloRequest = this.form.controls.platillo.controls.map(control =>
      RequestMenu.PlatilloDuplicateToRequestPlatillo(control)
    );

    return {
      flightNumber: this.form.controls.flightNumber.value,
      mesCicloIni: mesCicloIni.value.format('MMMM/YYYY'),
      mesCicloFin: mesCicloFin.value.format('MMMM/YYYY'),
      platillo: platilloRequest,
      createdBy: 'usuario update',
      creationDate: new Date()
    };
  }

  /**
   * Obtiene el archivo del evento de input
   * @param event Evento del input file
   * @returns Archivo seleccionado o null
   */
  private getFileFromEvent(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] || null;
  }

  /**
   * Valida si un archivo es una imagen válida
   * @param file Archivo a validar
   * @returns true si es una imagen válida
   */
  private isValidImageFile(file: File): boolean {
    return VALID_IMAGE_EXTENSIONS.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );
  }

  /**
   * Valida y procesa una imagen seleccionada
   * @param file Archivo de imagen
   * @param index Índice del platillo
   */
  private validateAndProcessImage(file: File, index: number): void {
    const img = new Image();
    img.onload = () => {
      if (!this.isValidImageDimensions(img)) {
        this.setError(`La imagen debe ser de ${IMAGE_DIMENSIONS.width}x${IMAGE_DIMENSIONS.height} píxeles`);
        return;
      }
      this.processImageFile(file, index);
    };
    img.onerror = () => this.setError('Error al cargar la imagen');
    img.src = URL.createObjectURL(file);
  }

  /**
   * Valida las dimensiones de una imagen
   * @param img Elemento de imagen HTML
   * @returns true si las dimensiones son válidas
   */
  private isValidImageDimensions(img: HTMLImageElement): boolean {
    return img.width === IMAGE_DIMENSIONS.width && img.height === IMAGE_DIMENSIONS.height;
  }

  /**
   * Procesa un archivo de imagen y lo convierte a base64
   * @param file Archivo de imagen
   * @param index Índice del platillo
   */
  private processImageFile(file: File, index: number): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const codigoAlimento = this.platilloArray.at(index).controls.codPsml.value;

      this.platilloArray.at(index).patchValue({
        image: base64,
        nombreImg: `${codigoAlimento}.jpg`
      });

      this.loadImage(index, base64);
    };
    reader.onerror = () => this.setError('Error al procesar la imagen');
    reader.readAsDataURL(file);
  }

  /**
   * Carga una imagen en el elemento HTML correspondiente
   * @param index Índice del platillo
   * @param base64 Imagen en formato base64
   */
  private loadImage(index: number, base64: string): void {
    const imgId = `img-${index}`;
    const imgElement = document.getElementById(imgId) as HTMLImageElement;
    if (imgElement) {
      imgElement.src = base64;
    }
  }

  /**
   * Obtiene el nombre de archivo de una ruta de imagen
   * @param rutaImage Ruta de la imagen
   * @returns Nombre del archivo o nombre por defecto
   */
  private getImageName(rutaImage: string | null): string {
    if (!rutaImage) return DEFAULT_IMAGE_NAME;
    const imageParts = rutaImage.split('/');
    return imageParts[imageParts.length - 1];
  }

  /**
   * Busca un vuelo por su número
   * @param vuelo Número de vuelo
   * @returns Datos del vuelo
   * @throws Error si no se encuentra el vuelo
   */
  private findFlightByNumber(vuelo: number): VueloData {
    const flight = this.dataFlights().find(f => f.flightNumber === vuelo);
    if (!flight) {
      throw new Error(`Flight ${vuelo} not found`);
    }
    return flight;
  }

  /**
   * Genera el código SPML basado en los datos del vuelo
   * @param flight Datos del vuelo
   * @returns Código SPML generado
   */
  private generateCodigoSpml(flight: VueloData): string {
    return `${flight.foodCode[0]}${flight.foodService[0]}${flight.cabyn[0]}${flight.cycle[0]}${flight.option[0]}`;
  }

  /**
   * Selecciona un código de un array basado en coincidencias
   * @param codigo Código a buscar
   * @param arrayCode Array de códigos disponibles
   * @returns Código encontrado o cadena vacía
   */
  private selectCode(codigo: string, arrayCode: readonly string[]): string {
    return arrayCode.find(code => codigo.includes(code)) || '';
  }

  /**
   * Selecciona el ciclo apropiado basado en el código
   * @param codigo Código del platillo
   * @returns Ciclo encontrado o cadena vacía
   */
  private selectCiclo(codigo: string): string {
    const flight = this.vueloByCode();
    if (!flight) return '';
    return flight.cycle.find(cycle => codigo.includes(cycle)) || '';
  }

  /**
   * Establece un estado de error
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
    this.errorMessage.set(null);
  }

  /**
   * Maneja errores de forma centralizada
   * @param context Contexto donde ocurrió el error
   * @param error Error capturado
   */
  private handleError(context: string, error: unknown): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`${context}:`, error);
    this.setError(`${context}: ${message}`);
  }
}

const NOMBRE_CAMPOS_TAB: readonly TabField[] = [
  { tab_name: 'Español', form: [{ control_Name: 'nombre_es', name: 'Nombre de platillo' }, { control_Name: 'descripcion_es', name: 'Descripción' }] },
  { tab_name: 'Inglés', form: [{ control_Name: 'nombre_en', name: 'Nombre de platillo' }, { control_Name: 'descripcion_en', name: 'Descripción' }] },
  { tab_name: 'Francés', form: [{ control_Name: 'nombre_fr', name: 'Nombre de platillo' }, { control_Name: 'descripcion_fr', name: 'Descripción' }] },
  { tab_name: 'Portugués', form: [{ control_Name: 'nombre_pt', name: 'Nombre de platillo' }, { control_Name: 'descripcion_pt', name: 'Descripción' }] },
  { tab_name: 'Italiano', form: [{ control_Name: 'nombre_it', name: 'Nombre de platillo' }, { control_Name: 'descripcion_it', name: 'Descripción' }] },
  { tab_name: 'Japonés', form: [{ control_Name: 'nombre_ja', name: 'Nombre de platillo' }, { control_Name: 'descripcion_ja', name: 'Descripción' }] },
  { tab_name: 'Coreano', form: [{ control_Name: 'nombre_ko', name: 'Nombre de platillo' }, { control_Name: 'descripcion_ko', name: 'Descripción' }] }
] as const;