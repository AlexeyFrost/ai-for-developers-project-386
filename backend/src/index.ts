import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { errorHandler, notFound } from './errors';
import { router } from './routes';

const app = express();
const port = Number(process.env.PORT ?? 3001);
const frontendDistDir = path.resolve(__dirname, '../../frontend/dist');
const frontendIndexPath = path.join(frontendDistDir, 'index.html');

const apiPathPrefixes = ['/owner', '/event-types', '/bookings', '/admin/event-types', '/admin/bookings'];

function isApiPath(pathname: string): boolean {
  return apiPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  }),
);
app.use(express.json());
app.use(router);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDistDir));
  app.get('*', (req, res, next) => {
    if (isApiPath(req.path)) {
      next();
      return;
    }

    res.sendFile(frontendIndexPath, (error) => {
      if (error) {
        next(error);
      }
    });
  });
}

app.use((_req, _res, next) => {
  next(notFound('Маршрут не найден'));
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Calendar backend is running at http://localhost:${port}`);
});
