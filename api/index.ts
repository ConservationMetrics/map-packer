import express, { Request, Response } from 'express';

import setupDatabaseConnection from './database/dbConnection';
import fetchData from './database/dbOperations';
import { checkAuthStrategy } from './middleware';
import { getLogin, postLogin } from './loginController';

import { DATABASE, DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_SSL, DB_TABLE } from './config';

const app = express();

app.use(express.json());

app.get('/login', getLogin);
app.post('/login', postLogin);

// Apply middleware to routes
app.use(checkAuthStrategy);

const db = setupDatabaseConnection(
  DATABASE, 
  DB_HOST, 
  DB_USER, 
  DB_PASSWORD, 
  DB_PORT, 
  DB_SSL
);


app.get('/data', async (_req: Request, res: Response) => {
  try {
    // Fetch data
    const { data } = await fetchData(db, DB_TABLE);
    res.json(data);
  } catch (error:any) {
    console.error('Error fetching data on API side:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default {
  path: '/api',
  handler: app
};
