import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateRegistration, validateLogin } from '../middleware/validation.middleware';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

export default router; 