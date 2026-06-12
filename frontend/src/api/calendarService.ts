import { ApiRequestError, apiClient } from './client';
import { demoStore } from './demoStore';
import type { Booking, CreateBookingRequest, CreateEventTypeRequest, EventType, Owner, Slot } from './types';
import { buildBookingWindowSlots, createBookingFromPayload, hasOverlappingBooking } from '../utils/slots';

function mergeEventTypes(apiEventTypes: EventType[], localEventTypes: EventType[]): EventType[] {
  const eventTypesById = new Map<string, EventType>();

  for (const eventType of apiEventTypes) {
    eventTypesById.set(eventType.id, eventType);
  }

  for (const eventType of localEventTypes) {
    eventTypesById.set(eventType.id, eventType);
  }

  const deletedIds = new Set(demoStore.getDeletedEventTypeIds());
  return Array.from(eventTypesById.values()).filter((eventType) => !deletedIds.has(eventType.id));
}

function mergeBookings(apiBookings: Booking[], localBookings: Booking[]): Booking[] {
  const bookingsById = new Map<string, Booking>();

  for (const booking of apiBookings) {
    bookingsById.set(booking.id, booking);
  }

  for (const booking of localBookings) {
    bookingsById.set(booking.id, booking);
  }

  return Array.from(bookingsById.values()).sort((left, right) => left.startTime.localeCompare(right.startTime));
}

function makeEventTypeId(payload: CreateEventTypeRequest): string {
  const slug = payload.title
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);

  return `${slug || 'event-type'}-${Date.now()}`;
}

function getCreatedEventType(response: EventType, payload: CreateEventTypeRequest): EventType {
  const responseMatchesPayload =
    response.title === payload.title &&
    response.description === payload.description &&
    response.durationMinutes === payload.durationMinutes;

  return {
    id: responseMatchesPayload ? response.id : makeEventTypeId(payload),
    title: payload.title,
    description: payload.description,
    durationMinutes: payload.durationMinutes,
  };
}

export const calendarService = {
  getOwner(): Promise<Owner> {
    return apiClient.getOwner();
  },

  async listEventTypes(): Promise<EventType[]> {
    const apiEventTypes = await apiClient.listEventTypes();
    return mergeEventTypes(apiEventTypes, demoStore.getCreatedEventTypes());
  },

  async listAdminEventTypes(): Promise<EventType[]> {
    const apiEventTypes = await apiClient.listAdminEventTypes();
    return mergeEventTypes(apiEventTypes, demoStore.getCreatedEventTypes());
  },

  async getEventType(eventTypeId: string): Promise<EventType> {
    const eventType = (await calendarService.listEventTypes()).find((item) => item.id === eventTypeId);

    if (!eventType) {
      throw new ApiRequestError('Тип записи не найден', 404);
    }

    return eventType;
  },

  async listAdminBookings(): Promise<Booking[]> {
    const apiBookings = await apiClient.listAdminBookings();
    return mergeBookings(apiBookings, demoStore.getBookings());
  },

  async listEventTypeSlots(eventType: EventType): Promise<Slot[]> {
    const [apiSlots, bookings] = await Promise.all([
      apiClient.listEventTypeSlots(eventType.id).catch(() => [] as Slot[]),
      calendarService.listAdminBookings(),
    ]);
    const generatedSlots = buildBookingWindowSlots(eventType, bookings);
    const apiBookedStartTimes = new Set(
      apiSlots.filter((slot) => slot.status === 'booked').map((slot) => slot.startTime),
    );

    return generatedSlots.map((slot) => ({
      ...slot,
      status: apiBookedStartTimes.has(slot.startTime) ? 'booked' : slot.status,
    }));
  },

  async createBooking(payload: CreateBookingRequest, eventType: EventType): Promise<Booking> {
    const bookings = await calendarService.listAdminBookings();

    if (hasOverlappingBooking(payload.startTime, eventType.durationMinutes, bookings)) {
      throw new ApiRequestError('Слот уже занят', 409);
    }

    await apiClient.createBooking(payload);
    const booking = createBookingFromPayload(eventType, payload);
    demoStore.saveBooking(booking);

    return booking;
  },

  async createAdminEventType(payload: CreateEventTypeRequest): Promise<EventType> {
    const response = await apiClient.createAdminEventType(payload);
    const eventType = getCreatedEventType(response, payload);
    demoStore.saveCreatedEventType(eventType);

    return eventType;
  },

  async deleteAdminEventType(eventTypeId: string): Promise<void> {
    await apiClient.deleteAdminEventType(eventTypeId);
    demoStore.removeCreatedEventType(eventTypeId);
    demoStore.markEventTypeDeleted(eventTypeId);
  },
};
