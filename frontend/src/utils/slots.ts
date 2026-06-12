import type { Booking, EventType, Slot } from '../api/types';
import { addDays, startOfToday, toDateKey } from './date';

const WORKDAY_START_MINUTES = 9 * 60;
const WORKDAY_END_MINUTES = 18 * 60;
const BOOKING_WINDOW_DAYS = 14;
const DEFAULT_OFFSET = '+03:00';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function minutesToTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function toOffsetDateTime(dateKey: string, minutes: number): string {
  return `${dateKey}T${minutesToTime(minutes)}:00${DEFAULT_OFFSET}`;
}

function getMinutesFromIso(value: string): number {
  const [hours, minutes] = value.slice(11, 16).split(':').map(Number);
  return hours * 60 + minutes;
}

function roundUpToGrid(minutes: number, durationMinutes: number): number {
  if (minutes <= WORKDAY_START_MINUTES) return WORKDAY_START_MINUTES;

  const minutesAfterWorkdayStart = minutes - WORKDAY_START_MINUTES;
  return WORKDAY_START_MINUTES + Math.ceil(minutesAfterWorkdayStart / durationMinutes) * durationMinutes;
}

function intervalsOverlap(leftStart: string, leftEnd: string, rightStart: string, rightEnd: string): boolean {
  return Date.parse(leftStart) < Date.parse(rightEnd) && Date.parse(rightStart) < Date.parse(leftEnd);
}

function isSlotBooked(slot: Slot, bookings: Booking[]): boolean {
  return bookings.some((booking) => intervalsOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime));
}

export function buildBookingWindowSlots(eventType: EventType, bookings: Booking[]): Slot[] {
  const today = startOfToday();
  const todayKey = toDateKey(today);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: Slot[] = [];

  for (let dayIndex = 0; dayIndex < BOOKING_WINDOW_DAYS; dayIndex += 1) {
    const dateKey = toDateKey(addDays(today, dayIndex));
    const firstStartMinutes = dateKey === todayKey ? roundUpToGrid(nowMinutes, eventType.durationMinutes) : WORKDAY_START_MINUTES;

    for (
      let startMinutes = firstStartMinutes;
      startMinutes + eventType.durationMinutes <= WORKDAY_END_MINUTES;
      startMinutes += eventType.durationMinutes
    ) {
      const slot: Slot = {
        startTime: toOffsetDateTime(dateKey, startMinutes),
        endTime: toOffsetDateTime(dateKey, startMinutes + eventType.durationMinutes),
        status: 'available',
      };

      slots.push({
        ...slot,
        status: isSlotBooked(slot, bookings) ? 'booked' : 'available',
      });
    }
  }

  return slots;
}

export function createBookingFromPayload(
  eventType: EventType,
  payload: { eventTypeId: string; startTime: string; guestName: string; guestEmail: string; guestNote?: string },
): Booking {
  const startMinutes = getMinutesFromIso(payload.startTime);
  const dateKey = payload.startTime.slice(0, 10);

  return {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType,
    guestName: payload.guestName,
    guestEmail: payload.guestEmail,
    guestNote: payload.guestNote,
    startTime: payload.startTime,
    endTime: toOffsetDateTime(dateKey, startMinutes + eventType.durationMinutes),
    createdAt: new Date().toISOString(),
  };
}

export function hasOverlappingBooking(startTime: string, durationMinutes: number, bookings: Booking[]): boolean {
  const dateKey = startTime.slice(0, 10);
  const startMinutes = getMinutesFromIso(startTime);
  const endTime = toOffsetDateTime(dateKey, startMinutes + durationMinutes);

  return bookings.some((booking) => intervalsOverlap(startTime, endTime, booking.startTime, booking.endTime));
}
