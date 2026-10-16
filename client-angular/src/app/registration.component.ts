import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from './api.service';
import { CharityEvent } from './models';

@Component({ selector: 'app-registration', imports: [CommonModule, ReactiveFormsModule, RouterLink], template: `
  <section class="page-hero"><div class="section-shell"><p class="eyebrow coral">Join the community</p><h1>Register for<br><em>{{ event?.name ?? 'this event' }}.</em></h1><p>Every registration helps turn a shared moment into practical support.</p></div></section>
  <section class="form-layout section-shell"><div class="form-intro" *ngIf="event as item"><p class="eyebrow coral">Your event</p><h2>{{ item.name }}</h2><p>{{ date(item.date) }} · {{ item.venue }}, {{ item.city }}</p><p>{{ money(item.ticketPrice) }} per ticket</p><a class="text-link" [routerLink]="['/event', item.id]">← View event details</a></div><form class="card-form" [formGroup]="form" (ngSubmit)="submit()"><label for="fullName">Full name</label><input id="fullName" formControlName="fullName"><small *ngIf="form.controls.fullName.invalid && form.controls.fullName.touched">Please enter your name.</small><label for="email">Email</label><input id="email" type="email" formControlName="email"><small *ngIf="form.controls.email.invalid && form.controls.email.touched">Enter a valid email address.</small><label for="phone">Phone</label><input id="phone" formControlName="phone"><label for="ticketCount">Tickets</label><input id="ticketCount" type="number" min="1" max="20" formControlName="ticketCount"><button class="button" type="submit" [disabled]="saving">{{ saving ? 'Submitting...' : 'Complete registration' }} <span>→</span></button><p class="success" *ngIf="success">Registration confirmed. We look forward to seeing you.</p><p class="form-error" *ngIf="error">{{ error }}</p></form></section>
`, })
export class RegistrationComponent implements OnInit {
  private readonly api = inject(ApiService); private readonly route = inject(ActivatedRoute); private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({ fullName: ['', [Validators.required, Validators.maxLength(120)]], email: ['', [Validators.required, Validators.email]], phone: ['', [Validators.required, Validators.maxLength(40)]], ticketCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]] });
  event?: CharityEvent; saving = false; success = false; error = '';
  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); if (id) this.api.event(id).subscribe({ next: (item) => this.event = item }); }
  submit(): void { this.error = ''; this.success = false; if (this.form.invalid || !this.event) { this.form.markAllAsTouched(); return; } this.saving = true; this.api.register({ eventId: this.event.id, ...this.form.getRawValue() }).subscribe({ next: () => { this.success = true; this.form.reset({ fullName: '', email: '', phone: '', ticketCount: 1 }); this.saving = false; }, error: (failure) => { this.error = failure.error?.error ?? 'Unable to complete registration.'; this.saving = false; } }); }
  date(value: string): string { return new Intl.DateTimeFormat('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)); }
  money(value: number): string { return value === 0 ? 'Free' : `$${value.toFixed(0)}`; }
}
