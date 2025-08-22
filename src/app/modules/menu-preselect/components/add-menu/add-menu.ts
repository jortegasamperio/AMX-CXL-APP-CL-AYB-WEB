import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnInit, signal, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import moment, { Moment } from 'moment';
import 'moment/locale/es-mx';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';

// Data models
import { Form, PlatilloForm } from '../../../../data/menu-preselect/add/form-add-menu';
import { MY_FORMATS } from '../../../../data/menu-preselect/menu-preselect';
import { Menu, RequestMenu } from '../../../../data/menu-preselect/request-menu';
import { VueloData } from '../../../../data/menu-preselect/vuelo-data';
import { TabField } from '../../../../data/menu-preselect/name-fields';

// Services
import { MenuPreselectService } from '../../../../services/menu-preselect.service';
import { RutaVueloService } from '../../../../services/ruta-vuelo.service';

// Constants
const IMAGE_PLACEHOLDER = 'Seleccionar imagen';
const IMAGE_EXTENSION = '.jpg';
const IMAGE_DIMENSIONS = { width: 900, height: 900 } as const;
const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg'] as const;
const MIN_PLATILLOS_REQUIRED = 6;

@Component({
  selector: 'app-add-menu',
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
  templateUrl: './add-menu.html',
  styleUrl: './add-menu.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-mx' },
    provideMomentDateAdapter(MY_FORMATS)
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMenu implements OnInit {
  // Dependencies
  private readonly router = inject(Router);
  private readonly menuService = inject(MenuPreselectService);
  private readonly rutaVueloService = inject(RutaVueloService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  readonly dataFlights = signal<readonly VueloData[]>([]);
  readonly vueloByCode = signal<VueloData | undefined>(undefined);
  readonly panelOpenState = signal(false);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Computed values
  readonly minDate = computed(() =>
    new Date(moment().year(), moment().month(), 1)
  );

  readonly maxDate = computed(() =>
    new Date(moment().year() + 2, 11, 31)
  );

  // Configuration
  readonly nombreCampos: readonly TabField[] = NOMBRE_CAMPOS_TAB;
  form: Form = this.createForm();

  /**
   * Inicializa el componente
   */
  ngOnInit(): void {
    this.loadFlights();
  }

  /**
   * Obtiene el FormArray de platillos
   * @returns FormArray con los controles de platillos
   */
  get platilloArray(): FormArray<PlatilloForm> {
    return this.form.get('platillo') as FormArray<PlatilloForm>;
  }

  /**
   * Maneja el cambio de vuelo seleccionado
   * @param event Evento de cambio del select
   */
  change(event: MatSelectChange): void {
    const vueloData = this.findVueloByNumber(event.value);
    if (!vueloData) return;

    this.vueloByCode.set(vueloData);
    this.updateAllPlatillosWithFlightData(vueloData);
  }

  /**
   * Maneja el cambio de códigos en un platillo
   * @param index Índice del platillo
   */
  changeCodigo(index: number): void {
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
   * @param normalizedMonthAndYear Fecha normalizada
   * @param datepicker Referencia al datepicker
   * @param formControl Control del formulario
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
   * @param index Índice del platillo
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
   * @param index Índice del platillo
   * @returns true si tiene imagen válida
   */
  validateImgForm(index: number): boolean {
    const nombreImg = this.platilloArray.at(index).value.nombreImg;
    return !!(nombreImg && nombreImg !== IMAGE_PLACEHOLDER);
  }

  /**
   * Guarda el menú
   */
  save(): void {
    if (!this.validateFormBeforeSave()) return;
    this.performSave();
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
   * Redirige a la página principal de menús
   */
  redirectMenu(): void {
    this.router.navigate(['/alimentos-bebidas/menu-preselect']);
  }

  /**
   * Función de tracking para ngFor
   * @param index Índice del elemento
   * @returns Índice como identificador único
   */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Crea el formulario principal
   * @returns FormGroup configurado
   */
  private createForm(): Form {
    return this.formBuilder.group({
      flightNumber: this.formBuilder.control(0, Validators.required),
      mesCicloIni: this.formBuilder.control<Moment>(moment(), Validators.required),
      mesCicloFin: this.formBuilder.control<Moment>(moment().add(1, 'months'), Validators.required),
      platillo: this.formBuilder.array<PlatilloForm>([]),
      createdBy: this.formBuilder.control(''),
      creationDate: this.formBuilder.control(new Date())
    });
  }

  /**
   * Crea un formulario para un nuevo platillo
   * @param vuelo Número de vuelo
   * @returns FormGroup configurado para platillo
   */
  private createPlatilloForm(vuelo: number): PlatilloForm {
    const vueloData = this.findVueloByNumber(vuelo);
    const codigoSpml = this.generateCodigoSpml(vueloData);

    return this.formBuilder.group({
      codAlimento: this.formBuilder.control(vueloData?.foodCode[0] ?? '', Validators.required),
      codServicio: this.formBuilder.control(vueloData?.foodService[0] ?? '', Validators.required),
      cabina: this.formBuilder.control(vueloData?.cabyn[0] ?? '', Validators.required),
      ciclo: this.formBuilder.control(vueloData?.cycle[0] ?? '', Validators.required),
      opcion: this.formBuilder.control(vueloData?.option[0] ?? '', Validators.required),
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
      nombreImg: this.formBuilder.control(IMAGE_PLACEHOLDER)
    });
  }

  /**
   * Carga los datos de vuelos
   */
  private loadFlights(): void {
    this.isLoading.set(true);
    this.clearError();

    this.rutaVueloService.getFlightByCode()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.dataFlights.set(response.data);
            this.form.patchValue({ flightNumber: response.data[0].flightNumber });
            this.initializePlatilloIfNeeded();
          }
        },
        error: (error) => this.handleError('Error al cargar vuelos', error)
      });
  }

  /**
   * Inicializa el primer platillo si es necesario
   */
  private initializePlatilloIfNeeded(): void {
    if (this.platilloArray.length === 0) {
      this.addPlatillo();
    }
  }

  /**
   * Actualiza todos los platillos con datos del vuelo
   * @param vueloData Datos del vuelo seleccionado
   */
  private updateAllPlatillosWithFlightData(vueloData: VueloData): void {
    const codigoSpml = this.generateCodigoSpml(vueloData);
    const updateData = {
      codAlimento: vueloData.foodCode[0],
      codServicio: vueloData.foodService[0],
      cabina: vueloData.cabyn[0],
      ciclo: vueloData.cycle[0],
      opcion: vueloData.option[0],
      codPsml: codigoSpml
    };

    this.platilloArray.controls.forEach(control => {
      control.patchValue(updateData);
    });
  }

  /**
   * Actualiza el código SPML de un platillo
   * @param index Índice del platillo
   */
  private updateCodigoSpml(index: number): void {
    const platillo = this.platilloArray.at(index).value;
    const codigoSpml = `${platillo.codAlimento}${platillo.codServicio}${platillo.cabina}${platillo.ciclo}${platillo.opcion}`;
    const nameImg = platillo.nombreImg !== IMAGE_PLACEHOLDER ? `${codigoSpml}${IMAGE_EXTENSION}` : IMAGE_PLACEHOLDER;

    this.platilloArray.at(index).patchValue({
      codPsml: codigoSpml,
      nombreImg: nameImg
    });
  }

  /**
   * Valida el formulario antes de guardar
   * @returns true si es válido
   */
  private validateFormBeforeSave(): boolean {
    if (!this.form.valid) {
      this.setError('El formulario es inválido');
      return false;
    }

    if (this.platilloArray.length < MIN_PLATILLOS_REQUIRED) {
      this.setError(`El menú debe contener al menos ${MIN_PLATILLOS_REQUIRED} platillos`);
      return false;
    }

    return this.validateDateRange();
  }

  /**
   * Valida el rango de fechas
   * @returns true si es válido
   */
  private validateDateRange(): boolean {
    const fechaInicio = this.form.controls.mesCicloIni.value;
    const fechaFin = this.form.controls.mesCicloFin.value;

    if (fechaFin.isSameOrBefore(fechaInicio)) {
      const mensaje = fechaFin.isSame(fechaInicio)
        ? 'La fecha inicio de ciclo y la fecha fin de ciclo no pueden ser iguales'
        : 'La fecha fin de ciclo no puede ser menor que la fecha inicio de ciclo';
      this.setError(mensaje);
      return false;
    }

    return true;
  }

  /**
   * Ejecuta la operación de guardado
   */
  private performSave(): void {
    this.isLoading.set(true);
    this.clearError();

    const menuData = this.buildSaveRequest();

    this.menuService.addMenu(menuData)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.showMessage('Menú guardado exitosamente');
            this.redirectMenu();
          } else {
            this.setError(response.message || 'Error al guardar el menú');
          }
        },
        error: (error) => this.handleError('Error al guardar el menú', error)
      });
  }

  /**
   * Construye el objeto de solicitud para guardar
   * @returns Objeto Menu con los datos
   */
  private buildSaveRequest(): Menu {
    const fechaInicio = this.form.controls.mesCicloIni.value;
    const fechaFin = this.form.controls.mesCicloFin.value;

    const platilloRequest = this.form.controls.platillo.controls.map(control =>
      RequestMenu.PlatilloAddToRequestPlatillo(control)
    );

    return {
      flightNumber: this.form.controls.flightNumber.value,
      mesCicloIni: fechaInicio.format('MMMM/YYYY'),
      mesCicloFin: fechaFin.format('MMMM/YYYY'),
      platillo: platilloRequest,
      createdBy: 'createdBy',
      creationDate: new Date()
    };
  }

  /**
   * Obtiene el archivo del evento
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
   * @returns true si es válida
   */
  private isValidImageFile(file: File): boolean {
    return VALID_IMAGE_EXTENSIONS.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );
  }

  /**
   * Valida y procesa una imagen
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
   * Procesa un archivo de imagen
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
        nombreImg: `${codigoAlimento}${IMAGE_EXTENSION}`
      });

      this.loadImage(index, base64);
    };
    reader.onerror = () => this.setError('Error al procesar la imagen');
    reader.readAsDataURL(file);
  }

  /**
   * Carga una imagen en el elemento HTML
   * @param index Índice del platillo
   * @param base64 Imagen en base64
   */
  private loadImage(index: number, base64: string): void {
    const imgId = `img-${index}`;
    const imgElement = document.getElementById(imgId) as HTMLImageElement;
    if (imgElement) {
      imgElement.src = base64;
    }
  }

  /**
   * Busca un vuelo por número
   * @param vuelo Número de vuelo
   * @returns Datos del vuelo o undefined
   */
  private findVueloByNumber(vuelo: number): VueloData | undefined {
    return this.dataFlights().find(v => v.flightNumber === vuelo);
  }

  /**
   * Genera el código SPML
   * @param vueloData Datos del vuelo
   * @returns Código SPML generado
   */
  private generateCodigoSpml(vueloData?: VueloData): string {
    if (!vueloData) return '';
    return `${vueloData.foodCode[0]}${vueloData.foodService[0]}${vueloData.cabyn[0]}${vueloData.cycle[0]}${vueloData.option[0]}`;
  }

  /**
   * Valida si un índice es válido
   * @param index Índice a validar
   * @returns true si es válido
   */
  private isValidIndex(index: number): boolean {
    return index >= 0 && index < this.platilloArray.length;
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
   * Establece un estado de error
   * @param message Mensaje de error
   */
  private setError(message: string): void {
    this.hasError.set(true);
    this.errorMessage.set(message);
    this.showMessage(message);
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
   * @param context Contexto del error
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