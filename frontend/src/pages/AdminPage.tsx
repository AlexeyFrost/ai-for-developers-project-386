import { FormEvent, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { calendarService } from '../api/calendarService';
import type { Booking, EventType } from '../api/types';
import { formatIsoDate, formatTimeWithDuration } from '../utils/date';

export function AdminPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingEventTypeId, setDeletingEventTypeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<string | null>('30');

  async function loadAdminData() {
    setIsLoading(true);
    setError(null);

    try {
      const [eventTypeData, bookingData] = await Promise.all([
        calendarService.listAdminEventTypes(),
        calendarService.listAdminBookings(),
      ]);

      setEventTypes(eventTypeData);
      setBookings(bookingData);
    } catch {
      setError('Не удалось загрузить админку');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDurationMinutes('30');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !durationMinutes) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await calendarService.createAdminEventType({
        title: title.trim(),
        description: description.trim(),
        durationMinutes: Number(durationMinutes),
      });
      setSuccessMessage('Тип записи создан');
      resetForm();
      close();
      await loadAdminData();
    } catch {
      setError('Не удалось создать тип записи');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEventType = async (eventType: EventType) => {
    const shouldDelete = window.confirm(
      `Удалить тип записи "${eventType.title}"? Уже созданные бронирования останутся в админке.`,
    );

    if (!shouldDelete) return;

    setDeletingEventTypeId(eventType.id);
    setSuccessMessage(null);
    setError(null);

    try {
      await calendarService.deleteAdminEventType(eventType.id);
      setSuccessMessage('Тип записи удален');
      await loadAdminData();
    } catch {
      setError('Не удалось удалить тип записи');
    } finally {
      setDeletingEventTypeId(null);
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={1}>Админка</Title>
          <Text c="dimmed">Настройка типов записей и просмотр предстоящих встреч.</Text>
        </Stack>
      </Group>

      {successMessage ? <Alert color="green">{successMessage}</Alert> : null}
      {error ? <Alert color="red">{error}</Alert> : null}

      <Paper withBorder radius="lg" p="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>Типы записей</Title>
            <Button onClick={open}>Создать</Button>
          </Group>

          {isLoading ? (
            <Loader />
          ) : eventTypes.length === 0 ? (
            <Alert color="gray">Типы записей пока не настроены</Alert>
          ) : (
            <Stack gap="sm">
              {eventTypes.map((eventType) => (
                <Card key={eventType.id} withBorder radius="md" padding="md">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                      <Text fw={700}>{eventType.title}</Text>
                      <Text c="dimmed">{eventType.description}</Text>
                    </Stack>
                    <Group gap="sm">
                      <Badge variant="light">{eventType.durationMinutes} минут</Badge>
                      <Button
                        color="red"
                        variant="light"
                        size="xs"
                        loading={deletingEventTypeId === eventType.id}
                        onClick={() => handleDeleteEventType(eventType)}
                      >
                        Удалить
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p="lg">
        <Stack gap="md">
          <Title order={2}>Предстоящие бронирования</Title>

          {isLoading ? (
            <Loader />
          ) : bookings.length === 0 ? (
            <Alert color="gray">Предстоящих бронирований пока нет</Alert>
          ) : (
            <Table.ScrollContainer minWidth={820}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Дата</Table.Th>
                    <Table.Th>Время</Table.Th>
                    <Table.Th>Тип записи</Table.Th>
                    <Table.Th>Гость</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Комментарий</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {bookings.map((booking) => (
                    <Table.Tr key={booking.id}>
                      <Table.Td>{formatIsoDate(booking.startTime)}</Table.Td>
                      <Table.Td>{formatTimeWithDuration(booking.startTime, booking.eventType.durationMinutes)}</Table.Td>
                      <Table.Td>{booking.eventType.title}</Table.Td>
                      <Table.Td>{booking.guestName}</Table.Td>
                      <Table.Td>{booking.guestEmail}</Table.Td>
                      <Table.Td>{booking.guestNote || '—'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Stack>
      </Paper>

      <Modal opened={opened} onClose={close} title="Создать тип записи" centered>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput label="Название" value={title} onChange={(event) => setTitle(event.currentTarget.value)} required />
            <Textarea
              label="Описание"
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              required
              minRows={3}
            />
            <Select
              label="Длительность"
              value={durationMinutes}
              onChange={setDurationMinutes}
              data={[
                { value: '15', label: '15 минут' },
                { value: '30', label: '30 минут' },
              ]}
              required
            />
            <Group justify="flex-end">
              <Button variant="light" onClick={close} type="button">
                Отмена
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={!title.trim() || !description.trim() || !durationMinutes}>
                Создать
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
