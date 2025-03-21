import { getkycNumberCount, getphoneNumberCount } from './upload/controllers/kycNumberCount.js';
import { uploadKyc, uploadNum } from './upload/controllers/uploadKycController.js';
import upload from '../middleware/multerConfig.js';
import express from 'express';
const router = express.Router();    

router.get('/countPKyc', getkycNumberCount);
router.get('/countPPhone', getphoneNumberCount);
router.post('/uploadPKyc', upload.single('file'), uploadKyc);
router.post('/uploadPNum', upload.single('file'), uploadNum);

export default router;


