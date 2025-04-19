import express from 'express';
import { uploadRecord, getRecords } from '../controllers/medicalRecords';

const router = express.Router();

router.post('/upload', uploadRecord);
router.get('/:patientAddress', getRecords);

export default router;