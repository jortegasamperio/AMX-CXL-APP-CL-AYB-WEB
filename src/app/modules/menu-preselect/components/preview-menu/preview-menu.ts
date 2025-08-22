import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MenuPreselectService } from '../../../../services/menu-preselect.service';
import { environment } from '../../../../../environments/environment';

const preconnect = environment.preconnect;
@Component({
  selector: 'app-preview-menu',
  templateUrl: './preview-menu.html',
  styleUrl: './preview-menu.scss',
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule,
    NgOptimizedImage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewMenu implements OnInit, AfterViewInit {

  readonly dialogRef = inject(MatDialogRef<PreviewMenu>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  public dataMenu: any[] = [];
  public ruta: string = '';

  close(): void {
    this.dialogRef.close();
  }

  constructor(private menuService: MenuPreselectService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.ruta = `${this.data.departureAirport} -> ${this.data.arriveAirport}`;
  }

  ngAfterViewInit(): void {
    this.getDataMenu();
  }

  getDataMenu(): void {

    let request = {
      flightNumber: this.data.flightNumber, mesCiclo: this.data.mesCiclo,
      annio: this.data.annio
    }
    this.menuService.getMenuDetail(request).subscribe({
      next: (data) => {
        if (data.status == 200) {
          data.data.data.forEach((element: any) => {
            element.rutaImage = `${preconnect}/${element.rutaImage}`;
          });
          this.dataMenu = data.data.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }
}
