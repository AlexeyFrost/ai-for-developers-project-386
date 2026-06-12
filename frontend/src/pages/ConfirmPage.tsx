import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Group, Loader, Paper, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ApiRequestError } from '../api/client';
import { calendarService } from '../api/calendarService';
import type { CreateBookingRequest, EventType, Owner } from '../api/types';
import { formatIsoDate, formatTimeWithDuration } from '../utils/date';

interface SubmittedBooking {
  payload: CreateBookingRequest;
  eventType: EventType;
}

function getBookingErrorMessage(error: unknown): string {
  if (!(error instanceof ApiRequestError)) {
    return 'Не удалось связаться с API';
  }

  if (error.status === 404) return 'Тип записи не найден';
  if (error.status === 409) return 'Слот уже занят';
  if (error.status === 422) return 'Слот вне окна записи или данные невалидны';
  if (!error.status) return 'Не удалось связаться с API';

  return 'API вернул ошибку';
}

export function ConfirmPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const [searchParams] = useSearchParams();
  const startTime = searchParams.get('startTime');
  const [owner, setOwner] = useState<Owner | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNote, setGuestNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] = useState<SubmittedBooking | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(guestName.trim() && guestEmail.trim() && eventTypeId && startTime && eventType);
  }, [eventType, eventTypeId, guestEmail, guestName, startTime]);

  useEffect(() => {
    if (!eventTypeId || !startTime) {
      setIsLoading(false);
      return;
    }
    const id = eventTypeId;

    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [ownerData, eventTypeData] = await Promise.all([calendarService.getOwner(), calendarService.getEventType(id)]);

        if (!isMounted) return;
        setOwner(ownerData);
        setEventType(eventTypeData);
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof ApiRequestError && error.status === 404 ? 'Тип записи не найден' : 'Не удалось загрузить данные бронирования');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [eventTypeId, startTime]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || !eventTypeId || !startTime || !eventType) return;

    const payload: CreateBookingRequest = {
      eventTypeId,
      startTime,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
    };

    if (guestNote.trim()) {
      payload.guestNote = guestNote.trim();
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await calendarService.createBooking(payload, eventType);
      setSubmittedBooking({ payload, eventType });
    } catch (error) {
      setSubmitError(getBookingErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!eventTypeId || !startTime) {
    return (
      <Alert color="red">
        Не выбрано время встречи. Вернитесь к выбору слота и попробуйте снова.
      </Alert>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  if (loadError) {
    return <Alert color="red">{loadError}</Alert>;
  }

  if (submittedBooking) {
    const { payload, eventType: bookedEventType } = submittedBooking;

    return (
      <Paper withBorder radius="lg" p="xl">
        <Stack gap="md">
          <Alert color="green" title="Встреча забронирована">
            Мы сохранили детали бронирования.
          </Alert>
          <Title order={2}>{bookedEventType.title}</Title>
          <Text>Дата: {formatIsoDate(payload.startTime)}</Text>
          <Text>Время: {formatTimeWithDuration(payload.startTime, bookedEventType.durationMinutes)}</Text>
          <Text>Имя: {payload.guestName}</Text>
          <Text>Email: {payload.guestEmail}</Text>
          {payload.guestNote ? <Text>Комментарий: {payload.guestNote}</Text> : null}
          <Group>
            <Button component={Link} to="/book">
              Вернуться к записи
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="xl">
      <Paper withBorder radius="lg" p="lg">
        <Stack gap="sm">
          <Text c="dimmed">Подтверждение</Text>
          <Title order={1}>{eventType?.title}</Title>
          <Text>Владелец: {owner?.name}</Text>
          <Text>Дата: {formatIsoDate(startTime)}</Text>
          <Text>Время: {eventType ? formatTimeWithDuration(startTime, eventType.durationMinutes) : ''}</Text>
          <Text>Длительность: {eventType?.durationMinutes} минут</Text>
        </Stack>
      </Paper>

      <Card component="form" onSubmit={handleSubmit} withBorder radius="lg" padding="lg">
        <Stack gap="md">
          <Title order={2}>Ваши данные</Title>
          {submitError ? <Alert color="red">{submitError}</Alert> : null}
          <TextInput label="Имя" value={guestName} onChange={(event) => setGuestName(event.currentTarget.value)} required />
          <TextInput
            label="Email"
            type="email"
            value={guestEmail}
            onChange={(event) => setGuestEmail(event.currentTarget.value)}
            required
          />
          <Textarea
            label="Комментарий"
            value={guestNote}
            onChange={(event) => setGuestNote(event.currentTarget.value)}
            minRows={4}
          />
          <Group justify="flex-end">
            <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
              Забронировать
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
