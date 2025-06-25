import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';

import { AuthService } from '../../core/auth';
import { Backlog, FilterStatus } from '../../core/backlog';

// Importe os seus componentes de Card e Dialog quando os criar
// import { GameCard } from '../../shared/game-card/game-card';
// import { AddGameDialog } from '../../shared/add-game-dialog/add-game-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Adicione os componentes de Card e Dialog aqui
  imports: [CommonModule /*, GameCard, AddGameDialog */],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // Executa sempre que o número de itens na lista muda
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger(
            '80ms',
            animate(
              '400ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          )
        ], { optional: true })
      ])
    ])
  ]
})
export class Dashboard {
  // Injeção de dependências
  protected authService = inject(AuthService);
  protected backlogService = inject(Backlog);

  // Opções para os botões de filtro
  protected filterOptions: FilterStatus[] = ['Todos', 'Jogando', 'Em espera', 'Zerado', 'Dropado', 'Platinado', 'Vou platinar'];

  // Estado para controlar a visibilidade do diálogo de adição
  public isAddDialogOpen = false;

  openAddDialog(): void {
    this.isAddDialogOpen = true;
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
  }
}
