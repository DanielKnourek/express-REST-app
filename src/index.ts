import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import { registerApiRoutes } from '@/api/';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.get('/', (req: Request, res: Response) => {

  res.write('Welcome to Express & TypeScript Server\n');
  res.write('This page is empty, for REST API please visit /api\n');
  res.write('For more information, please visit https://github.com/DanielKnourek/express-REST-app');
  res.status(200).end();
});
registerApiRoutes(app);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

