import internalRoutes from './internal/subRoutes.js';
import { authenticate } from './middleware/authUser.js'
import authRoutes from './auth/subRoutes.js';
import testRoute from './bins/bin1/subroutes.js';
import express from 'express';

const app = express();

app.use('/internal',authenticate ,internalRoutes);
app.use('/auth', authRoutes);
app.use('/', testRoute);

export default app;
