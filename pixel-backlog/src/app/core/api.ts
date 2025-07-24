// src/app/core/api.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, map, shareReplay, first, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiGame {
  id: number;
  name: string;
  background_image: string;
  genres: { name: string }[];
}

interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);

  // ATENÇÃO: SUBSTITUA PELO URL DA SUA FUNÇÃO
  private readonly FUNCTION_URL = 'https://us-central1-dan-backlog.cloudfunctions.net/getIgdbToken';
  private readonly IGDB_API_URL = '/api/v4';

  private authToken$: Observable<string>;

  constructor() {
    this.authToken$ = this.getAuthToken().pipe(
      shareReplay(1)
    );
  }

  // ESTE MÉTODO AGORA CHAMA A NOSSA FIREBASE FUNCTION
  private getAuthToken(): Observable<string> {
    if (!this.FUNCTION_URL.startsWith('https')) {
      console.error('URL da Firebase Function não configurado no api.ts');
      return of('');
    }

    return this.http.post<TwitchAuthResponse>(this.FUNCTION_URL, {}).pipe(
      map(response => response.access_token),
      catchError(err => {
        console.error('Erro ao chamar a Firebase Function para obter o token:', err);
        return of('');
      })
    );
  }

  // O resto do serviço continua igual, mas agora usará o token obtido pela função
  searchGames(query: string, platforms?: string): Observable<{ results: ApiGame[] }> {
    if (!query.trim()) {
      return of({ results: [] });
    }

    return this.authToken$.pipe(
      first(),
      switchMap(token => {
        if (!token) return of({ results: [] });

        const headers = new HttpHeaders({
          'Client-ID': environment.twitch.clientId,
          'Authorization': `Bearer ${token}`
        });

        let body = `
          search "${query}";
          fields name, cover.url, genres.name;
          limit 15;
          where version_parent = null & category = 0;
        `;
        if (platforms) {
          body += ` & platforms = (${platforms});`;
        }

        return this.http.post<any[]>(`${this.IGDB_API_URL}/games`, body, { headers }).pipe(
          map(this.mapIgdbResponseToApiGame),
          catchError(err => {
            console.error('Erro ao buscar jogos na IGDB:', err);
            return of({ results: [] });
          })
        );
      })
    );
  }

  getDlcsForGame(gameId: number): Observable<{ results: ApiGame[] }> {
    return this.authToken$.pipe(
      first(),
      switchMap(token => {
        if (!token) return of({ results: [] });

        const headers = new HttpHeaders({
          'Client-ID': environment.twitch.clientId,
          'Authorization': `Bearer ${token}`
        });

        const body = `
          fields expansions.name, expansions.cover.url, expansions.genres.name;
          where id = ${gameId};
        `;

        return this.http.post<any[]>(`${this.IGDB_API_URL}/games`, body, { headers }).pipe(
          map(response => {
            if (response && response.length > 0 && response[0].expansions) {
              return this.mapIgdbResponseToApiGame(response[0].expansions);
            }
            return { results: [] };
          }),
          catchError(err => {
            console.error('Erro ao buscar DLCs na IGDB:', err);
            return of({ results: [] });
          })
        );
      })
    );
  }

  private mapIgdbResponseToApiGame(response: any[]): { results: ApiGame[] } {
    const mappedResults = response.map(game => ({
      id: game.id,
      name: game.name,
      background_image: game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.url.split('/').pop()}`.replace('jpg', 'png') : '',
      genres: game.genres || []
    }));
    return { results: mappedResults };
  }
}