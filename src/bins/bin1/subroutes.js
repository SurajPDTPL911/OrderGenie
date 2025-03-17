import express from 'express'
import { handleOrderFileData } from './controllers/handleOrderFile.js'

const router = express.Router()

router.post('/orderFile', handleOrderFileData);

export default router;