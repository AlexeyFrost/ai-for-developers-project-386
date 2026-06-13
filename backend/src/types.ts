export interface Owner {
  id: string;
  name: string;
  description?: string;
  timezone: string;
}

export interface EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export type SlotStatus = 'available' | 'booked';

export interface Slot {
  startTime: string;
  endTime: string;
  status: SlotStatus;
}

export interface Booking {
  id: string;
  eventType: EventType;
  guestName: string;
  guestEmail: string;
  guestNote?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  guestNote?: string;
  startTime: string;
}

export interface CreateEventTypeRequest {
  title: string;
  description: string;
  durationMinutes: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: string[];
}
