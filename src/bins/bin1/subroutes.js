import express from 'express'
import { handleOrderFileData } from './controllers/handleOrderFile.js'
import { displayData } from './controllers/displayOrderFile.js';
import { generateExcelFile } from './controllers/generateExcel.js'

const router = express.Router()

router.post('/orderFile', handleOrderFileData);
router.get('/displayData', displayData);
router.post('/download', generateExcelFile);

export default router;