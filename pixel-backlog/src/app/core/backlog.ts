import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import {
  Firestore,
  Timestamp, // 1. Importar o Timestamp
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserGame } from '../models/user-game';

// Tipagem para os filtros
export type FilterStatus = 'Todos' | 'Jogando' | 'Em espera' | 'Zerado' | 'Dropado' | 'Platinado' | 'Vou platinar';

@Injectable({ providedIn: 'root' })
export class Backlog {
  // Injeção de dependências moderna
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  // Observable que reage à autenticação do utilizador
  private userGames$: Observable<UserGame[]> = user(this.auth).pipe(
    switchMap(user => {
      // Se não houver utilizador, retorna um array vazio
      if (!user) {
        return of([]);
      }
      // Se houver utilizador, busca os jogos associados ao seu UID
      const gamesCollection = collection(this.firestore, 'games');
      const q = query(gamesCollection, where('userId', '==', user.uid));
      return collectionData(q, { idField: 'id' }) as Observable<UserGame[]>;
    })
  );

  // Sinais para reatividade na UI
  private games = signal<UserGame[]>([]);
  public filter = signal<FilterStatus>('Jogando');

  // Sinal computado para a lista filtrada, já ordenada por data de adição
  public filteredGames = computed(() => {
    const games = this.games().sort((a, b) => b.addedAt.toMillis() - a.addedAt.toMillis());
    const currentFilter = this.filter();

    switch (currentFilter) {
      case 'Todos':
        return games;
      case 'Platinado':
        return games.filter(g => g.isPlatinado);
      case 'Vou platinar':
        return games.filter(g => g.willPlatinar && !g.isPlatinado);
      default:
        return games.filter(g => g.status === currentFilter);
    }
  });

  constructor() {
    // Subscreve ao observable de jogos e atualiza o sinal quando os dados mudam
    this.userGames$.subscribe(games => {
      this.games.set(games);
    });
  }

  async addGame(game: Omit<UserGame, 'id' | 'userId' | 'addedAt'>) {
    const user = this.auth.currentUser;
    if (!user) {
      console.error("Utilizador não autenticado. Não é possível adicionar o jogo.");
      return;
    }

    const newGame: Omit<UserGame, 'id'> = {
      ...game,
      userId: user.uid,
      addedAt: Timestamp.fromDate(new Date()) // 2. Usar Timestamp.fromDate() para converter
    };
    const gamesCollection = collection(this.firestore, 'games');
    await addDoc(gamesCollection, newGame);
  }

  async deleteGame(gameId: string) {
    if (!gameId) return;
    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    await deleteDoc(gameDocRef);
  }

  async updateGame(gameId: string, dataToUpdate: Partial<UserGame>) {
    if (!gameId) return;
    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    await updateDoc(gameDocRef, dataToUpdate);
  }
}
