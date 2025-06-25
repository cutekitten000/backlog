import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
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