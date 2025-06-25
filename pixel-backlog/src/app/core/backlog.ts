// src/app/core/backlog.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth'; // Importa o 'user' para reatividade
import {
  Firestore,
  Timestamp,
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
export type FilterStatus = 'Jogando' | 'Em espera' | 'Zerado' | 'Dropado' | 'Platinado' | 'Vou platinar' | 'Todos';

@Injectable({
  providedIn: 'root'
})
export class Backlog {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);


  /**
   * Verifica se um jogo, identificado pelo seu ID da API, já existe no backlog.
   * @param apiGameId O ID único do jogo vindo da API RAWG.
   * @returns `true` se o jogo já existir, `false` caso contrário.
   */
  public isGameInBacklog(apiGameId: number): boolean {
    // Usa o valor atual do sinal 'games' para a verificação
    return this.games().some(game => game.apiGameId === apiGameId);
  }


  // Abordagem Reativa Corrigida:
  // Este Observable reage automaticamente a logins e logouts.
  private userGames$: Observable<UserGame[]> = user(this.auth).pipe(
    switchMap(currentUser => {
      // Se um utilizador estiver autenticado...
      if (currentUser) {
        const gamesCollection = collection(this.firestore, 'games');
        const q = query(gamesCollection, where('userId', '==', currentUser.uid));
        // ... a chamada ao `collectionData` é feita aqui, dentro do contexto correto.
        return collectionData(q, { idField: 'id' }) as Observable<UserGame[]>;
      } else {
        // Se não houver utilizador, retorna um fluxo com um array vazio.
        return of([]);
      }
    })
  );

  // Sinais para gerir o estado na UI
  private games = signal<UserGame[]>([]);
  public filter = signal<FilterStatus>('Jogando'); // O filtro padrão é "Jogando"

  // Sinal computado que cria a lista de jogos filtrada e ordenada
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
    // No construtor, apenas subscrevemos ao fluxo de dados principal.
    this.userGames$.subscribe(games => {
      this.games.set(games);
    });
  }

  /**
   * Adiciona um novo jogo à coleção do utilizador no Firestore.
   */
  async addGame(game: Omit<UserGame, 'id' | 'userId' | 'addedAt'>) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.error("Tentativa de adicionar jogo sem utilizador autenticado.");
      return;
    }

    const newGame: Omit<UserGame, 'id'> = {
      ...game,
      userId: currentUser.uid,
      addedAt: Timestamp.fromDate(new Date())
    };
    const gamesCollection = collection(this.firestore, 'games');
    await addDoc(gamesCollection, newGame);
  }

  /**
   * Apaga um jogo do Firestore.
   */
  async deleteGame(gameId: string) {
    if (!gameId) return;
    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    await deleteDoc(gameDocRef);
  }

  /**
   * Atualiza os dados de um jogo existente no Firestore.
   */
  async updateGame(gameId: string, dataToUpdate: Partial<UserGame>) {
    if (!gameId) return;
    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    await updateDoc(gameDocRef, dataToUpdate);
  }
}