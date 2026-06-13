import type { Booking, CreateBookingRequest, CreateEventTypeRequest, EventType, Owner } from './types';

export const owner: Owner = {
  id: 'owner-alexey',
  name: 'Alexey Morozov',
  description: 'Выберите удобное время для звонка.',
  timezone: 'Europe/Moscow',
};

const eventTypes: EventType[] = [
  {
    id: 'meeting-30',
    title: 'Встреча 30 минут',
    description: 'Короткий созвон для обсуждения вопроса.',
    durationMinutes: 30,
  },
];

const bookings: Booking[] = [];
let nextEventTypeNumber = 1;
let nextBookingNumber = 1;

function makeEventTypeId(): string {
  const id = `event-type-${nextEventTypeNumber}`;
  nextEventTypeNumber += 1;
  return id;
}

function makeBookingId(): string {
  const id = `booking-${nextBookingNumber}`;
  nextBookingNumber += 1;
  return id;
}

export function listEventTypes(): EventType[] {
  return [...eventTypes];
}

export function getEventType(eventTypeId: string): EventType | undefined {
  return eventTypes.find((eventType) => eventType.id === eventTypeId);
}

export function createEventType(payload: CreateEventTypeRequest): EventType {
  const eventType: EventType = {
    id: makeEventTypeId(),
    title: payload.title,
    description: payload.description,
    durationMinutes: payload.durationMinutes,
  };

  eventTypes.push(eventType);
  return eventType;
}

export function deleteEventType(eventTypeId: string): boolean {
  const index = eventTypes.findIndex((eventType) => eventType.id === eventTypeId);
  if (index === -1) return false;

  eventTypes.splice(index, 1);
  return true;
}

export function listAllBookings(): Booking[] {
  return [...bookings];
}

export function listUpcomingBookings(): Booking[] {
  return [...bookings].sort((left, right) => left.startTime.localeCompare(right.startTime));
}

export function createBooking(payload: CreateBookingRequest, eventType: EventType, endTime: string): Booking {
  const booking: Booking = {
    id: makeBookingId(),
    eventType,
    guestName: payload.guestName,
    guestEmail: payload.guestEmail,
    ...(payload.guestNote ? { guestNote: payload.guestNote } : {}),
    startTime: payload.startTime,
    endTime,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  return booking;
}
