import express from 'express';
import { signinHandler, signupHandler } from '../controller/auth.js';

const router = express.Router();

router.post('/signin', signinHandler);
router.post('/signup', signupHandler);
// router.put('/password-update', updatePasswordHandler); // TODO: implement later

export default router;