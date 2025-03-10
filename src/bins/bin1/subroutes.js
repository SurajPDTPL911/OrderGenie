import express from 'express'
import { validate } from '../bin1/controllers/generateOrderFile.js'

const router = express.Router()

router.post('/validate', validate);

export default router;