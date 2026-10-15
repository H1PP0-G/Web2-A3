import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { CharityEvent, Organisation } from './models';

@Component({
  selector: 'app-home', imports: [CommonModule, RouterLink],
  template: `
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Local action. Lasting impact.</p><h1>Give time.<br><em>Create change.</em></h1><p class="hero-lede">Join thoughtful people across Australia who turn one event into a brighter future for someone else.</p><a class="button button-light" routerLink="/search">Explore events <span>→</span></a></div><div class="hero-art"></div></section>
    <section class="intro section-shell"><div><p class="eyebrow coral">Our mission</p><h2>Small moments.<br>Meaningful momentum.</h2></div><div class="intro-text"><p>{{ mission }}</p><a class="text-link" routerLink="/search">Find your way to help <span>↗</span></a></div></section>
    <section class="events-band"><div class="section-shell"><div class="section-heading"><div><p class="eyebrow coral">On the calendar</p><h2>Make a date with impact</h2></div><a class="text-link" routerLink="/search">View all events <span>↗</span></a></div><p class="status">{{ loading ? 'Loading upcoming events...' : events.length + ' opportunities to make an impact' }}</p><div class="event-grid"><a class="event-card" *ngFor="let event of events" [routerLink]="['/event', event.id]"><div class="event-image" [style.background-image]="'url(' + image(event) + ')'" [style.background-color]="'#8eb3a1'"><span class="event-tag">{{ event.category.name }}</span><span class="event-status">{{ event.eventStatus }}</span></div><div class="event-card-body"><p class="event-date">{{ date(event.date) }}</p><h3>{{ event.name }}</h3><p class="event-location">{{ event.venue }} · {{ event.city }}</p><div class="card-foot"><span>{{ money(event.ticketPrice) }}</span><span class="text-link">View event ↗</span></div></div></a></div></div></section>
  `,
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  events: CharityEvent[] = []; mission = 'Loading our mission...'; loading = true;
  ngOnInit(): void {
    this.api.organisation().subscribe({ next: (orgs: Organisation[]) => { this.mission = orgs[0]?.mission ?? this.mission; this.changeDetector.markForCheck(); } });
    this.api.events().subscribe({
      next: (data) => { this.events = data.events.slice(0, 4); this.loading = false; this.changeDetector.markForCheck(); },
      error: () => { this.loading = false; this.changeDetector.markForCheck(); },
    });
  }
  image(event: CharityEvent): string { const images: Record<string, string> = { run: 'sunrise%20run_cleanup.jpg', gala: 'women%20and%20children.jpg', music: 'protect%20see.jpg', auction: 'provide%20laptop%20for%20yang%20people.jpg', workshop: 'fix%20tools.jpg', walk: 'Twilight%20Steps%20Challenge.jpg', dinner: 'Table%20of%20Thanks.jpg', mic: 'Open%20Mic%20for%20Mental%20Health.jpg' }; return `assets/${images[event.imageKey] ?? 'home.jpg'}`; }
  date(value: string): string { return new Intl.DateTimeFormat('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)); }
  money(value: number): string { return value === 0 ? 'Free' : `$${value.toFixed(0)}`; }
}
