import express from 'express';
import { registerUser } from '../controllers/user.register.js';


const router = express.Router();

router.post('/register',registerUser);









export default router;