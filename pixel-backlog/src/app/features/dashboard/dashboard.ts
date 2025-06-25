import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { AuthService } from '../../core/auth';
import { Backlog, FilterStatus } from '../../core/backlog';
import { UserGame } from '../../models/user-game';
import { AddGameDialog } from '../../shared/add-game-dialog/add-game-dialog';
import { GameCard } from '../../shared/game-card/game-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AddGameDialog, GameCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px)' }),
          stagger('50ms',
            animate('550ms ease-out',
              style({ opacity: 1, transform: 'translateY(0px)' })
            )
          )
        ], { optional: true })
      ])
    ])
  ]
})
export class Dashboard {
  protected authService = inject(AuthService);
  protected backlogService = inject(Backlog);

  public isAddDialogOpen = false;
  public gameBeingEdited: UserGame | null = null; // Guarda o jogo a ser editado

  protected filterOptions: FilterStatus[] = ['Jogando', 'Em espera', 'Zerado', 'Dropado', 'Platinado', 'Vou platinar', 'Todos'];

  private iconMap: Record<FilterStatus, string> = {
    'Jogando': 'swords',
    'Em espera': 'hourglass_empty',
    'Zerado': 'military_tech',
    'Dropado': 'close',
    'Platinado': 'emoji_events',
    'Vou platinar': 'adjust',
    'Todos': 'public'
  };

  // Abre o diálogo para adicionar um novo jogo
  openAddDialog(): void {
    this.gameBeingEdited = null;
    this.isAddDialogOpen = true;
  }

  // Abre o diálogo para editar um jogo existente
  openEditDialog(game: UserGame): void {
    this.gameBeingEdited = game;
    this.isAddDialogOpen = true;
  }

  // Fecha o diálogo e limpa o estado de edição
  closeDialog(): void {
    this.isAddDialogOpen = false;
    this.gameBeingEdited = null;
  }

  onDeleteGame(gameId: string): void {
    // Para uma melhor UX, um diálogo de confirmação seria ideal aqui
    this.backlogService.deleteGame(gameId);
  }

  getIconForStatus(status: FilterStatus): string {
    return this.iconMap[status] || 'help';
  }
}