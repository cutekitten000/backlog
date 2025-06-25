// src/app/features/login/login.ts

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
// O RouterLink foi removido porque não é usado no template
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule], // Apenas o FormsModule é necessário
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  protected authService = inject(AuthService);

  email = '';
  password = '';

  onSubmit() {
    if (!this.email || !this.password) return;
    this.authService.login(this.email, this.password);
  }
}