import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
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
export class AddGameDialog implements OnInit {
  // Recebe um jogo para editar (opcional)
  @Input() gameToEdit?: UserGame;
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private apiService = inject(Api);
  private backlogService = inject(Backlog);

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
  public isDuplicate = false;
  public isEditMode = false;

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

  ngOnInit(): void {
    if (this.gameToEdit) {
      this.isEditMode = true;
      this.gameForm.patchValue({
        ...this.gameToEdit,
        startDate: this.gameToEdit.startDate ? this.formatDateForInput(this.gameToEdit.startDate) : '',
        finishDate: this.gameToEdit.finishDate ? this.formatDateForInput(this.gameToEdit.finishDate) : ''
      });
      this.selectedGame = {
        id: this.gameToEdit.apiGameId,
        name: this.gameToEdit.title,
        background_image: this.gameToEdit.coverUrl,
        genres: this.gameToEdit.genres.map(name => ({ name }))
      };
    }
  }

  search(term: string): void {
    this.isDuplicate = false;
    this.searchTerms.next(term);
  }

  selectGame(game: ApiGame): void {
    if (this.backlogService.isGameInBacklog(game.id)) {
      this.isDuplicate = true;
      this.searchResults$ = of({ results: [] });
      return;
    }
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

  async onSubmit(): Promise<void> {
    if (this.gameForm.invalid) { return; }
    const formValue = this.gameForm.value;

    if (this.isEditMode && this.gameToEdit?.id) {
      const updatedData: Partial<UserGame> = { ...formValue };
      if (formValue.startDate) updatedData.startDate = Timestamp.fromDate(new Date(formValue.startDate));
      if (formValue.finishDate) updatedData.finishDate = Timestamp.fromDate(new Date(formValue.finishDate));
      await this.backlogService.updateGame(this.gameToEdit.id, updatedData);
    } else {
      const newGame: Omit<UserGame, 'id' | 'userId' | 'addedAt'> = {
        apiGameId: formValue.apiGameId, title: formValue.title, coverUrl: formValue.coverUrl,
        genres: formValue.genres, status: formValue.status, platforms: formValue.platforms,
        playtime: formValue.playtime, isPlatinado: formValue.isPlatinado,
        willPlatinar: formValue.willPlatinar
      };
      if (formValue.startDate) newGame.startDate = Timestamp.fromDate(new Date(formValue.startDate));
      if (formValue.finishDate) newGame.finishDate = Timestamp.fromDate(new Date(formValue.finishDate));
      await this.backlogService.addGame(newGame);
    }
    this.close.emit();
  }

  private formatDateForInput(date: Timestamp): string {
    const d = date.toDate();
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  }
}