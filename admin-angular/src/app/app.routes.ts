import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { EventFormComponent } from './event-form.component';

/** Maps administrator URLs to the dashboard and event form views. */
export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/:id/edit', component: EventFormComponent },
  { path: '**', redirectTo: '' },
];
