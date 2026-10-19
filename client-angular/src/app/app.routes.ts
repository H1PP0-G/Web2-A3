import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SearchComponent } from './search.component';
import { EventDetailComponent } from './event-detail.component';
import { RegistrationComponent } from './registration.component';
import { AboutComponent } from './about.component';

/** Maps public URLs to the page components rendered inside the app shell. */
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'event/:id', component: EventDetailComponent },
  { path: 'register/:id', component: RegistrationComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' },
];
