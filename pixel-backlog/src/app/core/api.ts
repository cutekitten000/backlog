import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiGame {
  id: number;
  name: string;
  background_image: string;
  genres: { name: string }[];
}

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://api.rawg.io/api';
  private readonly API_KEY = environment.rawgApiKey;

  searchGames(query: string, platforms?: string): Observable<{ results: ApiGame[] }> {
    if (!query.trim()) {
      return new Observable(observer => observer.next({ results: [] }));
    }

    // Começamos com os parâmetros básicos
    let params = new HttpParams()
      .set('key', this.API_KEY)
      .set('search', query)
      .set('page_size', 5); // Aumentei para 10 para dar mais opções

    // Se um filtro de plataforma for fornecido, adiciona-o aos parâmetros
    if (platforms) {
      params = params.set('platforms', platforms);
    }

    return this.http.get<{ results: ApiGame[] }>(`${this.API_URL}/games`, { params });
  }

  /**
   * Busca todas as DLCs/expansões para um ID de jogo específico.
   * @param gameId O ID do jogo base na API RAWG.
   */
  getDlcsForGame(gameId: number): Observable<{ results: ApiGame[] }> {
    const params = new HttpParams().set('key', this.API_KEY);
    return this.http.get<{ results: ApiGame[] }>(`${this.API_URL}/games/${gameId}/additions`, { params });
  }

}