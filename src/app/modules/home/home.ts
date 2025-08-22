import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CardItem } from '../../data/home/card-item';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  public cardItems: CardItem[] = [
    {
      title: 'Vuelos',
      icon: '../../../assets/images/Menu/Vuelos.png',
      description: 'Administración del catálogo de los vuelos con sus rutas',
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

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit(url: String) {
    this.router.navigate([url]);
    /*if (this.loginForm.valid) {
      console.log(this.loginForm.value);
    } else {
      this.snackBar.open('Aqui va la validación con Okta', 'Close', {
        duration: 3000
      });
    }*/
  }

}
