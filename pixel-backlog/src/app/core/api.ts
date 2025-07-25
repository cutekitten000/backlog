// Copie e cole este conteúdo em: src/app/core/api.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ApiGame {
  id: number;
  name: string;
  background_image: string;
  genres: { name: string }[];
}

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  // AGORA USAMOS APENAS O CAMINHO RELATIVO
  private readonly API_BASE_URL = '/api/v4';

  searchGames(query: string, platforms?: string): Observable<{ results: ApiGame[] }> {
    if (!query.trim()) {
      return of({ results: [] });
    }

    // A requisição agora é muito mais simples.
    // O backend (Cloud Function) cuida da autenticação.
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    let body = `
      search "${query}";
      fields name, cover.url, genres.name;
      limit 15;
      where version_parent = null & category = 0;
    `;
    if (platforms) {
      body += ` & platforms = (${platforms});`;
    }

    return this.http.post<any[]>(`${this.API_BASE_URL}/games`, body, { headers }).pipe(
      map(this.mapIgdbResponseToApiGame),
      catchError(err => {
        console.error('Erro ao buscar jogos na IGDB:', err);
        return of({ results: [] });
      })
    );
  }

  getDlcsForGame(gameId: number): Observable<{ results: ApiGame[] }> {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    const body = `
      fields expansions.name, expansions.cover.url, expansions.genres.name;
      where id = ${gameId};
    `;

    return this.http.post<any[]>(`${this.API_BASE_URL}/games`, body, { headers }).pipe(
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