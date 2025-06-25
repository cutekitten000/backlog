import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true; // Usuário logado, permite acesso
      }
      // Usuário não logado, redireciona para a página de login
      router.navigate(['/login']);
      return false;
    })
  );
};