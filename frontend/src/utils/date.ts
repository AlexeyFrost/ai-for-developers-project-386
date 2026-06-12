import type { Slot } from '../api/types';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getIsoDateKey(value: string): string {
  return value.slice(0, 10);
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return formatDate(new Date(year, month - 1, day));
}

export function formatIsoDate(value: string): string {
  return formatDateKey(getIsoDateKey(value));
}

export function formatIsoTime(value: string): string {
  return value.slice(11, 16);
}

export function formatSlotRange(slot: Slot): string {
  return `${formatIsoTime(slot.startTime)}–${formatIsoTime(slot.endTime)}`;
}

export function formatTimeWithDuration(startTime: string, durationMinutes: number): string {
  const [datePart, timeAndZone] = startTime.split('T');
  const [hours, minutes] = timeAndZone.slice(0, 5).split(':').map(Number);
  const [year, month, day] = datePart.split('-').map(Number);
  const end = new Date(year, month - 1, day, hours, minutes + durationMinutes);

  return `${formatIsoTime(startTime)}–${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

export function isInBookingWindow(date: Date): boolean {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = startOfToday();
  const lastAvailableDay = addDays(today, 13);

  return day >= today && day <= lastAvailableDay;
}
