import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { FooterModule } from "../footer/footer-module";
import { Router, RouterOutlet } from '@angular/router';
import { CardItem } from '../../../data/home/card-item';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, FooterModule, MatListModule, RouterOutlet],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar implements OnInit {

  public menuItems: CardItem[] = [
    {
      title: 'Vuelos',
      icon: '../../../assets/images/Menu/Vuelos.png',
      description: 'Administración del catalogo de los vuelos con sus rutas',
      url_view: '/alimentos-bebidas/cat-rutas-vuelo'
    },
    {
      title: 'Correos Electrónicos',
      icon: '../../../assets/images/Menu/Email.jpg',
      description: 'Administración del catálogo de correos electrónicos para los reportes de Meal Preselect',
      url_view: '/alimentos-bebidas/cat-email-report'
    },
    {
      title: 'Códigos SpecialMeal',
      icon: '../../../assets/images/Menu/SpecialMeal.png',
      description: 'Administración del catálogo de códigos de alimentos SpecialMeal',
      url_view: '/alimentos-bebidas/cat-code-special-meal'
    },
    {
      title: 'Códigos Preselect',
      icon: '../../../assets/images/Menu/Preselect.png',
      description: 'Administración del catálogo de códigos de alimentos Preselect',
      url_view: '/alimentos-bebidas/cat-code-preselect'
    },
    {
      title: 'Menú Preselección',
      icon: '../../../assets/images/Menu/Menu.png',
      description: 'Administración de los menús preselect',
      url_view: '/alimentos-bebidas/menu-preselect'
    }
  ];

  dateNow: Date = new Date();

  constructor(private router: Router) {}
  ngOnInit(): void {
  }

  public home(): void {
    this.router.navigate(["/alimentos-bebidas"]);
  }
}
