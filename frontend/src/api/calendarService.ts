import { apiClient } from './client';
import type { Booking, CreateBookingRequest, CreateEventTypeRequest, EventType, Owner, Slot } from './types';

export const calendarService = {
  getOwner(): Promise<Owner> {
    return apiClient.getOwner();
  },

  listEventTypes(): Promise<EventType[]> {
    return apiClient.listEventTypes();
  },

  listAdminEventTypes(): Promise<EventType[]> {
    return apiClient.listAdminEventTypes();
  },

  getEventType(eventTypeId: string): Promise<EventType> {
    return apiClient.getEventType(eventTypeId);
  },

  listAdminBookings(): Promise<Booking[]> {
    return apiClient.listAdminBookings();
  },

  listEventTypeSlots(eventType: EventType): Promise<Slot[]> {
    return apiClient.listEventTypeSlots(eventType.id);
  },

  createBooking(payload: CreateBookingRequest, _eventType: EventType): Promise<Booking> {
    return apiClient.createBooking(payload);
  },

  createAdminEventType(payload: CreateEventTypeRequest): Promise<EventType> {
    return apiClient.createAdminEventType(payload);
  },

  deleteAdminEventType(eventTypeId: string): Promise<void> {
    return apiClient.deleteAdminEventType(eventTypeId);
  },
};
