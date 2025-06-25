import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  // Expõe o estado do usuário como um Observable
  readonly user$ = user(this.auth);

  async login(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error("Erro no login:", error);
      // Aqui você pode usar um Toast/Snackbar para mostrar o erro
    }
  }

  logout() {
    signOut(this.auth).then(() => this.router.navigate(['/login']));
  }
}