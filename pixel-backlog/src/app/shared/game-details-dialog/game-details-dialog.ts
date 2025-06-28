// src/app/shared/game-details-dialog/game-details-dialog.ts

import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { Api, ApiGame } from '../../core/api';
import { Backlog } from '../../core/backlog';
import { UserDlc } from '../../models/user-dlc';
import { UserGame, GameStatus } from '../../models/user-game'; // Importamos o GameStatus

@Component({
  selector: 'app-game-details-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './game-details-dialog.html',
  styleUrl: './game-details-dialog.scss'
})
export class GameDetailsDialog implements OnInit {
  @Input({ required: true }) game!: UserGame;
  @Output() close = new EventEmitter<void>();

  private backlogService = inject(Backlog);
  private apiService = inject(Api);
  private fb = inject(FormBuilder);

  public dlcs$!: Observable<UserDlc[]>;
  private existingDlcs: UserDlc[] = [];

  // Propriedades para o fluxo de Adicionar DLC (já existentes)
  public isAddingDlc = false;
  public isFetchingDlcs = false;
  public availableDlcs: ApiGame[] = [];
  public dlcForm: FormGroup;

  // NOVO: Lista de status disponíveis para o menu <select>
  public readonly statuses: GameStatus[] = ['Jogando', 'Em espera', 'Zerado', 'Dropado'];

  constructor() {
    this.dlcForm = this.fb.group({
      dlcs: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (this.game.id) {
      this.dlcs$ = this.backlogService.getDlcsForGame(this.game.id);
      this.dlcs$.subscribe(dlcs => this.existingDlcs = dlcs);
    }
  }

  // --- Lógica para Adicionar DLCs (já existente e funcional) ---

  async showDlcSelection(): Promise<void> {
    this.isAddingDlc = true;
    this.isFetchingDlcs = true;
    this.apiService.getDlcsForGame(this.game.apiGameId).subscribe(response => {
      const existingTitles = this.existingDlcs.map(d => d.title);
      const newAvailableDlcs = response.results.filter(apiDlc => !existingTitles.includes(apiDlc.name));
      const formArray = this.dlcForm.get('dlcs') as FormArray;
      formArray.clear();
      newAvailableDlcs.forEach(() => formArray.push(new FormControl(false)));
      this.availableDlcs = newAvailableDlcs;
      this.isFetchingDlcs = false;
    });
  }

  async submitSelectedDlcs(): Promise<void> {
    if (!this.game.id) return;
    const selectedApiDlcs = this.dlcForm.value.dlcs
      .map((checked: boolean, i: number) => checked ? this.availableDlcs[i] : null)
      .filter((dlc: ApiGame | null): dlc is ApiGame => dlc !== null);
    if (selectedApiDlcs.length > 0) {
      const addPromises = selectedApiDlcs.map((dlc: ApiGame) => {
        const dlcData = { title: dlc.name, status: 'Em espera' as const };
        return this.backlogService.addDlc(this.game.id!, dlcData);
      });
      await Promise.all(addPromises);
    }
    this.close.emit();
  }

  cancelAddDlc(): void {
    this.isAddingDlc = false;
    this.availableDlcs = [];
    (this.dlcForm.get('dlcs') as FormArray).clear();
  }

  // --- Lógica para Gerir DLCs Existentes ---

  // NOVO: Método para atualizar o status de uma DLC quando o <select> é alterado
  onDlcStatusChange(newStatus: GameStatus, dlc: UserDlc): void {
    if (this.game.id && dlc.id) {
      this.backlogService.updateDlc(this.game.id, dlc.id, { status: newStatus });
    }
  }

  deleteDlc(dlcId?: string): void {
    if (this.game.id && dlcId) {
      this.backlogService.deleteDlc(this.game.id, dlcId);
    }
  }
}