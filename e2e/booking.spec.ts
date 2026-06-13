import { expect, test, type Locator, type Page } from '@playwright/test';

const eventTitle = 'Встреча 30 минут';

interface SelectedSlot {
  label: string;
  startTime: string;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function getMoscowDateKey(dayOffset: number): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Moscow',
    year: 'numeric',
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const today = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12));
  today.setUTCDate(today.getUTCDate() + dayOffset);

  return `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`;
}

async function openEventTypeSlotPage(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('link', { name: 'Записаться' }).first().click();

  await expect(page.getByRole('heading', { name: 'Alexey Morozov' })).toBeVisible();

  const eventTypeLink = page.getByRole('link', { name: new RegExp(eventTitle) });
  await expect(eventTypeLink).toBeVisible();
  await eventTypeLink.click();

  await expect(page.getByRole('heading', { name: eventTitle })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Выберите дату' })).toBeVisible();
  await expect(page.getByTestId('calendar-panel')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Свободное время' })).toBeVisible();
}

async function selectDate(page: Page, dateKey: string): Promise<void> {
  await page.locator(`[data-testid="calendar-day"][data-date="${dateKey}"]`).click();
}

async function getSlotLabel(slot: Locator): Promise<string> {
  const text = await slot.textContent();
  const match = text?.match(/\d{2}:\d{2}–\d{2}:\d{2}/);

  if (!match) {
    throw new Error('Selected slot label was not found');
  }

  return match[0];
}

async function selectFirstAvailableSlot(page: Page): Promise<SelectedSlot> {
  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    if (dayOffset > 0) {
      await selectDate(page, getMoscowDateKey(dayOffset));
    }

    const slot = page.getByTestId('slot-card').filter({ hasText: 'Свободно' }).first();

    if (await slot.isVisible()) {
      await expect(slot).toBeEnabled();

      const startTime = await slot.getAttribute('data-slot-start');
      if (!startTime) {
        throw new Error('Selected slot start time was not found');
      }

      const label = await getSlotLabel(slot);
      await slot.click();

      return { label, startTime };
    }
  }

  throw new Error('Available slot was not found in the booking window');
}

async function createBooking(page: Page, guestName: string, guestEmail: string, guestNote: string): Promise<SelectedSlot> {
  await openEventTypeSlotPage(page);

  const selectedSlot = await selectFirstAvailableSlot(page);
  await page.getByRole('button', { name: 'Продолжить' }).click();

  await expect(page.getByRole('heading', { name: 'Ваши данные' })).toBeVisible();
  await expect(page.getByText(`Время: ${selectedSlot.label}`)).toBeVisible();

  await page.getByLabel('Имя').fill(guestName);
  await page.getByLabel('Email').fill(guestEmail);
  await page.getByLabel('Комментарий').fill(guestNote);
  await page.getByRole('button', { name: 'Забронировать' }).click();

  await expect(page.getByText('Встреча забронирована')).toBeVisible();
  await expect(page.getByText('Мы сохранили детали бронирования.')).toBeVisible();

  return selectedSlot;
}

test.describe.configure({ mode: 'serial' });

test('user can book a meeting and see it in admin bookings', async ({ page }) => {
  const guestName = 'E2E Successful Guest';
  const guestEmail = 'successful.guest@example.com';
  const guestNote = 'Комментарий из e2e-теста успешного бронирования';

  await createBooking(page, guestName, guestEmail, guestNote);

  await page.getByRole('link', { name: 'Админка' }).click();

  await expect(page.getByRole('heading', { name: 'Админка' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Предстоящие бронирования' })).toBeVisible();

  const bookingRow = page.getByRole('row').filter({ hasText: guestName }).filter({ hasText: guestEmail });
  await expect(bookingRow).toContainText(eventTitle);
  await expect(bookingRow).toContainText(guestNote);
});

test('booked slot is not available for another booking', async ({ page }) => {
  const guestName = 'E2E Busy Slot Guest';
  const guestEmail = 'busy.slot@example.com';
  const guestNote = 'Комментарий из e2e-теста занятого слота';

  const selectedSlot = await createBooking(page, guestName, guestEmail, guestNote);

  await page.getByRole('link', { name: 'Вернуться к записи' }).click();
  await page.getByRole('link', { name: new RegExp(eventTitle) }).click();
  await selectDate(page, selectedSlot.startTime.slice(0, 10));

  const bookedSlot = page.locator(`[data-testid="slot-card"][data-slot-start="${selectedSlot.startTime}"]`);
  await expect(bookedSlot).toContainText(selectedSlot.label);
  await expect(bookedSlot).toContainText('Занято');
  await expect(bookedSlot).toBeDisabled();
});
