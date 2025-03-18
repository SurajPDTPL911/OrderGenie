import express from 'express'
import { handleOrderFileData } from './controllers/handleOrderFile.js'
import { displayData } from './controllers/displayOrderFile.js';
import { generateExcel } from './services/generateOrderFileService.js'

const router = express.Router()

router.post('/orderFile', handleOrderFileData);
router.get('/displayData', displayData);
router.post('/testExcel', generateExcel);

export default router;