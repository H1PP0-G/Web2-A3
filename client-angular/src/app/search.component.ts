import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { Category, CharityEvent } from './models';

@Component({
  selector: 'app-search', imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-hero"><div class="section-shell"><p class="eyebrow coral">Find your moment</p><h1>Search events<br><em>that move you.</em></h1><p>Choose a date, place or cause and discover a way to make your next outing count.</p></div></section>
    <section class="search-layout section-shell"><aside class="filter-panel"><p class="eyebrow coral">Refine</p><h2>What feels right?</h2><form [formGroup]="form" (ngSubmit)="search()"><label for="date">Event date</label><input id="date" type="date" formControlName="date"><label for="location">Location</label><input id="location" type="search" placeholder="City or venue" formControlName="location"><label for="category">Category</label><select id="category" formControlName="category"><option value="">All categories</option><option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option></select><button class="button" type="submit">Search events <span>→</span></button><button class="button button-quiet" type="button" (click)="clear()">Clear filters</button></form></aside><div class="results-panel"><div class="results-header"><div><p class="eyebrow coral">Your shortlist</p><h2>Upcoming events</h2></div><strong class="result-count">{{ count }} result{{ count === 1 ? '' : 's' }}</strong></div><p class="status">{{ status }}</p><div class="result-list"><a class="event-card" *ngFor="let event of events" [routerLink]="['/event', event.id]"><div class="event-image" [style.background-image]="'url(' + image(event) + ')'" ><span class="event-tag">{{ event.category.name }}</span><span class="event-status">{{ event.eventStatus }}</span></div><div class="event-card-body"><p class="event-date">{{ date(event.date) }}</p><h3>{{ event.name }}</h3><p class="event-location">{{ event.venue }} · {{ event.city }}</p><div class="card-foot"><span>{{ money(event.ticketPrice) }}</span><span class="text-link">View event ↗</span></div></div></a></div></div></section>
  `,
})
export class SearchComponent implements OnInit {
  private readonly api = inject(ApiService); private readonly fb = inject(FormBuilder);
  readonly form = this.fb.group({ date: [''], location: [''], category: [''] });
  categories: Category[] = []; events: CharityEvent[] = []; count = 0; status = 'Finding events...';
  ngOnInit(): void { this.api.categories().subscribe({ next: (items) => this.categories = items }); this.search(); }
  image(event: CharityEvent): string { const images: Record<string, string> = { run: 'sunrise%20run_cleanup.jpg', gala: 'women%20and%20children.jpg', music: 'protect%20see.jpg', auction: 'provide%20laptop%20for%20yang%20people.jpg', workshop: 'fix%20tools.jpg', walk: 'Twilight%20Steps%20Challenge.jpg', dinner: 'Table%20of%20Thanks.jpg', mic: 'Open%20Mic%20for%20Mental%20Health.jpg' }; return `assets/${images[event.imageKey] ?? 'home.jpg'}`; }
  search(): void { const raw = this.form.getRawValue(); this.status = 'Finding events...'; this.api.events({ date: raw.date || undefined, location: raw.location?.trim() || undefined, category: raw.category ? Number(raw.category) : undefined }).subscribe({ next: (data) => { this.events = data.events; this.count = data.count; this.status = data.count ? '' : 'No events match those filters.'; }, error: (error) => this.status = error.error?.error ?? 'Unable to load events.' }); }
  clear(): void { this.form.reset({ date: '', location: '', category: '' }); this.search(); }
  date(value: string): string { return new Intl.DateTimeFormat('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)); }
  money(value: number): string { return value === 0 ? 'Free' : `$${value.toFixed(0)}`; }
}
