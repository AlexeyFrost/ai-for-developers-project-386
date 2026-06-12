import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { calendarService } from '../api/calendarService';
import type { EventType, Owner } from '../api/types';

export function BookPage() {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [ownerData, eventTypeData] = await Promise.all([calendarService.getOwner(), calendarService.listEventTypes()]);

        if (!isMounted) return;
        setOwner(ownerData);
        setEventTypes(eventTypeData);
      } catch {
        if (isMounted) setError('Не удалось загрузить данные для записи');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Alert color="red">{error}</Alert>;
  }

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Text c="dimmed">Календарь владельца</Text>
        <Title order={1}>{owner?.name}</Title>
        {owner?.description ? <Text size="lg">{owner.description}</Text> : null}
      </Stack>

      {eventTypes.length === 0 ? (
        <Alert color="gray">Типы записей пока не настроены</Alert>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {eventTypes.map((eventType) => (
            <Card
              key={eventType.id}
              component={Link}
              to={`/book/${eventType.id}`}
              className="event-card"
              radius="lg"
              padding="lg"
              withBorder
            >
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <Title order={3}>{eventType.title}</Title>
                  <Badge variant="light">{eventType.durationMinutes} минут</Badge>
                </Group>
                <Text c="dimmed">{eventType.description}</Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
