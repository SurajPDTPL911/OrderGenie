import { getkycNumberCount, getphoneNumberCount } from './upload/controllers/kycNumberCount.js';
import { uploadKyc, uploadNum, sseController } from './upload/controllers/uploadKycController.js';
import upload from '../middleware/multerConfig.js';
import express from 'express';
const router = express.Router();    

router.get('/countPKyc', getkycNumberCount);
router.get('/countPPhone', getphoneNumberCount);
router.post('/uploadPKyc', upload.single('file'), uploadKyc);
router.post('/uploadPNum', upload.single('file'), uploadNum);
router.get('/sse', sseController);

export default router;


