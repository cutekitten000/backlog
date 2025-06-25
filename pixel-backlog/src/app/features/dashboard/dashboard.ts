// src/app/features/dashboard/dashboard.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';

// Serviços Essenciais
import { AuthService } from '../../core/auth';
import { Backlog, FilterStatus } from '../../core/backlog';

// Componentes Compartilhados
import { AddGameDialog } from '../../shared/add-game-dialog/add-game-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AddGameDialog // Importa o diálogo para que o HTML possa usá-lo
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

  // Estado que controla se o diálogo de "Adicionar Jogo" está visível
  public isAddDialogOpen = false;

  // Lista de filtros na ordem correta, com "Jogando" em primeiro
  protected filterOptions: FilterStatus[] = ['Jogando', 'Em espera', 'Zerado', 'Dropado', 'Platinado', 'Vou platinar', 'Todos'];

  // Mapa de ícones com os nomes dos Material Symbols
  private iconMap: Record<FilterStatus, string> = {
    'Jogando': 'swords',
    'Em espera': 'hourglass_empty',
    'Zerado': 'military_tech', // Medalha
    'Dropado': 'close',         // X
    'Platinado': 'emoji_events',  // Troféu
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

  // Função que retorna o nome do ícone para ser usado no template
  getIconForStatus(status: FilterStatus): string {
    return this.iconMap[status] || 'help'; // Retorna 'help' como um ícone de fallback
  }
}