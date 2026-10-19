/** A category that can be assigned to an event. */
export interface Category {
  id: number;
  name: string;
  description?: string;
}
/** Organisation data used by the administrator event form. */
export interface Organisation {
  id: number;
  name: string;
  mission: string;
  email: string;
  phone: string;
}
/** A registration displayed in the administrator event details. */
export interface Registration {
  id: number;
  eventId: number;
  fullName: string;
  email: string;
  phone: string;
  ticketCount: number;
  registeredAt: string;
}
/** Event data returned by the administrator API. */
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
/** Payload sent when an administrator creates or updates an event. */
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
