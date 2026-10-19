import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { CharityEvent } from './models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="admin-shell">
      <div class="admin-title">
        <div>
          <p class="eyebrow">Staff console</p>
          <h1>Manage events</h1>
          <p>Review every event, inspect registrations and keep the public calendar accurate.</p>
        </div>
        <a class="button" routerLink="/events/new">Add event <span>+</span></a>
      </div>
      <div class="toolbar">
        <label
          >Show status
          <select [(ngModel)]="statusFilter">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="past">Past</option>
            <option value="suspended">Suspended</option>
          </select></label
        ><span>{{ filtered.length }} of {{ events.length }} events</span>
      </div>
      <p class="message" *ngIf="message">{{ message }}</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Location</th>
              <th>Status</th>
              <th>Registrations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let event of filtered">
              <td>
                <strong>{{ event.name }}</strong
                ><small>{{ event.category.name }}</small>
              </td>
              <td>{{ date(event.date) }}</td>
              <td>
                {{ event.venue }}<small>{{ event.city }}</small>
              </td>
              <td>
                <span
                  class="status-pill"
                  [class.suspended]="event.status === 'suspended'"
                  [class.past]="event.eventStatus === 'past'"
                  >{{ event.eventStatus }}</span
                >
              </td>
              <td>{{ event.registrationCount ?? 0 }}</td>
              <td class="actions">
                <a class="small-button" [routerLink]="['/events', event.id, 'edit']">Edit</a
                ><button class="small-button danger" type="button" (click)="remove(event)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
})
/** Lists all events and exposes administrator status and delete actions. */
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  events: CharityEvent[] = [];
  statusFilter = 'all';
  message = '';
  get filtered(): CharityEvent[] {
    return this.events.filter(
      (event) => this.statusFilter === 'all' || event.eventStatus === this.statusFilter,
    );
  }
  /** Loads the complete administrator event list. */
  ngOnInit(): void {
    this.load();
  }
  /** Refreshes dashboard data after an action or application error. */
  load(): void {
    this.api.events().subscribe({
      next: (data) => {
        this.events = data.events;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.error ?? 'Unable to load events.';
        this.changeDetector.markForCheck();
      },
    });
  }
  /** Deletes an event after user confirmation and reports API failures. */
  remove(event: CharityEvent): void {
    if (!confirm(`Delete ${event.name}?`)) return;
    this.api.delete(event.id).subscribe({
      next: () => {
        this.message = 'Event deleted.';
        this.load();
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.message = error.error?.error ?? 'Unable to delete event.';
        this.changeDetector.markForCheck();
      },
    });
  }
  /** Formats an ISO date for Australian users. */
  date(value: string): string {
    return new Intl.DateTimeFormat('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
  }
}
