import cors from 'cors';
import express from 'express';
import { errorHandler, notFound } from './errors';
import { router } from './routes';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  }),
);
app.use(express.json());
app.use(router);
app.use((_req, _res, next) => {
  next(notFound('Маршрут не найден'));
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Calendar backend is running at http://localhost:${port}`);
});
