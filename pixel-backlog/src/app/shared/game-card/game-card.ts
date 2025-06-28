// src/app/shared/game-card/game-card.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGame } from '../../models/user-game';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss'
})
export class GameCard {
  @Input({ required: true }) game!: UserGame;

  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<void>();
  @Output() details = new EventEmitter<void>();

  /**
   * Calcula a percentagem de progresso das conquistas.
   * @returns A percentagem (0 a 100) ou 0 se não houver conquistas.
   */
  get achievementProgress(): number {
    const total = this.game.achievementsTotal ?? 0;
    const gotten = this.game.achievementsGotten ?? 0;

    if (total === 0) {
      return 0;
    }
    return (gotten / total) * 100;
  }

  formatDate(date: Timestamp | undefined): string {
    if (!date || !(date instanceof Timestamp)) {
      return '';
    }
    return new Date(date.toMillis()).toLocaleDateString('pt-PT');
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    if (this.game.id) {
      this.delete.emit(this.game.id);
    }
  }
}