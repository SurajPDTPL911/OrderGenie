import internalRoutes from './internal/subRoutes.js';
import express from 'express';

const app = express();

app.use('/internal', internalRoutes);

export default app;
