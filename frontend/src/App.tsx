import { Container } from '@mantine/core';
import { Route, Routes } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { AdminPage } from './pages/AdminPage';
import { BookPage } from './pages/BookPage';
import { ConfirmPage } from './pages/ConfirmPage';
import { HomePage } from './pages/HomePage';
import { SlotPage } from './pages/SlotPage';

export default function App() {
  return (
    <>
      <AppHeader />
      <Container size="lg" component="main" className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/book/:eventTypeId" element={<SlotPage />} />
          <Route path="/book/:eventTypeId/confirm" element={<ConfirmPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Container>
    </>
  );
}
