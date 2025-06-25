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
  // Recebe os dados completos do jogo a ser exibido
  @Input({ required: true }) game!: UserGame;

  // Emite um evento para o dashboard quando o botão de apagar é clicado
  @Output() delete = new EventEmitter<string>();
  // Emite um evento para o dashboard quando o botão de editar é clicado
  @Output() edit = new EventEmitter<void>();

  /**
   * Formata uma data do tipo Timestamp do Firebase para uma string legível (DD/MM/AAAA).
   * @param date O Timestamp a ser formatado.
   * @returns A data formatada ou uma string vazia se a data for inválida.
   */
  formatDate(date: Timestamp | undefined): string {
    if (!date || !(date instanceof Timestamp)) {
      return '';
    }
    // Usando 'pt-PT' para o formato Dia/Mês/Ano
    return new Date(date.toMillis()).toLocaleDateString('pt-PT');
  }

  /**
   * Emite o evento para apagar o jogo, passando o seu ID.
   * A propagação do evento é interrompida para evitar que o clique afete outros elementos.
   * @param event O evento de clique do rato.
   */
  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    if (this.game.id) {
      this.delete.emit(this.game.id);
    }
  }
}