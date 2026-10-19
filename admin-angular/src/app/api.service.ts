import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CharityEvent, EventPayload, Organisation } from './models';

@Injectable({ providedIn: 'root' })
/** Provides typed access to administrator event-management endpoints. */
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = location.port === '4300' ? 'http://localhost:3030/api' : '/api';
  /** Returns categories available to the event form. */
  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiBase}/categories`);
  }
  /** Returns organisations available to the event form. */
  organisations(): Observable<Organisation[]> {
    return this.http.get<Organisation[]>(`${this.apiBase}/organisations`);
  }
  /** Loads all events, including past and suspended events. */
  events(): Observable<{ count: number; events: CharityEvent[] }> {
    return this.http.get<{ count: number; events: CharityEvent[] }>(`${this.apiBase}/admin/events`);
  }
  /** Loads one event and its complete registration list. */
  event(id: number): Observable<CharityEvent> {
    return this.http.get<CharityEvent>(`${this.apiBase}/admin/events/${id}`);
  }
  /** Creates a new event using validated form data. */
  create(payload: EventPayload): Observable<CharityEvent> {
    return this.http.post<CharityEvent>(`${this.apiBase}/admin/events`, payload);
  }
  /** Updates an existing event. */
  update(id: number, payload: EventPayload): Observable<CharityEvent> {
    return this.http.put<CharityEvent>(`${this.apiBase}/admin/events/${id}`, payload);
  }
  /** Requests deletion of an event subject to registration constraints. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/admin/events/${id}`);
  }
}
