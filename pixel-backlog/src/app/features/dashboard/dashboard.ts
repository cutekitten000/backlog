// src/app/features/dashboard/dashboard.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';

// Serviços Essenciais
import { AuthService } from '../../core/auth';
import { Backlog, FilterStatus } from '../../core/backlog';

// Componentes Compartilhados que o Dashboard utiliza
import { AddGameDialog } from '../../shared/add-game-dialog/add-game-dialog';
import { GameCard } from '../../shared/game-card/game-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AddGameDialog, // Diálogo para adicionar jogos
    GameCard       // Cartão para exibir cada jogo
  ],
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
  // Injeção de dependências
  protected authService = inject(AuthService);
  protected backlogService = inject(Backlog);

  // Estado que controla a visibilidade do diálogo
  public isAddDialogOpen = false;

  // Lista de filtros na ordem correta
  protected filterOptions: FilterStatus[] = ['Jogando', 'Em espera', 'Zerado', 'Dropado', 'Platinado', 'Vou platinar', 'Todos'];

  // Mapa de ícones do Material Symbols
  private iconMap: Record<FilterStatus, string> = {
    'Jogando': 'swords',
    'Em espera': 'hourglass_empty',
    'Zerado': 'military_tech',
    'Dropado': 'close',
    'Platinado': 'emoji_events',
    'Vou platinar': 'adjust',
    'Todos': 'public'
  };

  // Método para abrir o diálogo
  openAddDialog(): void {
    this.isAddDialogOpen = true;
  }

  // Método para fechar o diálogo
  closeAddDialog(): void {
    this.isAddDialogOpen = false;
  }

  // Função que lida com o evento de apagar vindo do GameCard
  // NOTA: Para uma melhor experiência, seria ideal adicionar um diálogo de confirmação aqui.
  onDeleteGame(gameId: string): void {
    this.backlogService.deleteGame(gameId);
  }

  // Função que retorna o nome do ícone para ser usado no template
  getIconForStatus(status: FilterStatus): string {
    return this.iconMap[status] || 'help';
  }
}