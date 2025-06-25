// src/app/shared/add-game-dialog/add-game-dialog.ts

import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

import { Api, ApiGame } from '../../core/api';
import { Backlog } from '../../core/backlog';
import { GamePlatform, GameStatus, UserGame } from '../../models/user-game';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-game-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-game-dialog.html',
  styleUrl: './add-game-dialog.scss'
})
export class AddGameDialog {
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private apiService = inject(Api);
  private backlogService = inject(Backlog);

  // Lógica de busca otimizada
  private searchTerms = new Subject<string>();
  public isSearching = false;
  public searchResults$ = this.searchTerms.pipe(
    debounceTime(600),
    distinctUntilChanged(),
    filter(term => term.length > 2 || term.length === 0),
    tap(() => this.isSearching = true),
    switchMap((term: string) => term ? this.apiService.searchGames(term) : of({ results: [] })),
    tap(() => this.isSearching = false)
  );

  public selectedGame: ApiGame | null = null;
  public gameForm: FormGroup;
  public isDuplicate = false; // Controla a mensagem de erro de duplicado

  // Opções para os formulários
  public statuses: GameStatus[] = ['Jogando', 'Em espera', 'Zerado', 'Dropado'];
  public platforms: GamePlatform[] = ['Steam', 'Gamepass', 'Jack Sparrow', 'Outros'];

  constructor() {
    this.gameForm = this.fb.group({
      apiGameId: [null, Validators.required],
      title: ['', Validators.required],
      coverUrl: [''],
      genres: [[]],
      status: ['Jogando', Validators.required],
      platforms: [[], Validators.required],
      playtime: [''],
      startDate: [''],
      finishDate: [''],
      isPlatinado: [false],
      willPlatinar: [false]
    });
  }

  // Ativado a cada letra digitada na busca
  search(term: string): void {
    this.isDuplicate = false; // Limpa o erro ao pesquisar novamente
    this.searchTerms.next(term);
  }

  // Ativado quando um jogo é selecionado dos resultados
  selectGame(game: ApiGame): void {
    // Verifica se o jogo já existe no backlog
    if (this.backlogService.isGameInBacklog(game.id)) {
      this.isDuplicate = true;
      this.searchResults$ = of({ results: [] });
      return;
    }

    // Se não for um duplicado, continua
    this.isDuplicate = false;
    this.selectedGame = game;
    this.searchResults$ = of({ results: [] });

    this.gameForm.patchValue({
      apiGameId: game.id,
      title: game.name,
      coverUrl: game.background_image,
      genres: game.genres.map(g => g.name)
    });
  }

  // Ativado ao submeter o formulário final
  async onSubmit(): Promise<void> {
    if (this.gameForm.invalid) {
      return;
    }

    const formValue = this.gameForm.value;

    const newGame: Omit<UserGame, 'id' | 'userId' | 'addedAt'> = {
      apiGameId: formValue.apiGameId,
      title: formValue.title,
      coverUrl: formValue.coverUrl,
      genres: formValue.genres,
      status: formValue.status,
      platforms: formValue.platforms,
      playtime: formValue.playtime,
      isPlatinado: formValue.isPlatinado,
      willPlatinar: formValue.willPlatinar,
    };

    // Adiciona as datas apenas se tiverem valor, evitando erros do Firebase
    if (formValue.startDate) {
      newGame.startDate = Timestamp.fromDate(new Date(formValue.startDate));
    }
    if (formValue.finishDate) {
      newGame.finishDate = Timestamp.fromDate(new Date(formValue.finishDate));
    }

    await this.backlogService.addGame(newGame);
    this.close.emit();
  }
}