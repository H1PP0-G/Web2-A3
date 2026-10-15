import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { EventFormComponent } from './event-form.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/:id/edit', component: EventFormComponent },
  { path: '**', redirectTo: '' },
];
