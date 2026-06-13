import { Router } from 'express';
import { conflict, notFound, validationError } from './errors';
import {
  createBooking,
  createEventType,
  deleteEventType,
  getEventType,
  listAllBookings,
  listEventTypes,
  listUpcomingBookings,
  owner,
} from './store';
import {
  buildSlots,
  findGeneratedSlotByStartTime,
  isInsideBookingWindow,
  isInsideWorkingHours,
  isValidIsoDateTime,
} from './slots';
import type { CreateBookingRequest, CreateEventTypeRequest } from './types';

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequiredString(body: Record<string, unknown>, field: string, details: string[]): string {
  const value = body[field];
  if (typeof value !== 'string' || value.trim() === '') {
    details.push(`${field} is required`);
    return '';
  }

  return value.trim();
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateCreateEventTypeRequest(body: unknown): CreateEventTypeRequest {
  if (!isRecord(body)) {
    throw validationError('Тело запроса должно быть JSON-объектом');
  }

  const details: string[] = [];
  const title = readRequiredString(body, 'title', details);
  const description = readRequiredString(body, 'description', details);
  const durationMinutes = body.durationMinutes;

  if (typeof durationMinutes !== 'number' || !Number.isInteger(durationMinutes) || durationMinutes <= 0 || durationMinutes > 9 * 60) {
    details.push('durationMinutes must be a positive integer up to 540');
  }

  if (details.length > 0) {
    throw validationError('Тип записи невалиден', details);
  }

  return {
    title,
    description,
    durationMinutes: durationMinutes as number,
  };
}

function validateCreateBookingRequest(body: unknown): CreateBookingRequest {
  if (!isRecord(body)) {
    throw validationError('Тело запроса должно быть JSON-объектом');
  }

  const details: string[] = [];
  const eventTypeId = readRequiredString(body, 'eventTypeId', details);
  const guestName = readRequiredString(body, 'guestName', details);
  const guestEmail = readRequiredString(body, 'guestEmail', details);
  const startTime = readRequiredString(body, 'startTime', details);
  const guestNoteValue = body.guestNote;
  const guestNote = typeof guestNoteValue === 'string' && guestNoteValue.trim() ? guestNoteValue.trim() : undefined;

  if (guestEmail && !isEmail(guestEmail)) {
    details.push('guestEmail must be a valid email address');
  }

  if (startTime && !isValidIsoDateTime(startTime)) {
    details.push('startTime must be a valid ISO 8601 date-time');
  }

  if (guestNoteValue !== undefined && typeof guestNoteValue !== 'string') {
    details.push('guestNote must be a string');
  }

  if (details.length > 0) {
    throw validationError('Бронирование невалидно', details);
  }

  return {
    eventTypeId,
    guestName,
    guestEmail,
    ...(guestNote ? { guestNote } : {}),
    startTime,
  };
}

router.get('/owner', (_req, res) => {
  res.json(owner);
});

router.get('/event-types', (_req, res) => {
  res.json(listEventTypes());
});

router.get('/event-types/:eventTypeId', (req, res, next) => {
  const eventType = getEventType(req.params.eventTypeId);
  if (!eventType) {
    next(notFound('Тип записи не найден'));
    return;
  }

  res.json(eventType);
});

router.get('/event-types/:eventTypeId/slots', (req, res, next) => {
  const eventType = getEventType(req.params.eventTypeId);
  if (!eventType) {
    next(notFound('Тип записи не найден'));
    return;
  }

  res.json(buildSlots(eventType, listAllBookings()));
});

router.post('/bookings', (req, res, next) => {
  try {
    const payload = validateCreateBookingRequest(req.body);
    const eventType = getEventType(payload.eventTypeId);

    if (!eventType) {
      throw notFound('Тип записи не найден');
    }

    if (!isInsideBookingWindow(payload.startTime)) {
      throw validationError('Слот вне 14-дневного окна записи');
    }

    if (!isInsideWorkingHours(payload.startTime, eventType.durationMinutes)) {
      throw validationError('Слот вне рабочего времени 09:00-18:00');
    }

    const bookings = listAllBookings();
    const slot = findGeneratedSlotByStartTime(eventType, bookings, payload.startTime);

    if (!slot) {
      throw validationError('Слот не совпадает с расписанием выбранного типа записи');
    }

    if (slot.status === 'booked') {
      throw conflict('Слот уже занят');
    }

    res.status(201).json(createBooking(payload, eventType, slot.endTime));
  } catch (error) {
    next(error);
  }
});

router.get('/admin/event-types', (_req, res) => {
  res.json(listEventTypes());
});

router.post('/admin/event-types', (req, res, next) => {
  try {
    const payload = validateCreateEventTypeRequest(req.body);
    res.status(201).json(createEventType(payload));
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/event-types/:eventTypeId', (req, res, next) => {
  if (!deleteEventType(req.params.eventTypeId)) {
    next(notFound('Тип записи не найден'));
    return;
  }

  res.status(204).send();
});

router.get('/admin/bookings', (_req, res) => {
  res.json(listUpcomingBookings());
});

export { router };
