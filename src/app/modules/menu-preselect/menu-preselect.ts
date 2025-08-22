import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-menu-preselect',
  imports: [CommonModule,RouterOutlet,MatIconModule
  ],
  templateUrl: './menu-preselect.html',
  styleUrl: './menu-preselect.scss',
})
export class MenuPreselect implements OnInit {
  ngOnInit(): void {
  }
}


