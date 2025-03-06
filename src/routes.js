import internalRoutes from './internal/subRoutes.js';
import { authenticate } from './middleware/authUser.js'
import authRoutes from './auth/subRoutes.js';
import express from 'express';

const app = express();

app.use('/internal',authenticate ,internalRoutes);
app.use('/auth', authRoutes);

export default app;
