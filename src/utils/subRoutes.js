import express from 'express';
import { addCardNetwork, addCardBank, addCardVendor, addToBinKycIndex } from './utils.js';

const router = express.Router();

router.post("/addNetwork", addCardNetwork);
router.post("/addBank", addCardBank);
router.post("/addVendor", addCardVendor);
router.post('/addBinKycIndex', addToBinKycIndex);

export default router;