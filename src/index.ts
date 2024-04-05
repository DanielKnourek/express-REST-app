import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import customer from '@/utils/customer';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
  customer.createCustomer({display_name: 'UK secret service'})
  .then((result) => {
    console.log("result", result);
  });
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
