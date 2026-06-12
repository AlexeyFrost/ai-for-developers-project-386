import type { Booking, EventType } from './types';

const CREATED_EVENT_TYPES_KEY = 'calendar.createdEventTypes';
const DELETED_EVENT_TYPE_IDS_KEY = 'calendar.deletedEventTypeIds';
const BOOKINGS_KEY = 'calendar.bookings';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const demoStore = {
  getCreatedEventTypes(): EventType[] {
    return readJson<EventType[]>(CREATED_EVENT_TYPES_KEY, []);
  },

  saveCreatedEventType(eventType: EventType): void {
    const eventTypes = demoStore.getCreatedEventTypes().filter((item) => item.id !== eventType.id);
    writeJson(CREATED_EVENT_TYPES_KEY, [...eventTypes, eventType]);
  },

  removeCreatedEventType(eventTypeId: string): void {
    writeJson(
      CREATED_EVENT_TYPES_KEY,
      demoStore.getCreatedEventTypes().filter((eventType) => eventType.id !== eventTypeId),
    );
  },

  getDeletedEventTypeIds(): string[] {
    return readJson<string[]>(DELETED_EVENT_TYPE_IDS_KEY, []);
  },

  markEventTypeDeleted(eventTypeId: string): void {
    const deletedIds = new Set(demoStore.getDeletedEventTypeIds());
    deletedIds.add(eventTypeId);
    writeJson(DELETED_EVENT_TYPE_IDS_KEY, Array.from(deletedIds));
  },

  getBookings(): Booking[] {
    return readJson<Booking[]>(BOOKINGS_KEY, []);
  },

  saveBooking(booking: Booking): void {
    const bookings = demoStore.getBookings().filter((item) => item.id !== booking.id);
    writeJson(BOOKINGS_KEY, [...bookings, booking]);
  },
};
