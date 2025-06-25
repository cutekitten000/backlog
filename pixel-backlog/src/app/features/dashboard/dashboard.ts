// src/app/features/dashboard/dashboard.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { AuthService } from '../../core/auth';
import { Backlog, FilterStatus } from '../../core/backlog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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

  protected filterOptions: FilterStatus[] = ['Jogando', 'Em espera', 'Zerado', 'Dropado', 'Platinado', 'Vou platinar', 'Todos'];

  public isAddDialogOpen = false;

  openAddDialog() { this.isAddDialogOpen = true; }
  closeAddDialog() { this.isAddDialogOpen = false; }

  // NOVO MAPA DE ÍCONES: Apenas os nomes dos Material Symbols
  private iconMap: Record<FilterStatus, string> = {
    'Jogando': 'swords',
    'Em espera': 'hourglass_empty',
    'Zerado': 'military_tech', // Medalha
    'Dropado': 'close',         // X
    'Platinado': 'emoji_events',  // Troféu
    'Vou platinar': 'adjust',
    'Todos': 'buttons_alt'
  };

  // Função simplificada que retorna o nome do ícone
  getIconForStatus(status: FilterStatus): string {
    return this.iconMap[status] || '';
  }
}