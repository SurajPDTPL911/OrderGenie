import express from 'express';
import { addCardNetwork, addCardBank, addCardVendor, addToBinKycIndex, addBin } from './utils.js';

const router = express.Router();

router.post("/addNetwork", addCardNetwork);
router.post("/addBank", addCardBank);
router.post("/addVendor", addCardVendor);
router.post('/addBinKycIndex', addToBinKycIndex);
router.post('/addBin', addBin);

export default router;