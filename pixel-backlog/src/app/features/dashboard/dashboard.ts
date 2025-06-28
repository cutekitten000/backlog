import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { AuthService } from '../../core/auth';
import { Backlog, FilterStatus } from '../../core/backlog';
import { UserGame } from '../../models/user-game';
import { AddGameDialog } from '../../shared/add-game-dialog/add-game-dialog';
import { GameCard } from '../../shared/game-card/game-card';
import { GameDetailsDialog } from '../../shared/game-details-dialog/game-details-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AddGameDialog, GameCard, GameDetailsDialog],
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
  // CORREÇÃO: Usamos 'undefined' para compatibilidade de tipos
  public gameBeingEdited: UserGame | undefined;
  public isDetailsOpen = false;
  public selectedGameForDetails: UserGame | undefined;

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

  openDetailsDialog(game: UserGame): void {
    this.selectedGameForDetails = game;
    this.isDetailsOpen = true;
  }

  closeDetailsDialog(): void {
    this.isDetailsOpen = false;
    this.selectedGameForDetails = undefined;
  }

  openAddDialog(): void {
    this.gameBeingEdited = undefined;
    this.isAddDialogOpen = true;
  }

  openEditDialog(game: UserGame): void {
    this.gameBeingEdited = game;
    this.isAddDialogOpen = true;
  }

  closeDialog(): void {
    this.isAddDialogOpen = false;
    this.gameBeingEdited = undefined;
  }

  onDeleteGame(gameId: string): void {
    this.backlogService.deleteGame(gameId);
  }

  getIconForStatus(status: FilterStatus): string {
    return this.iconMap[status] || 'help';
  }
}