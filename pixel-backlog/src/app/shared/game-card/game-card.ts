// src/app/shared/game-card/game-card.ts

import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { UserGame } from '../../models/user-game';
import { Timestamp } from '@angular/fire/firestore';
import { Backlog } from '../../core/backlog';
import { UserDlc } from '../../models/user-dlc';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss'
})
export class GameCard implements OnInit {
  @Input({ required: true }) game!: UserGame;
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<void>();
  @Output() details = new EventEmitter<void>();

  // Injetamos o serviço de backlog para buscar as DLCs
  private backlogService = inject(Backlog);
  // Esta propriedade guardará o fluxo de dados das DLCs
  public dlcs$!: Observable<UserDlc[]>;

  ngOnInit(): void {
    // Ao iniciar o cartão, se ele tiver um ID, busca as suas DLCs
    if (this.game.id) {
      this.dlcs$ = this.backlogService.getDlcsForGame(this.game.id);
    }
  }

  /**
   * Calcula a percentagem de progresso das conquistas.
   */
  get achievementProgress(): number {
    const total = this.game.achievementsTotal ?? 0;
    const gotten = this.game.achievementsGotten ?? 0;
    if (total === 0) {
      return 0;
    }
    return (gotten / total) * 100;
  }

  /**
   * Formata uma data do tipo Timestamp do Firebase para uma string legível.
   */
  formatDate(date: Timestamp | undefined): string {
    if (!date || !(date instanceof Timestamp)) {
      return '';
    }
    return new Date(date.toMillis()).toLocaleDateString('pt-PT');
  }

  /**
   * Emite o evento para apagar o jogo.
   */
  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    if (this.game.id) {
      this.delete.emit(this.game.id);
    }
  }
}