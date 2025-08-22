import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FooterModule } from "../shared/footer/footer-module";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    FooterModule
],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Get the size of the entire webpage
    const pageWidth = document.documentElement.scrollWidth;
    const pageHeight = document.documentElement.scrollHeight;
    console.log("Webpage: width:" + pageWidth + ", height: " + pageHeight + ".");
  }

  onSubmit() {
    this.router.navigate(["/alimentos-bebidas"]);
    /*if (this.loginForm.valid) {
      console.log(this.loginForm.value);
    } else {
      this.snackBar.open('Aqui va la validación con Okta', 'Close', {
        duration: 3000
      });
    }*/
  }
}
