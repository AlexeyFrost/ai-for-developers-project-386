import { Anchor, Container, Group } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';

export function AppHeader() {
  const location = useLocation();
  const isBookActive = location.pathname.startsWith('/book');
  const isAdminActive = location.pathname === '/admin';

  return (
    <header className="app-header">
      <Container size="lg" className="app-header__inner">
        <Anchor component={Link} to="/" className="app-header__logo" underline="never">
          Calendar
        </Anchor>
        <Group gap="xs">
          <Anchor
            component={Link}
            to="/book"
            underline="never"
            className={isBookActive ? 'app-header__link app-header__link--active' : 'app-header__link'}
          >
            Записаться
          </Anchor>
          <Anchor
            component={Link}
            to="/admin"
            underline="never"
            className={isAdminActive ? 'app-header__link app-header__link--active' : 'app-header__link'}
          >
            Админка
          </Anchor>
        </Group>
      </Container>
    </header>
  );
}
