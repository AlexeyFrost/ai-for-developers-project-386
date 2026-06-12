import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{
  title: "Call Booking API",
})
@server("https://api.example.com", "Default API endpoint")
@doc("API contract for scheduling calls with a single calendar owner.")
namespace CallBooking;

@doc("Public information about the calendar owner.")
model Owner {
  @doc("Unique owner identifier.")
  id: string;

  @doc("Display name of the calendar owner.")
  name: string;

  @doc("Optional public description shown on the booking page.")
  description?: string;

  @doc("IANA timezone name used to interpret working hours, for example Europe/Moscow.")
  timezone: string;
}

@doc("A type of event that can be booked by a guest.")
model EventType {
  @doc("Unique event type identifier.")
  id: string;

  @doc("Event type title shown to guests.")
  title: string;

  @doc("Event type description shown to guests.")
  description: string;

  @doc("Event duration in minutes. Slot length is derived from this value.")
  durationMinutes: int32;
}

@doc("Slot availability status.")
enum SlotStatus {
  @doc("The slot can be booked.")
  available: "available",

  @doc("The slot overlaps an existing booking and cannot be booked.")
  booked: "booked",
}

@doc("A potential booking interval for a selected event type.")
model Slot {
  @doc("Slot start time as an ISO 8601 date-time.")
  startTime: offsetDateTime;

  @doc("Slot end time as an ISO 8601 date-time.")
  endTime: offsetDateTime;

  @doc("Current slot availability.")
  status: SlotStatus;
}

@doc("A confirmed booking.")
model Booking {
  @doc("Unique booking identifier.")
  id: string;

  @doc("Selected event type.")
  eventType: EventType;

  @doc("Guest display name.")
  guestName: string;

  @doc("Guest email address.")
  @format("email")
  guestEmail: string;

  @doc("Optional note from the guest.")
  guestNote?: string;

  @doc("Booking start time as an ISO 8601 date-time.")
  startTime: offsetDateTime;

  @doc("Booking end time as an ISO 8601 date-time.")
  endTime: offsetDateTime;

  @doc("Booking creation time as an ISO 8601 date-time.")
  createdAt: offsetDateTime;
}

@doc("Input for creating an event type.")
model CreateEventTypeRequest {
  @doc("Event type title shown to guests.")
  title: string;

  @doc("Event type description shown to guests.")
  description: string;

  @doc("Event duration in minutes.")
  durationMinutes: int32;
}

@doc("Input for creating a booking.")
model CreateBookingRequest {
  @doc("Identifier of the selected event type.")
  eventTypeId: string;

  @doc("Guest display name.")
  guestName: string;

  @doc("Guest email address.")
  @format("email")
  guestEmail: string;

  @doc("Optional note from the guest.")
  guestNote?: string;

  @doc("Requested booking start time as an ISO 8601 date-time. The server calculates endTime from the selected event type duration.")
  startTime: offsetDateTime;
}

@doc("Common error response body.")
model ApiError {
  @doc("Stable application error code.")
  code: string;

  @doc("Human-readable error message.")
  message: string;

  @doc("Optional validation or conflict details.")
  details?: string[];
}

@doc("Resource was not found.")
@error
model NotFoundResponse {
  @statusCode
  statusCode: 404;

  @body
  body: ApiError;
}

@doc("Requested slot is already booked or overlaps an existing booking interval.")
@error
model ConflictResponse {
  @statusCode
  statusCode: 409;

  @body
  body: ApiError;
}

@doc("Request data is invalid or the requested slot is outside the 14-day booking window.")
@error
model ValidationErrorResponse {
  @statusCode
  statusCode: 422;

  @body
  body: ApiError;
}

@doc("Successful event type creation response.")
model CreatedEventTypeResponse {
  @statusCode
  statusCode: 201;

  @body
  body: EventType;
}

@doc("Successful booking creation response.")
model CreatedBookingResponse {
  @statusCode
  statusCode: 201;

  @body
  body: Booking;
}

@doc("Get public information about the calendar owner.")
@route("/owner")
@get
op getOwner(): Owner;

@doc("Get event types available to guests.")
@route("/event-types")
@get
op listEventTypes(): EventType[];

@doc("Get one event type by identifier.")
@route("/event-types/{eventTypeId}")
@get
op getEventType(
  @doc("Event type identifier.")
  @path
  eventTypeId: string,
): EventType | NotFoundResponse;

@doc("Get slots for the selected event type for the next 14 days from the current date. Slots are generated from the event type duration during the owner's working hours, 09:00-18:00 by default, in Owner.timezone. The response includes both available and booked slots.")
@route("/event-types/{eventTypeId}/slots")
@get
op listEventTypeSlots(
  @doc("Event type identifier.")
  @path
  eventTypeId: string,
): Slot[] | NotFoundResponse;

@doc("Create a booking for a free slot. The server calculates endTime from the selected event type duration. A booking cannot be created if its interval overlaps any existing booking, even for a different event type.")
@route("/bookings")
@post
op createBooking(
  @body
  request: CreateBookingRequest,
): CreatedBookingResponse | NotFoundResponse | ConflictResponse | ValidationErrorResponse;

@doc("Create an event type in the owner admin area. No authentication is modeled in this contract.")
@route("/admin/event-types")
@post
op createAdminEventType(
  @body
  request: CreateEventTypeRequest,
): CreatedEventTypeResponse | ValidationErrorResponse;

@doc("Get all event types in the owner admin area. No authentication is modeled in this contract.")
@route("/admin/event-types")
@get
op listAdminEventTypes(): EventType[];

@doc("Get upcoming bookings across all event types in the owner admin area, sorted by startTime in ascending order. No authentication is modeled in this contract.")
@route("/admin/bookings")
@get
op listAdminBookings(): Booking[];
