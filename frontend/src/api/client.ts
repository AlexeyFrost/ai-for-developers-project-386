import type {
  ApiErrorBody,
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  Owner,
  Slot,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

export class ApiRequestError extends Error {
  status?: number;
  body?: ApiErrorBody;

  constructor(message: string, status?: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new ApiRequestError('Не удалось связаться с API');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const hasJsonBody = contentType.includes('application/json');
  const body = hasJsonBody ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const apiError = body as ApiErrorBody | undefined;
    throw new ApiRequestError(apiError?.message ?? 'API вернул ошибку', response.status, apiError);
  }

  return body as T;
}

function post<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  return request<TResponse>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function deleteRequest(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' });
}

export const apiClient = {
  getOwner: () => request<Owner>('/owner'),
  listEventTypes: () => request<EventType[]>('/event-types'),
  getEventType: (eventTypeId: string) => request<EventType>(`/event-types/${eventTypeId}`),
  listEventTypeSlots: (eventTypeId: string) => request<Slot[]>(`/event-types/${eventTypeId}/slots`),
  createBooking: (payload: CreateBookingRequest) => post<Booking, CreateBookingRequest>('/bookings', payload),
  listAdminEventTypes: () => request<EventType[]>('/admin/event-types'),
  createAdminEventType: (payload: CreateEventTypeRequest) =>
    post<EventType, CreateEventTypeRequest>('/admin/event-types', payload),
  deleteAdminEventType: (eventTypeId: string) => deleteRequest(`/admin/event-types/${eventTypeId}`),
  listAdminBookings: () => request<Booking[]>('/admin/bookings'),
};
