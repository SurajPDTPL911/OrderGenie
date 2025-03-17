import express from 'express'
import { handleOrderFileData } from './controllers/handleOrderFile.js'
import { displayData } from './controllers/displayOrderFile.js';

const router = express.Router()

router.post('/orderFile', handleOrderFileData);
router.get('/displayData', displayData);

export default router;