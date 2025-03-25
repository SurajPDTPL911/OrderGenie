import internalRoutes from './internal/subRoutes.js';
import utilRoutes from './utils/subRoutes.js'
import { authenticate } from './middleware/authUser.js'
import authRoutes from './auth/subRoutes.js';
import binRouts from './bins/bin1/subroutes.js';
import express from 'express';

const app = express();

app.use('/util', utilRoutes);
app.use('/auth', authRoutes);
app.use('/internal', authenticate, internalRoutes);
app.use('/bin', authenticate, binRouts);


export default app;
