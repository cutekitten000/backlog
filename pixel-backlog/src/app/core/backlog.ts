// src/app/core/backlog.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import {
  Firestore, Timestamp, addDoc, collection, collectionData,
  deleteDoc, doc, query, updateDoc, where
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserGame } from '../models/user-game';
import { UserDlc } from '../models/user-dlc';

export type FilterStatus = 'Jogando' | 'Em espera' | 'Zerado' | 'Dropado' | 'Platinado' | 'Vou platinar' | 'Todos';

@Injectable({ providedIn: 'root' })
export class Backlog {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  private userGames$: Observable<UserGame[]> = user(this.auth).pipe(
    switchMap(currentUser => {
      if (currentUser) {
        const gamesCollection = collection(this.firestore, 'games');
        const q = query(gamesCollection, where('userId', '==', currentUser.uid));
        return collectionData(q, { idField: 'id' }) as Observable<UserGame[]>;
      }
      return of([]);
    })
  );

  private games = signal<UserGame[]>([]);
  public filter = signal<FilterStatus>('Jogando');

  public filteredGames = computed(() => {
    const games = this.games().sort((a, b) => b.addedAt.toMillis() - a.addedAt.toMillis());
    const currentFilter = this.filter();
    switch (currentFilter) {
      case 'Todos': return games;
      case 'Platinado': return games.filter(g => g.isPlatinado);
      case 'Vou platinar': return games.filter(g => g.willPlatinar && !g.isPlatinado);
      default: return games.filter(g => g.status === currentFilter);
    }
  });

  constructor() {
    this.userGames$.subscribe(games => {
      this.games.set(games);
    });
  }

  public isGameInBacklog(apiGameId: number): boolean {
    return this.games().some(game => game.apiGameId === apiGameId);
  }

  async addGame(game: Omit<UserGame, 'id' | 'userId' | 'addedAt'>): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) { return null; }
    const newGame: Omit<UserGame, 'id'> = {
      ...game,
      userId: currentUser.uid,
      addedAt: Timestamp.fromDate(new Date())
    };
    const gamesCollection = collection(this.firestore, 'games');
    const docRef = await addDoc(gamesCollection, newGame);
    return docRef.id;
  }

  async updateGame(gameId: string, dataToUpdate: Partial<UserGame>): Promise<void> {
    if (!gameId) return;
    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    await updateDoc(gameDocRef, dataToUpdate);
  }

  async deleteGame(gameId: string): Promise<void> {
    if (!gameId) return;
    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    await deleteDoc(gameDocRef);
  }

  // --- MÉTODOS PARA GERIR AS DLCs ---

  getDlcsForGame(gameId: string): Observable<UserDlc[]> {
    const dlcCollection = collection(this.firestore, `games/${gameId}/dlcs`);
    return collectionData(dlcCollection, { idField: 'id' }) as Observable<UserDlc[]>;
  }

  async addDlc(gameId: string, dlcData: Omit<UserDlc, 'id' | 'parentId'>): Promise<void> {
    const dlcCollection = collection(this.firestore, `games/${gameId}/dlcs`);
    const newDlc = { ...dlcData, parentId: gameId };
    await addDoc(dlcCollection, newDlc);
  }

  async updateDlc(gameId: string, dlcId: string, dlcData: Partial<UserDlc>): Promise<void> {
    if (!gameId || !dlcId) return;
    const dlcDocRef = doc(this.firestore, `games/${gameId}/dlcs/${dlcId}`);
    await updateDoc(dlcDocRef, dlcData);
  }

  async deleteDlc(gameId: string, dlcId: string): Promise<void> {
    if (!gameId || !dlcId) return;
    const dlcDocRef = doc(this.firestore, `games/${gameId}/dlcs/${dlcId}`);
    await deleteDoc(dlcDocRef);
  }
}