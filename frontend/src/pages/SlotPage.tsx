import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Group, Loader, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { DatePicker, type DayProps } from '@mantine/dates';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestError } from '../api/client';
import { calendarService } from '../api/calendarService';
import type { EventType, Owner, Slot } from '../api/types';
import {
  addDays,
  formatDate,
  formatSlotRange,
  getIsoDateKey,
  isInBookingWindow,
  startOfToday,
  toDateKey,
} from '../utils/date';

type CalendarDayProps = Omit<Partial<DayProps>, 'classNames' | 'styles' | 'vars'>;

function getCalendarDayProps(date: Date): CalendarDayProps {
  return {
    'data-testid': 'calendar-day',
    'data-date': toDateKey(date),
  } as unknown as CalendarDayProps;
}

export function SlotPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();
  const today = useMemo(() => startOfToday(), []);
  const lastAvailableDay = useMemo(() => addDays(today, 13), [today]);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventTypeId) return;
    const id = eventTypeId;

    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [ownerData, eventTypeData] = await Promise.all([calendarService.getOwner(), calendarService.getEventType(id)]);
        const slotData = await calendarService.listEventTypeSlots(eventTypeData);

        if (!isMounted) return;
        setOwner(ownerData);
        setEventType(eventTypeData);
        setSlots(slotData);
      } catch (error) {
        if (isMounted) setError(error instanceof ApiRequestError && error.status === 404 ? 'Тип записи не найден' : 'Не удалось загрузить слоты');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [eventTypeId]);

  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : '';
  const visibleSlots = slots
    .filter((slot) => slot.status === 'available' && getIsoDateKey(slot.startTime) === selectedDateKey)
    .sort((left, right) => left.startTime.localeCompare(right.startTime));

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleContinue = () => {
    if (!eventTypeId || !selectedSlot) return;

    const search = new URLSearchParams({ startTime: selectedSlot.startTime });
    navigate(`/book/${eventTypeId}/confirm?${search.toString()}`);
  };

  if (!eventTypeId) {
    return <Alert color="red">Тип записи не найден</Alert>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Alert color="red">{error}</Alert>;
  }

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Paper withBorder radius="lg" p="lg" className="booking-panel">
          <Stack gap="md">
            <Text c="dimmed">Встреча</Text>
            <Title order={2}>{eventType?.title}</Title>
            <Text>{owner?.name}</Text>
            <Stack gap={4}>
              <Text fw={600}>Дата</Text>
              <Text>{selectedDate ? formatDate(selectedDate) : 'Не выбрана'}</Text>
            </Stack>
            <Stack gap={4}>
              <Text fw={600}>Время</Text>
              <Text>{selectedSlot ? formatSlotRange(selectedSlot) : 'Не выбрано'}</Text>
            </Stack>
          </Stack>
        </Paper>

        <Paper withBorder radius="lg" p="lg" className="booking-panel calendar-panel">
          <Stack gap="md">
            <Title order={3}>Выберите дату</Title>
            <DatePicker
              data-testid="calendar-panel"
              value={selectedDate}
              onChange={handleDateChange}
              minDate={today}
              maxDate={lastAvailableDay}
              excludeDate={(date) => !isInBookingWindow(date)}
              getDayProps={getCalendarDayProps}
              highlightToday
            />
          </Stack>
        </Paper>

        <Paper withBorder radius="lg" p="lg" className="booking-panel booking-slots-panel">
          <Stack gap="md" className="booking-slots-panel__content">
            <Title order={3}>Выберите время</Title>
            {visibleSlots.length === 0 ? (
              <Alert color="gray">На выбранную дату нет слотов</Alert>
            ) : (
              <Stack gap="sm" className="booking-slots-panel__list">
                {visibleSlots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;

                  return (
                    <Card
                      key={slot.startTime}
                      component="button"
                      type="button"
                      data-testid="slot-card"
                      data-slot-start={slot.startTime}
                      data-slot-status={slot.status}
                      withBorder
                      radius="md"
                      padding="md"
                      className={isSelected ? 'slot-card slot-card--selected' : 'slot-card'}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Group justify="space-between">
                        <Text fw={600}>{formatSlotRange(slot)}</Text>
                        <Badge color="green" variant="light">Свободно</Badge>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Paper>
      </SimpleGrid>

      <Group justify="flex-end">
        <Button size="lg" disabled={!selectedSlot} onClick={handleContinue}>
          Продолжить
        </Button>
      </Group>
    </Stack>
  );
}
