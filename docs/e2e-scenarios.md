# E2E Scenarios

This document describes the main frontend and backend integration scenarios covered by Playwright tests.

## Successful Booking Flow

The test should cover the primary successful booking path:

1. The user opens the application.
2. The user follows the `Записаться` link.
3. The user sees the owner `Alexey Morozov`.
4. The user sees the available event type `Встреча 30 минут`.
5. The user opens the date and time selection page.
6. The user sees the calendar and the list of available slots.
7. The user selects an available free slot.
8. The user clicks `Продолжить`.
9. The user reaches the confirmation page.
10. The user fills in their name.
11. The user fills in their email.
12. The user fills in a comment.
13. The user clicks `Забронировать`.
14. The user sees a successful booking message.
15. The user opens `Админка`.
16. The user sees the created booking in the upcoming bookings list.

Expected result:

- The booking is created successfully.
- The booking details are visible in the admin area.
- The frontend and backend work together through the real API.

## Booked Slot Flow

The test should verify that an already booked slot cannot be booked again:

1. The user creates a booking for an available free slot.
2. After the booking is created, that slot becomes booked.
3. When trying to book the same slot again, the application shows that the slot is unavailable, or the backend returns an availability error.
4. The user cannot create a second booking for the same time interval.

Expected result:

- Booking the same slot twice is not possible.
- The backend enforces the occupied-slot business rule.
- The frontend correctly displays the occupied slot state or the error.

## Playwright Notes

- Tests should run the real frontend and the real backend.
- Prism mock API should not be used for E2E tests.
- The backend stores data in memory, so each test should account for a clean state after the backend restarts.
- Tests should select an available slot from the UI instead of hardcoding an arbitrary time.
- Assertions should use visible user behavior instead of reading internal backend data directly.
