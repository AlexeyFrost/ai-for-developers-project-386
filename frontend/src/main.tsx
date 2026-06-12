import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/ru';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      <DatesProvider settings={{ locale: 'ru', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DatesProvider>
    </MantineProvider>
  </React.StrictMode>,
);
