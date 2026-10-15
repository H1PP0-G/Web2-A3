import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CharityEvent, EventPayload, Organisation } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = location.port === '4300' ? 'http://localhost:3030/api' : '/api';
  categories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.apiBase}/categories`); }
  organisations(): Observable<Organisation[]> { return this.http.get<Organisation[]>(`${this.apiBase}/organisations`); }
  events(): Observable<{ count: number; events: CharityEvent[] }> { return this.http.get<{ count: number; events: CharityEvent[] }>(`${this.apiBase}/admin/events`); }
  event(id: number): Observable<CharityEvent> { return this.http.get<CharityEvent>(`${this.apiBase}/admin/events/${id}`); }
  create(payload: EventPayload): Observable<CharityEvent> { return this.http.post<CharityEvent>(`${this.apiBase}/admin/events`, payload); }
  update(id: number, payload: EventPayload): Observable<CharityEvent> { return this.http.put<CharityEvent>(`${this.apiBase}/admin/events/${id}`, payload); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiBase}/admin/events/${id}`); }
}
