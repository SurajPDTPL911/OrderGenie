import { kycNumberCount, phoneNumberCount } from './upload/controllers/kycNumberCount.js';
import express from 'express';

const router = express.Router();    

router.get('/countKyc', kycNumberCount);
router.get('/countPhone', phoneNumberCount);

export default router;


