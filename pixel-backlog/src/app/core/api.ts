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

  searchGames(query: string): Observable<{ results: ApiGame[] }> {
    if (!query.trim()) {
      return new Observable(observer => observer.next({ results: [] }));
    }
    const params = new HttpParams()
      .set('key', this.API_KEY)
      .set('search', query)
      .set('page_size', 5); // Limita a 5 resultados para performance

    return this.http.get<{ results: ApiGame[] }>(`${this.API_URL}/games`, { params });
  }
}