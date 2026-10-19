/** A category available for filtering and event classification. */
export interface Category {
  id: number;
  name: string;
  description?: string;
}
/** Organisation information returned by the API. */
export interface Organisation {
  id: number;
  name: string;
  mission: string;
  email: string;
  phone: string;
  website?: string;
}
/** A person's registration for one charity event. */
export interface Registration {
  id: number;
  eventId: number;
  fullName: string;
  email: string;
  phone: string;
  ticketCount: number;
  registeredAt: string;
}
/** Event data used by public pages and event details. */
export interface CharityEvent {
  id: number;
  name: string;
  purpose: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  ticketPrice: number;
  goalAmount: number;
  raisedAmount: number;
  progressPercent: number;
  imageKey: string;
  status: 'active' | 'suspended';
  eventStatus: 'active' | 'suspended' | 'past';
  category: Category;
  organisation: Organisation;
  registrationCount?: number;
  registrations?: Registration[];
}
/** Request body used when an administrator creates or updates an event. */
export interface EventPayload {
  organisationId: number;
  categoryId: number;
  name: string;
  purpose: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  ticketPrice: number;
  goalAmount: number;
  raisedAmount: number;
  imageKey: string;
  status: 'active' | 'suspended';
}
/** Daily weather data returned by the server-side Open-Meteo integration. */
export interface WeatherForecast {
  date: string;
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}
