import express from 'express'
import { validate, handleOrderFileData } from '../bin1/controllers/GenrateOrderFile.js'

const router = express.Router()

router.post('/validate', validate);
router.post('/orderFile', handleOrderFileData);

export default router;