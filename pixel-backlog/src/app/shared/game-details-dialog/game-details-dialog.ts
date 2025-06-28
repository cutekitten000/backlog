// src/app/shared/game-details-dialog/game-details-dialog.ts

import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { UserGame } from '../../models/user-game';
import { UserDlc } from '../../models/user-dlc';
import { Backlog } from '../../core/backlog';

@Component({
  selector: 'app-game-details-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-details-dialog.html',
  styleUrl: './game-details-dialog.scss'
})
export class GameDetailsDialog implements OnInit {
  @Input({ required: true }) game!: UserGame;
  @Output() close = new EventEmitter<void>();

  private backlogService = inject(Backlog);

  // Um Observable para receber a lista de DLCs em tempo real
  public dlcs$!: Observable<UserDlc[]>;

  // Estado para controlar o formulário de adição
  public isAddingDlc = false;
  public newDlcTitle = '';

  ngOnInit(): void {
    // Ao iniciar, busca as DLCs para o jogo fornecido
    if (this.game.id) {
      this.dlcs$ = this.backlogService.getDlcsForGame(this.game.id);
    }
  }

  // Adiciona uma nova DLC
  addDlc(): void {
    if (!this.newDlcTitle.trim() || !this.game.id) {
      return;
    }

    const dlcData = {
      title: this.newDlcTitle,
      status: 'Em espera' as const // Status padrão
    };

    this.backlogService.addDlc(this.game.id, dlcData);

    // Limpa o formulário
    this.newDlcTitle = '';
    this.isAddingDlc = false;
  }

  // Apaga uma DLC
  deleteDlc(dlcId?: string): void {
    if (this.game.id && dlcId) {
      this.backlogService.deleteDlc(this.game.id, dlcId);
    }
  }
}