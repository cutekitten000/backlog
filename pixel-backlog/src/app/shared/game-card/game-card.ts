// src/app/shared/game-card/game-card.ts

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
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
  // Recebe os dados do jogo do componente pai (Dashboard)
  @Input({ required: true }) game!: UserGame;

  // Emite um evento com o ID do jogo a ser apagado
  @Output() delete = new EventEmitter<string>();
  // Futuramente, podemos adicionar um evento para editar
  // @Output() edit = new EventEmitter<UserGame>();

  // Ícones para os checkboxes
  protected platinadoIcon = 'military_tech';
  protected vouPlatinarIcon = 'adjust';

  /**
   * Formata uma data do tipo Timestamp do Firebase para uma string legível (DD/MM/AAAA).
   * @param date O Timestamp a ser formatado.
   * @returns A data formatada ou uma string vazia se a data for inválida.
   */
  formatDate(date: Timestamp | undefined): string {
    if (!date || !(date instanceof Timestamp)) {
      return '';
    }
    return new Date(date.toMillis()).toLocaleDateString('pt-PT');
  }

  /**
   * Emite o evento para apagar o jogo.
   * A propagação do evento é interrompida para evitar comportamentos inesperados.
   * @param event O evento de clique do rato.
   */
  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    if (this.game.id) {
      this.delete.emit(this.game.id);
    }
  }
}