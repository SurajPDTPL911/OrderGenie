import { getkycNumberCount, getphoneNumberCount } from './upload/controllers/kycNumberCount.js';
import { uploadKyc, uploadNum } from './upload/controllers/uploadKycController.js';
import upload from '../middleware/multerConfig.js';
import express from 'express';
import { addBin } from './bin/controller/generateBinController.js';
import { validate } from './validation/controller/validationController.js'

const router = express.Router();    

router.get('/countPKyc', getkycNumberCount);
router.get('/countPPhone', getphoneNumberCount);
router.post('/uploadPKyc', upload.single('file'), uploadKyc);
router.post('/uploadPNum', upload.single('file'), uploadNum);
router.post('/addBin', addBin);
router.post('/validate', validate);

export default router;


