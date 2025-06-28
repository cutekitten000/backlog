import { Timestamp } from '@angular/fire/firestore';

export type GameStatus = 'Jogando' | 'Em espera' | 'Zerado' | 'Dropado';
export type GamePlatform = 'Steam' | 'Gamepass' | 'Jack Sparrow' | 'Outros';

export interface UserGame {
  id?: string; // ID do documento no Firestore
  userId: string;
  apiGameId: number;
  title: string;
  coverUrl: string;
  genres: string[];
  status: GameStatus;
  isPlatinado: boolean;
  willPlatinar: boolean;
  playtime: string; // Ex: "125h"
  startDate?: Timestamp;
  finishDate?: Timestamp;
  platforms: GamePlatform[];
  addedAt: Timestamp;

  // NOVOS CAMPOS PARA CONQUISTAS
  achievementsGotten?: number;
  achievementsTotal?: number;
}