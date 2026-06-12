import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <Paper className="hero-card" radius="xl" p="xl">
      <Stack gap="lg" maw={720}>
        <Title order={1}>Запись на звонок</Title>
        <Text size="xl" c="dimmed">
          Простой календарь для выбора типа встречи, свободного времени и отправки заявки на звонок.
        </Text>
        <Group>
          <Button component={Link} to="/book" size="lg">
            Записаться
          </Button>
          <Button component={Link} to="/admin" size="lg" variant="light">
            Админка
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
