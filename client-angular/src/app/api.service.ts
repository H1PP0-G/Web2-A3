import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CharityEvent, Organisation, Registration, WeatherForecast } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = location.port === '4200' ? 'http://localhost:3030/api' : '/api';
  categories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.apiBase}/categories`); }
  organisation(): Observable<Organisation[]> { return this.http.get<Organisation[]>(`${this.apiBase}/organisations`); }
  events(filters: { date?: string; location?: string; category?: number } = {}): Observable<{ count: number; events: CharityEvent[] }> {
    let params = new HttpParams();
    if (filters.date) params = params.set('date', filters.date);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.category) params = params.set('category', filters.category);
    return this.http.get<{ count: number; events: CharityEvent[] }>(`${this.apiBase}/events`, { params });
  }
  event(id: number): Observable<CharityEvent> { return this.http.get<CharityEvent>(`${this.apiBase}/events/${id}`); }
  register(payload: { eventId: number; fullName: string; email: string; phone: string; ticketCount: number }): Observable<Registration> { return this.http.post<Registration>(`${this.apiBase}/registrations`, payload); }
  weather(event: CharityEvent): Observable<WeatherForecast> {
    const params = new HttpParams().set('latitude', event.latitude).set('longitude', event.longitude).set('date', event.date);
    return this.http.get<WeatherForecast>(`${this.apiBase}/weather`, { params });
  }
}
