import express from 'express'
import { validate } from '../bin1/controllers/GenrateOrderFile.js'
import { addToBinKycIndex } from './services/ValidateOrderFileService.js';

const router = express.Router()

router.post('/validate', validate);
router.post('/addBinKycIndex', addToBinKycIndex);

export default router;