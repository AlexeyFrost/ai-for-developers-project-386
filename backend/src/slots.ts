import type { Booking, EventType, Slot } from './types';

const WORKDAY_START_MINUTES = 9 * 60;
const WORKDAY_END_MINUTES = 18 * 60;
const BOOKING_WINDOW_DAYS = 14;
const MOSCOW_OFFSET = '+03:00';
const MOSCOW_OFFSET_MINUTES = 3 * 60;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function minutesToTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function formatDateKeyFromUtcDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getTodayDateKey(now = new Date()): string {
  return formatDateKeyFromUtcDate(new Date(now.getTime() + MOSCOW_OFFSET_MINUTES * 60_000));
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return formatDateKeyFromUtcDate(new Date(Date.UTC(year, month - 1, day + days)));
}

export function toOffsetDateTime(dateKey: string, minutes: number): string {
  return `${dateKey}T${minutesToTime(minutes)}:00${MOSCOW_OFFSET}`;
}

export function getMinutesFromIso(value: string): number | null {
  const match = /T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

export function isValidIsoDateTime(value: string): boolean {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
}

export function getDateKeyFromIso(value: string): string {
  return value.slice(0, 10);
}

export function getBookingEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = getMinutesFromIso(startTime);
  if (startMinutes === null) return '';

  return toOffsetDateTime(getDateKeyFromIso(startTime), startMinutes + durationMinutes);
}

export function intervalsOverlap(leftStart: string, leftEnd: string, rightStart: string, rightEnd: string): boolean {
  return Date.parse(leftStart) < Date.parse(rightEnd) && Date.parse(leftEnd) > Date.parse(rightStart);
}

export function isSlotBooked(slot: Slot, bookings: Booking[]): boolean {
  return bookings.some((booking) => intervalsOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime));
}

export function hasOverlappingBooking(startTime: string, endTime: string, bookings: Booking[]): boolean {
  return bookings.some((booking) => intervalsOverlap(startTime, endTime, booking.startTime, booking.endTime));
}

export function isInsideBookingWindow(startTime: string, now = new Date()): boolean {
  const dateKey = getDateKeyFromIso(startTime);
  const todayKey = getTodayDateKey(now);
  const lastDateKey = addDaysToDateKey(todayKey, BOOKING_WINDOW_DAYS - 1);

  return dateKey >= todayKey && dateKey <= lastDateKey;
}

export function isInsideWorkingHours(startTime: string, durationMinutes: number): boolean {
  const startMinutes = getMinutesFromIso(startTime);
  if (startMinutes === null) return false;

  const endMinutes = startMinutes + durationMinutes;
  return startMinutes >= WORKDAY_START_MINUTES && endMinutes <= WORKDAY_END_MINUTES;
}

export function buildSlots(eventType: EventType, bookings: Booking[], now = new Date()): Slot[] {
  const todayKey = getTodayDateKey(now);
  const slots: Slot[] = [];

  for (let dayIndex = 0; dayIndex < BOOKING_WINDOW_DAYS; dayIndex += 1) {
    const dateKey = addDaysToDateKey(todayKey, dayIndex);

    for (
      let startMinutes = WORKDAY_START_MINUTES;
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
