import { Timestamp } from '@angular/fire/firestore';
import { GameStatus } from './user-game'; // Reutiliza o mesmo tipo de Status

export interface UserDlc {
  id?: string;
  parentId: string; // O ID do jogo base a que esta DLC pertence
  title: string;
  status: GameStatus;
  playtime?: string;
  finishDate?: Timestamp;
}