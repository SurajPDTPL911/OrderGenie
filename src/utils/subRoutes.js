import express from 'express';
import { addCardNetwork, addCardBank, addCardVendor, addToBinKycIndex, addBin } from './utils.js';
import { sseController } from '../internal/upload/controllers/uploadKycController.js';

const router = express.Router();

router.post("/addNetwork", addCardNetwork);
router.post("/addBank", addCardBank);
router.post("/addVendor", addCardVendor);
router.post('/addBinKycIndex', addToBinKycIndex);
router.post('/addBin', addBin);
router.get('/sse', sseController);

export default router;